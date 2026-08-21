"use client";

import { useState } from "react";
import { copy } from "../copy";
import type { RankedListing } from "../types";
import { useBid } from "./bid-context";
import { ListingCard } from "./listing-card";

function Marker({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-0.5 flex-1 bg-ink" />
      <p className="font-display text-sm tracking-[0.2em]">{label}</p>
      <div className="h-0.5 flex-1 bg-ink" />
    </div>
  );
}

export function LeaderboardList({ listings }: { listings: RankedListing[] }) {
  const { takePlace } = useBid();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? listings : listings.slice(0, 20);

  if (listings.length === 0) {
    return (
      <div className="border-2 border-ink bg-bg-card p-6 text-center shadow-[4px_4px_0_#161412]">
        <p className="font-display text-4xl">{copy.emptyTitle}</p>
        <p className="mt-2 text-lg">{copy.emptyBody}</p>
        <button
          type="button"
          onClick={() => takePlace(100)}
          className="mt-4 w-full border-2 border-ink bg-ink px-4 py-3 font-display text-2xl tracking-[0.14em] text-cream"
        >
          {copy.emptyCta}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((listing) => (
        <div key={listing.id}>
          <ListingCard listing={listing} listings={listings} />
          {listing.rank === 3 && listings.length > 3 ? (
            <Marker label="TOP 3" />
          ) : null}
          {listing.rank === 10 && listings.length > 10 ? (
            <Marker label="TOP 10" />
          ) : null}
          {listing.rank === 20 && listings.length > 20 ? (
            <Marker label="TOP 20" />
          ) : null}
        </div>
      ))}
      {listings.length > 20 && !showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full border-2 border-ink py-3 font-display tracking-widest"
        >
          Ver el resto
        </button>
      ) : null}
    </div>
  );
}
