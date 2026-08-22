"use server";

import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { trackEvent } from "@/core/analytics/track";
import { bids, getDb, listings } from "@/core/db";
import { canSkipPaypal, createPaypalCheckout, paypalEnabled } from "@/core/payments/paypal";
import { fingerprintFromHeaders } from "@/core/security/fingerprint";
import { getRequestAppUrl, createId, dollarsToCents } from "@/lib/utils";
import { leaderboardConfig } from "../config";
import { fetchWebsiteMeta, parseIdentity } from "../identity";
import { fulfillPaidBid } from "./fulfill-bid";

const inputSchema = z.object({
  identifier: z.string().trim().min(1).max(200),
  amountDollars: z.coerce.number().int().min(1).max(100000),
});

export type CheckoutState = {
  ok: false;
  error: string;
  alreadyIn?: boolean;
} | {
  ok: true;
  url: string;
};

function uniqueSlug(base: string, taken: Set<string>) {
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "listing";
  if (!taken.has(cleaned)) return cleaned;
  for (let i = 2; i < 50; i += 1) {
    const candidate = `${cleaned}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${cleaned}-${createId("s")}`;
}

export async function createCheckout(
  _prev: CheckoutState | null,
  formData: FormData,
): Promise<CheckoutState> {
  try {
    return await createCheckoutInner(formData);
  } catch (error) {
    console.error("create_checkout_failed", error);
    return { ok: false, error: humanCheckoutError(error) };
  }
}

function humanCheckoutError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/relation .+ does not exist/i.test(message) || /42P01/.test(message)) {
    return "Falta migrar la base (npm run db:push).";
  }
  if (/PAYPAL_|PayPal/i.test(message)) {
    return "PayPal rechazó el pago. Revisa CLIENT_ID/SECRET y PAYPAL_ENV.";
  }
  if (/ECONNREFUSED|ENOTFOUND|connect/i.test(message)) {
    return "No hay conexión con la base de datos.";
  }
  return "Algo falló al abrir el pago. Inténtalo de una.";
}

async function createCheckoutInner(formData: FormData): Promise<CheckoutState> {
  const parsed = inputSchema.safeParse({
    identifier: formData.get("identifier"),
    amountDollars: formData.get("amountDollars"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Revisa el @usuario y el monto." };
  }
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      error: "Falta la base de datos. Configura DATABASE_URL.",
    };
  }

  const identity = parseIdentity(parsed.data.identifier);
  if (!identity.ok) return { ok: false, error: identity.error };

  const amountCents = dollarsToCents(parsed.data.amountDollars);
  if (amountCents < leaderboardConfig.minBidCents) {
    return { ok: false, error: "El monto mínimo es $1." };
  }
  if (amountCents > leaderboardConfig.maxBidCents) {
    return { ok: false, error: "Ese monto ta muy alto." };
  }

  const headerList = await headers();
  const fingerprint = fingerprintFromHeaders(headerList);
  const db = getDb();

  const windowStart = new Date(
    Date.now() - leaderboardConfig.checkoutRateLimit.windowMs,
  );
  const [rate] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bids)
    .where(
      and(
        eq(bids.fingerprintHash, fingerprint),
        gte(bids.createdAt, windowStart),
      ),
    );
  if ((rate?.count ?? 0) >= leaderboardConfig.checkoutRateLimit.limit) {
    return { ok: false, error: "Demasiados intentos. Espera un rato." };
  }

  const [existing] = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.experimentId, leaderboardConfig.experimentId),
        eq(listings.normalizedIdentifier, identity.identity.normalizedIdentifier),
      ),
    )
    .limit(1);

  if (existing?.moderationStatus === "removed") {
    return { ok: false, error: "Ese perfil no ta disponible." };
  }

  let listingId = existing?.id;
  if (!listingId) {
    const allSlugs = await db.select({ slug: listings.slug }).from(listings);
    const slug = uniqueSlug(
      identity.identity.slugBase,
      new Set(allSlugs.map((row) => row.slug)),
    );

    let description: string | null = null;
    let imageUrl: string | null = null;
    if (identity.identity.identifierType === "website") {
      const meta = await fetchWebsiteMeta(identity.identity.destinationUrl);
      description = meta?.description || meta?.title || null;
      imageUrl = meta?.imageUrl || null;
    }

    listingId = createId("lst");
    await db.insert(listings).values({
      id: listingId,
      experimentId: leaderboardConfig.experimentId,
      slug,
      identifierType: identity.identity.identifierType,
      identifier: identity.identity.identifier,
      normalizedIdentifier: identity.identity.normalizedIdentifier,
      socialNetwork: identity.identity.socialNetwork,
      displayName: identity.identity.displayName,
      destinationUrl: identity.identity.destinationUrl,
      description,
      imageUrl,
    });
  }

  const bidId = createId("bid");
  await db.insert(bids).values({
    id: bidId,
    listingId,
    amountCents,
    currency: leaderboardConfig.currency,
    status: "pending",
    fingerprintHash: fingerprint,
  });

  await trackEvent({
    name: "bid_checkout_started",
    fingerprintHash: fingerprint,
    properties: {
      amountCents,
      listingId,
    },
  });

  const displayName =
    existing?.displayName || identity.identity.displayName;
  const appUrl = getRequestAppUrl(headerList);
  const successUrl = `${appUrl}/checkout/success?bid=${bidId}`;
  const cancelUrl = `${appUrl}/checkout/cancel`;

  if (canSkipPaypal()) {
    await fulfillPaidBid({ bidId });
    return { ok: true, url: successUrl };
  }

  if (!paypalEnabled()) {
    return { ok: false, error: "PayPal no ta configurado todavía." };
  }

  try {
    const checkout = await createPaypalCheckout({
      bidId,
      amountCents,
      currency: leaderboardConfig.currency,
      displayName,
      successUrl,
      cancelUrl,
    });

    await db
      .update(bids)
      .set({ paypalOrderId: checkout.orderId })
      .where(eq(bids.id, bidId));

    return { ok: true, url: checkout.url };
  } catch (error) {
    console.error("paypal_checkout_failed", error);
    return { ok: false, error: humanCheckoutError(error) };
  }
}

export async function lookupIdentity(identifier: string) {
  const identity = parseIdentity(identifier);
  if (!identity.ok) return { ok: false as const, error: identity.error };
  if (!process.env.DATABASE_URL) {
    return {
      ok: true as const,
      exists: false as const,
      displayName: identity.identity.displayName,
    };
  }

  try {
    const db = getDb();
    const [existing] = await db
      .select({
        slug: listings.slug,
        displayName: listings.displayName,
        totalBidCents: listings.totalBidCents,
        moderationStatus: listings.moderationStatus,
      })
      .from(listings)
      .where(
        and(
          eq(listings.experimentId, leaderboardConfig.experimentId),
          eq(
            listings.normalizedIdentifier,
            identity.identity.normalizedIdentifier,
          ),
        ),
      )
      .limit(1);

    if (!existing || existing.moderationStatus === "removed") {
      return {
        ok: true as const,
        exists: false as const,
        displayName: identity.identity.displayName,
      };
    }

    return {
      ok: true as const,
      exists: existing.totalBidCents > 0,
      displayName: existing.displayName,
      slug: existing.slug,
      totalBidCents: existing.totalBidCents,
    };
  } catch (error) {
    console.error("lookup_identity_failed", error);
    return { ok: false as const, error: "No se pudo revisar ese link ahora." };
  }
}
