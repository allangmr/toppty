"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { HomeSnapshot } from "../types";
import { ActivityFeed } from "./activity-feed";
import { BidModule } from "./bid-module";
import { BidProvider } from "./bid-context";
import { Faq } from "./faq";
import { LeaderboardList } from "./leaderboard-list";
import { LiveStatus } from "./live-status";
import { Trending } from "./trending";

export function HomeClient({
  initial,
  prefillAmount,
}: {
  initial: HomeSnapshot;
  prefillAmount: number | null;
}) {
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
    <BidProvider
      initialAmountCents={data.takeFirstCents}
      prefillAmount={prefillAmount}
    >
      <Header />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-4 pb-16">
        <header className="mb-6 text-center">
          <h1 className="sr-only">toppty.lol</h1>
          <LiveStatus
            onlineCount={data.onlineCount}
            visitCount={data.visitCount}
          />
        </header>

        <div className="flex flex-col gap-6">
          <BidModule
            takeFirstCents={data.takeFirstCents}
            listings={data.listings}
          />

          <div className="mb-2 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
            <Trending items={data.trending} />
            <ActivityFeed items={data.activity} />
          </div>

          <section id="ranking" className="scroll-mt-6">
            <LeaderboardList listings={data.listings} />
          </section>

          <Faq />
        </div>
      </div>
      <Footer />
    </BidProvider>
  );
}
