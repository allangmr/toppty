import type { MetadataRoute } from "next";
import { getCachedRankedListings } from "@/experiments/leaderboard/queries/leaderboard";
import { getAppUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const listings = await getCachedRankedListings().catch(() => []);
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...listings.map((listing) => ({
      url: `${base}/p/${listing.slug}`,
      lastModified: listing.lastPaidAt
        ? new Date(listing.lastPaidAt)
        : new Date(),
      changeFrequency: "hourly" as const,
      priority: listing.rank === 1 ? 0.9 : 0.6,
    })),
  ];
}
