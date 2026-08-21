"use client";

import { trackClient } from "@/components/track-client";
import { formatUsd, timeAgoEs, cn } from "@/lib/utils";
import { copy } from "../copy";
import { amountToTakeRank } from "../ranking";
import type { RankedListing } from "../types";
import { ListingAvatar } from "./avatar";
import { useBid } from "./bid-context";
import { ReportButton } from "./report-button";
import { ShareButton } from "./share-button";

export function ListingCard({
  listing,
  listings,
}: {
  listing: RankedListing;
  listings: RankedListing[];
}) {
  const { takePlace } = useBid();
  const takeCents = amountToTakeRank(listings, listing.rank);
  const isFirst = listing.rank === 1;
  const isPodium = listing.rank <= 3;

  return (
    <article
      className={cn(
        "border-2 border-ink bg-bg-card p-4",
        isFirst && "bg-ink text-cream",
        isPodium && !isFirst && "p-5",
        listing.rank === 2 && "shadow-[4px_4px_0_#161412]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "font-display leading-none",
            isFirst ? "text-6xl" : isPodium ? "text-5xl" : "text-4xl",
          )}
        >
          #{listing.rank}
        </p>
        <ShareButton
          slug={listing.slug}
          rank={listing.rank}
          displayName={listing.displayName}
          prominent={isFirst}
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <ListingAvatar
          name={listing.displayName}
          imageUrl={listing.imageUrl}
          size={isFirst ? "lg" : "md"}
        />
        <div className="min-w-0">
          <a
            href={`/go/${listing.slug}`}
            className="block truncate font-display text-2xl tracking-wide"
            onClick={() =>
              trackClient("listing_clicked", {
                slug: listing.slug,
                rank: listing.rank,
              })
            }
          >
            {listing.displayName}
          </a>
          {listing.description ? (
            <p
              className={cn(
                "truncate text-sm",
                isFirst ? "text-cream/70" : "text-muted",
              )}
            >
              {listing.description}
            </p>
          ) : null}
        </div>
      </div>

      <p
        className={cn(
          "mt-3 font-display leading-none",
          isFirst ? "text-6xl" : "text-5xl",
        )}
      >
        {formatUsd(listing.totalBidCents)}
      </p>
      <p className={cn("mt-2 text-sm", isFirst ? "text-cream/70" : "text-muted")}>
        {listing.lastPaidAt
          ? timeAgoEs(new Date(listing.lastPaidAt))
          : "recién"}{" "}
        · {listing.clickCount} clicks
      </p>

      <button
        type="button"
        onClick={() => {
          trackClient("rank_cta_clicked", {
            rank: listing.rank,
            amountCents: takeCents,
          });
          takePlace(takeCents);
        }}
        className={cn(
          "mt-4 w-full border-2 px-3 py-3 font-display text-lg tracking-[0.12em]",
          isFirst
            ? "border-cream bg-accent text-cream"
            : "border-ink bg-ink text-cream",
        )}
      >
        {copy.takePlace(listing.rank, formatUsd(takeCents))}
      </button>
      <div className={cn("mt-3", isFirst && "text-cream/60")}>
        <ReportButton listingId={listing.id} />
      </div>
    </article>
  );
}
