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
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
    >
      {copy.takePlace(rank, formatUsd(amountCents))}
    </button>
  );
}
