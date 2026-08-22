import { experiments } from "@/experiments/registry";

export const leaderboardConfig = {
  experimentId: experiments.ranking.id,
  currency: "usd",
  currencySymbol: "$",
  minBidCents: 100,
  minIncrementCents: 100,
  maxBidCents: 10_000_000,
  pageSize: 20,
  clickCooldownMs: 30 * 60 * 1000,
  trendingWindowMs: 24 * 60 * 60 * 1000,
  onlineWindowMs: 5 * 60 * 1000,
  checkoutRateLimit: { limit: 8, windowMs: 15 * 60 * 1000 },
  reportRateLimit: { limit: 5, windowMs: 60 * 60 * 1000 },
  creator: {
    name: "Allan",
    xHandle: "allan_coding",
    xUrl: "https://x.com/allan_coding",
  },
} as const;
