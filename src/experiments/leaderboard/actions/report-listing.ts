"use server";

import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, listings, reports } from "@/core/db";
import { fingerprintFromHeaders } from "@/core/security/fingerprint";
import { createId } from "@/lib/utils";
import { leaderboardConfig } from "../config";

const reasons = [
  "illegal",
  "scam",
  "phishing",
  "pornography",
  "hate",
  "malicious",
  "other",
] as const;

const schema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(reasons),
  details: z.string().trim().max(500).optional(),
});

export async function reportListing(input: {
  listingId: string;
  reason: string;
  details?: string;
}) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Datos inválidos." };

  const headerList = await headers();
  const fingerprint = fingerprintFromHeaders(headerList);
  const db = getDb();

  const [listing] = await db
    .select({ id: listings.id })
    .from(listings)
    .where(eq(listings.id, parsed.data.listingId))
    .limit(1);
  if (!listing) return { ok: false as const, error: "No existe." };

  const windowStart = new Date(
    Date.now() - leaderboardConfig.reportRateLimit.windowMs,
  );
  const [rate] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(
      and(
        eq(reports.listingId, parsed.data.listingId),
        eq(reports.fingerprintHash, fingerprint),
        gte(reports.createdAt, windowStart),
      ),
    );
  if ((rate?.count ?? 0) >= leaderboardConfig.reportRateLimit.limit) {
    return { ok: false as const, error: "Ya reportaste esto." };
  }

  await db.insert(reports).values({
    id: createId("rpt"),
    listingId: parsed.data.listingId,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
    fingerprintHash: fingerprint,
  });

  return { ok: true as const };
}
