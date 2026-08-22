import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { activities, bids, clicks, listings, reports } from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

/** Hard-delete a listing and every row that points at it. */
export async function purgeListingById(db: Db, listingId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(reports).where(eq(reports.listingId, listingId));
    await tx.delete(clicks).where(eq(clicks.listingId, listingId));
    await tx.delete(bids).where(eq(bids.listingId, listingId));
    await tx.delete(activities).where(eq(activities.listingId, listingId));
    await tx.delete(listings).where(eq(listings.id, listingId));
  });
}
