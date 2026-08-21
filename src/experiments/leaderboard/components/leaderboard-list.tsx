"use client";

import { useState } from "react";
import { copy } from "../copy";
import type { RankedListing } from "../types";
import { useBid } from "./bid-context";
import { ListingCard } from "./listing-card";

function Marker({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={`Fin de ${label.toLowerCase()}`}
      className="flex items-center gap-3 px-3 py-5 md:gap-4 md:px-4 md:py-7"
    >
      <span className="h-0.5 flex-1 rounded-full bg-primary/30" />
      <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary uppercase md:px-3 md:text-xs">
        {label}
      </span>
      <span className="h-0.5 flex-1 rounded-full bg-primary/30" />
    </div>
  );
}

export function LeaderboardList({ listings }: { listings: RankedListing[] }) {
  const { takePlace } = useBid();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? listings : listings.slice(0, 20);

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-2xl font-bold tracking-[-0.03em]">{copy.emptyTitle}</p>
        <p className="mt-2 text-muted-foreground">{copy.emptyBody}</p>
        <button
          type="button"
          onClick={() => takePlace(100)}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {copy.emptyCta}
        </button>
      </div>
    );
  }

  return (
    <div id="leaderboard" className="scroll-mt-6">
      {visible.map((listing) => (
        <div key={listing.id}>
          <ListingCard listing={listing} listings={listings} />
          {listing.rank === 3 && listings.length > 3 ? (
            <Marker label="Top 3" />
          ) : null}
          {listing.rank === 10 && listings.length > 10 ? (
            <Marker label="Top 10" />
          ) : null}
          {listing.rank === 20 && listings.length > 20 ? (
            <Marker label="Top 20" />
          ) : null}
        </div>
      ))}
      {listings.length > 20 && !showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-full border border-border py-3 text-sm font-bold transition-colors hover:bg-muted"
        >
          Ver el resto
        </button>
      ) : null}
    </div>
  );
}
