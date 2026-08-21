import { experiments } from "@/experiments/registry";

export const leaderboardConfig = {
  experimentId: experiments.ranking.id,
  currency: "usd",
  currencySymbol: "$",
  minBidCents: 100,
  minIncrementCents: 100,
  maxBidCents: 10_000_000,
  clickCooldownMs: 30 * 60 * 1000,
  trendingWindowMs: 60 * 60 * 1000,
  onlineWindowMs: 5 * 60 * 1000,
  checkoutRateLimit: { limit: 8, windowMs: 15 * 60 * 1000 },
  reportRateLimit: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const;
