import { and, eq, gte } from "drizzle-orm";
import { trackEvent } from "@/core/analytics/track";
import { clicks, getDb, listings } from "@/core/db";
import { isLikelyBot } from "@/core/security/bots";
import {
  fingerprintFromHeaders,
  getUserAgent,
} from "@/core/security/fingerprint";
import { isSafeHttpUrl } from "@/core/security/urls";
import { leaderboardConfig } from "@/experiments/leaderboard/config";
import { createId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      return new Response("Ese perfil no ta en la tabla.", { status: 404 });
    }
    const { mockSnapshot } = await import(
      "@/experiments/leaderboard/queries/mock-snapshot"
    );
    const listing = mockSnapshot().listings.find((item) => item.slug === slug);
    if (!listing || !isSafeHttpUrl(listing.destinationUrl)) {
      return new Response("Ese perfil no ta en la tabla.", { status: 404 });
    }
    return Response.redirect(listing.destinationUrl, 302);
  }

  const db = getDb();
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.slug, slug))
    .limit(1);

  if (
    !listing ||
    listing.moderationStatus !== "active" ||
    listing.totalBidCents <= 0
  ) {
    return new Response("Ese perfil no ta en la tabla.", { status: 404 });
  }

  if (!isSafeHttpUrl(listing.destinationUrl)) {
    return new Response("Destino bloqueado.", { status: 400 });
  }

  const ua = getUserAgent(request.headers);
  const bot = isLikelyBot(ua);
  const fingerprint = fingerprintFromHeaders(request.headers);
  const since = new Date(Date.now() - leaderboardConfig.clickCooldownMs);

  if (!bot) {
    const [recent] = await db
      .select({ id: clicks.id })
      .from(clicks)
      .where(
        and(
          eq(clicks.listingId, listing.id),
          eq(clicks.fingerprintHash, fingerprint),
          gte(clicks.createdAt, since),
        ),
      )
      .limit(1);

    if (!recent) {
      await db.insert(clicks).values({
        id: createId("clk"),
        listingId: listing.id,
        fingerprintHash: fingerprint,
      });
      await db
        .update(listings)
        .set({
          clickCount: listing.clickCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(listings.id, listing.id));
      await trackEvent({
        name: "listing_clicked",
        fingerprintHash: fingerprint,
        properties: { slug: listing.slug },
      });
    }
  }

  return Response.redirect(listing.destinationUrl, 302);
}
