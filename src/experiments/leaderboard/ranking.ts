import { leaderboardConfig } from "./config";

export function amountToTakeRank(
  listingsForRank: { rank: number; totalBidCents: number }[],
  rank: number,
) {
  const target = listingsForRank.find((item) => item.rank === rank);
  if (!target) return leaderboardConfig.minBidCents;
  return target.totalBidCents + leaderboardConfig.minIncrementCents;
}

export function estimateRank(
  amountCents: number,
  listingsForRank: { totalBidCents: number }[],
) {
  const ahead = listingsForRank.filter(
    (item) => item.totalBidCents >= amountCents,
  ).length;
  return ahead + 1;
}
