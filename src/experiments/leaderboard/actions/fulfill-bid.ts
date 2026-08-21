import { revalidatePath, revalidateTag } from "next/cache";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { trackEvent } from "@/core/analytics/track";
import { activities, bids, getDb, listings, type ListingRow } from "@/core/db";
import { createId } from "@/lib/utils";

type DbTx = {
  select: ReturnType<typeof getDb>["select"];
};

async function rankedInTx(tx: DbTx, experimentId: string) {
  return tx
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.experimentId, experimentId),
        eq(listings.moderationStatus, "active"),
        gt(listings.totalBidCents, 0),
      ),
    )
    .orderBy(
      desc(listings.totalBidCents),
      asc(listings.lastPaidAt),
      asc(listings.createdAt),
    );
}

function rankOf(rows: ListingRow[], listingId: string) {
  const index = rows.findIndex((row) => row.id === listingId);
  return index === -1 ? null : index + 1;
}

export async function fulfillPaidBid(input: {
  bidId: string;
  paypalCaptureId?: string | null;
}) {
  const db = getDb();
  const result = await db.transaction(async (tx) => {
    const [bid] = await tx
      .select()
      .from(bids)
      .where(eq(bids.id, input.bidId))
      .for("update")
      .limit(1);

    if (!bid) return { ok: false as const, reason: "missing" };
    if (bid.status === "paid") return { ok: true as const, already: true, bid };
    if (bid.status === "refunded") return { ok: false as const, reason: "refunded" };

    const [listing] = await tx
      .select()
      .from(listings)
      .where(eq(listings.id, bid.listingId))
      .for("update")
      .limit(1);

    if (!listing) return { ok: false as const, reason: "missing-listing" };
    if (listing.moderationStatus === "removed") {
      return { ok: false as const, reason: "removed" };
    }

    const before = await rankedInTx(tx, listing.experimentId);
    const previousRank = rankOf(before, listing.id);
    const previousNumberOne = before[0] ?? null;
    const wasNewListing = previousRank === null;
    const now = new Date();
    const newTotal = listing.totalBidCents + bid.amountCents;

    await tx
      .update(bids)
      .set({
        status: "paid",
        paidAt: now,
        paypalCaptureId: input.paypalCaptureId || bid.paypalCaptureId,
      })
      .where(eq(bids.id, bid.id));

    await tx
      .update(listings)
      .set({
        totalBidCents: newTotal,
        firstPaidAt: listing.firstPaidAt ?? now,
        lastPaidAt: now,
        updatedAt: now,
        moderationStatus:
          listing.moderationStatus === "hidden"
            ? "hidden"
            : "active",
      })
      .where(eq(listings.id, listing.id));

    const after = await rankedInTx(tx, listing.experimentId);
    const newRank = rankOf(after, listing.id);
    const becameNumberOne = newRank === 1 && previousRank !== 1;

    const sharedMeta = {
      displayName: listing.displayName,
      slug: listing.slug,
      previousNumberOneDisplayName: previousNumberOne?.displayName ?? null,
      previousNumberOneSlug: previousNumberOne?.slug ?? null,
      previousAmountCents: previousNumberOne?.totalBidCents ?? null,
      previousListingId: previousNumberOne?.id ?? null,
    };

    await tx.insert(activities).values({
      id: createId("act"),
      experimentId: listing.experimentId,
      type: wasNewListing ? "LISTING_CREATED" : "BID_INCREASED",
      listingId: listing.id,
      previousRank,
      newRank,
      amountCents: newTotal,
      metadata: sharedMeta,
    });

    if (
      previousRank !== newRank &&
      !wasNewListing &&
      !becameNumberOne
    ) {
      await tx.insert(activities).values({
        id: createId("act"),
        experimentId: listing.experimentId,
        type: "RANK_CHANGED",
        listingId: listing.id,
        previousRank,
        newRank,
        amountCents: newTotal,
        metadata: sharedMeta,
      });
    }

    if (becameNumberOne) {
      await tx.insert(activities).values({
        id: createId("act"),
        experimentId: listing.experimentId,
        type: "NEW_NUMBER_ONE",
        listingId: listing.id,
        previousRank,
        newRank: 1,
        amountCents: newTotal,
        metadata: sharedMeta,
      });
    }

    return {
      ok: true as const,
      already: false,
      bid,
      listing,
      newRank,
      newTotal,
      becameNumberOne,
    };
  });

  if (result.ok && !result.already) {
    await trackEvent({
      name: "bid_payment_completed",
      properties: {
        bidId: input.bidId,
        amountCents: result.bid.amountCents,
        rank: result.newRank ?? 0,
      },
    });
    revalidateTag("home", "max");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath(`/p/${result.listing.slug}`);
  }

  return result;
}

export async function markBidFailed(bidId: string) {
  const db = getDb();
  await db
    .update(bids)
    .set({ status: "failed" })
    .where(and(eq(bids.id, bidId), eq(bids.status, "pending")));
}

export async function markBidRefunded(captureId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    const [bid] = await tx
      .select()
      .from(bids)
      .where(eq(bids.paypalCaptureId, captureId))
      .for("update")
      .limit(1);
    if (!bid || bid.status !== "paid") return;

    const [listing] = await tx
      .select()
      .from(listings)
      .where(eq(listings.id, bid.listingId))
      .for("update")
      .limit(1);
    if (!listing) return;

    await tx
      .update(bids)
      .set({ status: "refunded" })
      .where(eq(bids.id, bid.id));
    await tx
      .update(listings)
      .set({
        totalBidCents: Math.max(0, listing.totalBidCents - bid.amountCents),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listing.id));
  });
}
