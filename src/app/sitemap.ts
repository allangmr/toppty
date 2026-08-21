import type { MetadataRoute } from "next";
import { getRankedListings } from "@/experiments/leaderboard/queries/leaderboard";
import { getAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const listings = await getRankedListings().catch(() => []);
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
