import { getHomeSnapshot } from "@/experiments/leaderboard/queries/leaderboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getHomeSnapshot();
  return Response.json(snapshot);
}
