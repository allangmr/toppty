"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { HomeSnapshot } from "../types";
import { ActivityFeed } from "./activity-feed";
import { BidModule } from "./bid-module";
import { BidProvider } from "./bid-context";
import { LiveStatus } from "./live-status";
import { Trending } from "./trending";

const LeaderboardList = dynamic(
  () =>
    import("./leaderboard-list").then((mod) => ({
      default: mod.LeaderboardList,
    })),
);

export function HomeClient({ initial }: { initial: HomeSnapshot }) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch("/api/live", { cache: "no-store" });
        if (!response.ok) return;
        const next = (await response.json()) as HomeSnapshot;
        setData(next);
      } catch {
        // Keep last snapshot if polling fails.
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <BidProvider initialAmountCents={data.takeFirstCents}>
      <div className="mb-6 text-center">
        <LiveStatus
          onlineCount={data.onlineCount}
          visitCount={data.visitCount}
        />
      </div>

      <div className="flex flex-col gap-6">
        <BidModule
          takeFirstCents={data.takeFirstCents}
          listings={data.listings}
        />

        <div className="mb-2 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          <div className="animate-card-in motion-lift h-full">
            <Trending items={data.trending} />
          </div>
          <div className="animate-card-in animate-card-in-delay motion-lift h-full">
            <ActivityFeed items={data.activity} />
          </div>
        </div>

        <section
          id="ranking"
          className="scroll-mt-6"
          aria-labelledby="ranking-heading"
        >
          <h2 id="ranking-heading" className="sr-only">
            Ranking
          </h2>
          <LeaderboardList listings={data.listings} />
        </section>
      </div>
    </BidProvider>
  );
}
