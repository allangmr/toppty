"use client";

import { trackClient } from "@/components/track-client";
import { formatUsd, timeAgoEs, cn } from "@/lib/utils";
import { copy } from "../copy";
import { amountToTakeRank } from "../ranking";
import type { RankedListing } from "../types";
import { ListingAvatar } from "./avatar";
import { useBid } from "./bid-context";
import { ReportButton } from "./report-button";

export function ListingCard({
  listing,
  listings,
}: {
  listing: RankedListing;
  listings: RankedListing[];
}) {
  const { takePlace } = useBid();
  const takeCents = amountToTakeRank(listings, listing.rank);
  const isTopThree = listing.rank <= 3;

  const shell =
    listing.rank === 1
      ? "my-1.5 rounded-xl border-2 border-primary bg-primary/22 px-2.5 md:my-3 md:rounded-2xl md:px-3.5"
      : listing.rank === 2
        ? "my-1.5 rounded-xl border-2 border-primary/40 bg-primary/8 px-2.5 md:my-3 md:rounded-2xl md:px-3.5"
        : listing.rank === 3
          ? "mt-1.5 mb-0.5 rounded-xl border-2 border-primary/15 bg-primary/3 px-2.5 md:mt-3 md:mb-1 md:rounded-2xl md:px-3.5"
          : cn(
              "px-3 md:px-4",
              listing.rank > 3 &&
                listing.rank !== 4 &&
                listing.rank !== 11 &&
                listing.rank !== 21
                ? "border-t border-border"
                : "",
            );

  return (
    <div className={cn("group relative h-full", shell)}>
      <a
        href={`/go/${listing.slug}`}
        className="flex h-full items-center gap-2 py-2 transition-colors hover:text-primary md:gap-3 md:py-3"
        onClick={() =>
          trackClient("listing_clicked", {
            slug: listing.slug,
            rank: listing.rank,
          })
        }
      >
        <div className="flex w-10 shrink-0 flex-col items-center gap-1.5 md:w-auto md:flex-row md:gap-3">
          <span
            className={cn(
              "inline-flex min-w-7 items-center justify-center text-xs md:min-w-10 md:text-base",
              isTopThree
                ? "rounded-full bg-primary px-1.5 py-px font-semibold text-primary-foreground md:px-2 md:py-0.5"
                : "font-medium text-muted-foreground",
            )}
          >
            #{listing.rank}
          </span>
          <ListingAvatar
            name={listing.displayName}
            imageUrl={listing.imageUrl}
            size="md"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm md:text-base",
                isTopThree ? "font-bold" : "font-medium",
              )}
            >
              {listing.displayName}
            </p>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-primary md:text-base">
              {formatUsd(listing.totalBidCents)}
            </p>
          </div>
          {listing.description ? (
            <p
              className={cn(
                "min-w-0 text-xs text-muted-foreground/70 md:text-sm",
                isTopThree
                  ? "line-clamp-3"
                  : "truncate md:line-clamp-2 md:whitespace-normal",
              )}
            >
              {listing.description}
            </p>
          ) : null}
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] md:text-xs">
            <span className="text-muted-foreground/70">
              {listing.lastPaidAt
                ? timeAgoEs(new Date(listing.lastPaidAt))
                : "recién"}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <span className="relative inline-flex size-1.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              {listing.clickCount} clicks
            </span>
          </p>
        </div>
      </a>

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
          "absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-primary-foreground shadow-sm transition-opacity duration-150",
          "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100",
          isTopThree ? "top-0 -translate-y-1/2" : "top-1.5",
        )}
      >
        {copy.takePlace(listing.rank, formatUsd(takeCents))}
      </button>

      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <ReportButton listingId={listing.id} />
      </div>
    </div>
  );
}
