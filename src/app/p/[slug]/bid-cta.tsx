"use client";

import { useRouter } from "next/navigation";
import { trackClient } from "@/components/track-client";
import { copy } from "@/experiments/leaderboard/copy";
import { centsToDollars, formatUsd } from "@/lib/utils";

export function BidCta({
  rank,
  amountCents,
}: {
  rank: number;
  amountCents: number;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        trackClient("rank_cta_clicked", { rank, amountCents });
        router.push(`/?amount=${centsToDollars(amountCents)}#subir`);
      }}
      className="w-full border-2 border-ink bg-ink px-4 py-4 font-display text-2xl tracking-[0.12em] text-cream"
    >
      {copy.takePlace(rank, formatUsd(amountCents))}
    </button>
  );
}
