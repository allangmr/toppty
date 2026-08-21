import { HomeClient } from "@/experiments/leaderboard/components/home-client";
import { getHomeSnapshot } from "@/experiments/leaderboard/queries/leaderboard";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string }>;
}) {
  const snapshot = await getHomeSnapshot();
  const { amount } = await searchParams;
  const prefill =
    amount && /^\d+$/.test(amount) ? Math.max(1, Number(amount)) : null;
  return <HomeClient initial={snapshot} prefillAmount={prefill} />;
}
