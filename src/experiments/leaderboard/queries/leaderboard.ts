import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, gt, gte, sql } from "drizzle-orm";
import {
  activities,
  analyticsEvents,
  clicks,
  getDb,
  listings,
  type ListingRow,
} from "@/core/db";
import { formatUsd, timeAgoEs } from "@/lib/utils";
import { leaderboardConfig } from "../config";
import type {
  ActivityItem,
  HomeSnapshot,
  RankedListing,
  TrendingListing,
} from "../types";

function toRanked(row: ListingRow, rank: number): RankedListing {
  return {
    id: row.id,
    slug: row.slug,
    identifierType: row.identifierType,
    identifier: row.identifier,
    normalizedIdentifier: row.normalizedIdentifier,
    socialNetwork: row.socialNetwork,
    displayName: row.displayName,
    destinationUrl: row.destinationUrl,
    description: row.description,
    imageUrl: row.imageUrl,
    totalBidCents: row.totalBidCents,
    clickCount: row.clickCount,
    lastPaidAt: row.lastPaidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    rank,
  };
}

export async function getRankedListings(experimentId = leaderboardConfig.experimentId) {
  const db = getDb();
  const rows = await db
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

  return rows.map((row, index) => toRanked(row, index + 1));
}

export async function getTrending(ranked: RankedListing[]): Promise<TrendingListing[]> {
  if (ranked.length === 0) return [];
  const db = getDb();
  const since = new Date(Date.now() - leaderboardConfig.trendingWindowMs);
  const rows = await db
    .select({
      listingId: clicks.listingId,
      count: sql<number>`count(*)::int`,
    })
    .from(clicks)
    .where(gte(clicks.createdAt, since))
    .groupBy(clicks.listingId)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const byId = new Map(ranked.map((item) => [item.id, item]));
  return rows
    .map((row) => {
      const listing = byId.get(row.listingId);
      if (!listing) return null;
      return {
        slug: listing.slug,
        displayName: listing.displayName,
        clicksPerHour: row.count,
        rank: listing.rank,
      };
    })
    .filter((item): item is TrendingListing => item !== null);
}

function activityMessage(input: {
  type: ActivityItem["type"];
  name: string;
  previousName?: string | null;
  previousRank: number | null;
  newRank: number | null;
  amountCents: number | null;
  createdAt: Date;
}): string {
  const money = input.amountCents ? formatUsd(input.amountCents) : "";
  const when = timeAgoEs(input.createdAt);
  const rank = input.newRank ? `#${input.newRank}` : "la tabla";

  if (input.type === "NEW_NUMBER_ONE") {
    if (input.previousName) {
      return `${input.name} le tumbó el #1 a ${input.previousName} · ${money} · ${when}`;
    }
    return `👑 ${input.name} se cogió el #1 · ${money} · ${when}`;
  }
  if (input.type === "LISTING_CREATED") {
    return `${input.name} se metió en el ${rank} · ${money} · ${when}`;
  }
  if (input.previousRank && input.newRank && input.previousRank !== input.newRank) {
    return `${input.name} subió al ${rank} · ${money} · ${when}`;
  }
  return `${input.name} le subió al monto · ${money} · ${when}`;
}

export async function getRecentActivity(
  experimentId = leaderboardConfig.experimentId,
): Promise<ActivityItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      activity: activities,
      listing: listings,
    })
    .from(activities)
    .leftJoin(listings, eq(activities.listingId, listings.id))
    .where(eq(activities.experimentId, experimentId))
    .orderBy(desc(activities.createdAt))
    .limit(30);

  return rows
    .filter((row) =>
      ["LISTING_CREATED", "BID_INCREASED", "NEW_NUMBER_ONE"].includes(
        row.activity.type,
      ),
    )
    .slice(0, 20)
    .map((row) => {
      const name = row.listing?.displayName || "Alguien";
      const previousName =
        (row.activity.metadata?.previousNumberOneDisplayName as
          | string
          | undefined) || null;
      return {
        id: row.activity.id,
        type: row.activity.type,
        listingSlug: row.listing?.slug ?? null,
        listingDisplayName: row.listing?.displayName ?? null,
        previousRank: row.activity.previousRank,
        newRank: row.activity.newRank,
        amountCents: row.activity.amountCents,
        highlight: row.activity.type === "NEW_NUMBER_ONE",
        createdAt: row.activity.createdAt.toISOString(),
        metadata: row.activity.metadata,
        message: activityMessage({
          type: row.activity.type,
          name,
          previousName,
          previousRank: row.activity.previousRank,
          newRank: row.activity.newRank,
          amountCents: row.activity.amountCents,
          createdAt: row.activity.createdAt,
        }),
      };
    });
}

export async function getLiveStats() {
  const db = getDb();
  const onlineSince = new Date(Date.now() - leaderboardConfig.onlineWindowMs);
  try {
    const [visitRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.name, "page_view"));
    const [onlineRow] = await db
      .select({
        count: sql<number>`count(distinct ${analyticsEvents.fingerprintHash})::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.name, "page_view"),
          gte(analyticsEvents.createdAt, onlineSince),
        ),
      );

    const visitCount = visitRow?.count ?? 0;
    const onlineCount = onlineRow?.count ?? 0;
    return {
      visitCount: visitCount > 0 ? visitCount : null,
      onlineCount: onlineCount > 0 ? onlineCount : null,
    };
  } catch {
    return { visitCount: null, onlineCount: null };
  }
}

async function loadHomeSnapshot(): Promise<HomeSnapshot> {
  const ranked = await getRankedListings();
  const [trending, activity, stats] = await Promise.all([
    getTrending(ranked),
    getRecentActivity(),
    getLiveStats(),
  ]);
  const numberOne = ranked[0] ?? null;
  const takeFirstCents = numberOne
    ? numberOne.totalBidCents + leaderboardConfig.minIncrementCents
    : leaderboardConfig.minBidCents;

  return {
    listings: ranked,
    trending,
    activity,
    onlineCount: stats.onlineCount,
    visitCount: stats.visitCount,
    takeFirstCents,
    numberOne,
    generatedAt: new Date().toISOString(),
  };
}

export async function getHomeSnapshot(): Promise<HomeSnapshot> {
  try {
    return await loadHomeSnapshot();
  } catch (error) {
    if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
      throw error;
    }
    console.warn("Database unavailable; using development snapshot.");
    const { mockSnapshot } = await import("./mock-snapshot");
    return mockSnapshot();
  }
}

export const getCachedHomeSnapshot = unstable_cache(
  async () => getHomeSnapshot(),
  ["home-snapshot"],
  { revalidate: 30, tags: ["home"] },
);

export const getCachedListingBySlug = unstable_cache(
  async (slug: string) => getListingBySlug(slug),
  ["listing-by-slug"],
  { revalidate: 60, tags: ["home"] },
);

export const getCachedRankedListings = unstable_cache(
  async () => {
    try {
      return await getRankedListings();
    } catch (error) {
      if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
        throw error;
      }
      const { mockSnapshot } = await import("./mock-snapshot");
      return mockSnapshot().listings;
    }
  },
  ["ranked-listings"],
  { revalidate: 300, tags: ["home"] },
);

export async function getListingBySlug(slug: string) {
  try {
    const ranked = await getRankedListings();
    const found = ranked.find((item) => item.slug === slug);
    if (found) return found;
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
  }
  if (process.env.NODE_ENV !== "production") {
    const { mockSnapshot } = await import("./mock-snapshot");
    return mockSnapshot().listings.find((item) => item.slug === slug) ?? null;
  }
  return null;
}

export async function getListingByNormalized(normalizedIdentifier: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.experimentId, leaderboardConfig.experimentId),
        eq(listings.normalizedIdentifier, normalizedIdentifier),
      ),
    )
    .limit(1);
  if (!row || row.moderationStatus === "removed") return null;
  const ranked = await getRankedListings();
  return ranked.find((item) => item.id === row.id) ?? null;
}


