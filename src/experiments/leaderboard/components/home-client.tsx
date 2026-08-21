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
import { copy } from "../copy";

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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4 py-6">
        <div className="space-y-4">
          <LiveStatus
            onlineCount={data.onlineCount}
            visitCount={data.visitCount}
          />
          <h1 className="font-display text-[clamp(2.6rem,12vw,4.4rem)] leading-[0.95]">
            {copy.hero}
          </h1>
          <p className="text-lg leading-snug">
            {copy.punch.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <BidModule takeFirstCents={data.takeFirstCents} listings={data.listings} />
        <Trending items={data.trending} />
        <ActivityFeed items={data.activity} />

        <section id="ranking" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-3xl tracking-[0.14em]">
            {copy.ranking}
          </h2>
          <LeaderboardList listings={data.listings} />
        </section>

        <Faq />
      </main>
      <Footer />
    </BidProvider>
  );
}
