import { eq } from "drizzle-orm";
import { bids, getDb, listings } from "@/core/db";
import { getRankedListings } from "@/experiments/leaderboard/queries/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const db = getDb();
  const [bid] = await db.select().from(bids).where(eq(bids.id, id)).limit(1);
  if (!bid) return Response.json({ status: "missing" }, { status: 404 });

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, bid.listingId))
    .limit(1);

  let rank: number | null = null;
  if (bid.status === "paid" && listing) {
    const ranked = await getRankedListings();
    rank = ranked.find((item) => item.id === listing.id)?.rank ?? null;
  }

  return Response.json({
    status: bid.status,
    amountCents: bid.amountCents,
    displayName: listing?.displayName ?? null,
    slug: listing?.slug ?? null,
    rank,
  });
}
