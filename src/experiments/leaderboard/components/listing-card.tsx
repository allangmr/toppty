"use client";

import { trackClient } from "@/components/track-client";
import { formatUsd, timeAgoEs, cn } from "@/lib/utils";
import { copy } from "../copy";
import { amountToTakeRank } from "../ranking";
import type { RankedListing } from "../types";
import { ListingAvatar } from "./avatar";
import { useBid } from "./bid-context";
import { ReportButton } from "./report-button";

/** Gentle shrink for ranks 4+; never below a readable floor. */
function restScale(rank: number) {
  return Math.max(0.92, 1 - (rank - 4) * 0.0035);
}

export function ListingCard({
  listing,
  listings,
}: {
  listing: RankedListing;
  listings: RankedListing[];
}) {
  const { takePlace } = useBid();
  const takeCents = amountToTakeRank(listings, listing.rank);
  const rank = listing.rank;
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  const isTopThree = rank <= 3;
  const isRest = rank >= 4;

  const shell = isFirst
    ? "animate-crown my-2 rounded-2xl border-2 border-flag-red/55 bg-flag-red/12 px-3 py-1 shadow-[var(--shadow-soft)] md:my-3 md:px-4"
    : isSecond
      ? "animate-podium animate-podium-2 my-1.5 rounded-xl border-2 border-primary/45 bg-primary/10 px-2.5 md:my-2.5 md:rounded-2xl md:px-3.5"
      : isThird
        ? "animate-podium animate-podium-3 mt-1.5 mb-0.5 rounded-xl border-2 border-primary/20 bg-primary/5 px-2.5 md:mt-2 md:mb-1 md:rounded-2xl md:px-3.5"
        : cn(
            "px-3 md:px-4",
            rank !== 4 && rank !== 11 && rank !== 21
              ? "border-t border-border"
              : "",
          );

  const avatarSize = isFirst ? "xl" : isSecond ? "lg" : isThird ? "md" : "sm";

  return (
    <div
      className={cn("group relative h-full origin-top", shell)}
      style={
        isRest
          ? {
              transform: `scale(${restScale(rank)})`,
              transformOrigin: "top center",
              marginBottom: `-${((1 - restScale(rank)) * 12).toFixed(1)}px`,
            }
          : undefined
      }
    >
      <a
        href={`/go/${listing.slug}`}
        className={cn(
          "flex h-full items-center gap-2 transition-colors hover:text-primary md:gap-3",
          isTopThree && "motion-lift",
          isFirst ? "py-3 md:py-4" : isSecond ? "py-2.5 md:py-3.5" : isThird ? "py-2 md:py-3" : "py-1.5 md:py-2",
        )}
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
              "inline-flex items-center justify-center font-semibold",
              isFirst
                ? "animate-nudge min-w-9 rounded-full bg-flag-red px-2 py-0.5 text-sm text-white md:min-w-12 md:px-2.5 md:text-lg"
                : isSecond
                  ? "min-w-8 rounded-full bg-primary px-1.5 py-px text-xs text-primary-foreground md:min-w-11 md:px-2 md:text-base"
                  : isThird
                    ? "min-w-7 rounded-full bg-primary px-1.5 py-px text-xs text-primary-foreground md:min-w-10 md:px-2 md:text-sm"
                    : "min-w-7 text-[11px] font-medium text-muted-foreground md:min-w-9 md:text-xs",
            )}
          >
            #{listing.rank}
          </span>
          <ListingAvatar
            name={listing.displayName}
            imageUrl={listing.imageUrl}
            size={avatarSize}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate",
                isFirst
                  ? "text-base font-bold tracking-[-0.02em] md:text-xl"
                  : isSecond
                    ? "text-sm font-bold md:text-lg"
                    : isThird
                      ? "text-sm font-semibold md:text-base"
                      : "text-xs font-medium md:text-sm",
              )}
            >
              {listing.displayName}
            </p>
            <p
              className={cn(
                "shrink-0 font-semibold tabular-nums text-primary",
                isFirst
                  ? "text-base md:text-xl"
                  : isSecond
                    ? "text-sm md:text-lg"
                    : isThird
                      ? "text-sm md:text-base"
                      : "text-xs md:text-sm",
              )}
            >
              {formatUsd(listing.totalBidCents)}
            </p>
          </div>
          {listing.description ? (
            <p
              className={cn(
                "min-w-0 text-muted-foreground",
                isFirst
                  ? "line-clamp-3 text-xs md:text-sm"
                  : isSecond
                    ? "line-clamp-2 text-xs md:text-sm"
                    : isThird
                      ? "line-clamp-2 text-xs"
                      : "truncate text-[11px] md:text-xs",
              )}
            >
              {listing.description}
            </p>
          ) : null}
          <p
            className={cn(
              "mt-0.5 flex flex-wrap items-center gap-x-1.5",
              isTopThree ? "text-[11px] md:text-xs" : "text-[10px] md:text-[11px]",
            )}
          >
            <span className="text-muted-foreground">
              {listing.lastPaidAt ? (
                <time dateTime={listing.lastPaidAt}>
                  {timeAgoEs(new Date(listing.lastPaidAt))}
                </time>
              ) : (
                "recién"
              )}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <span className="relative inline-flex size-1.5 shrink-0">
                {isFirst ? (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag-red opacity-75 motion-reduce:animate-none" />
                ) : null}
                <span
                  className={cn(
                    "relative inline-flex size-1.5 rounded-full",
                    isFirst ? "bg-flag-red" : "bg-primary",
                  )}
                />
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
          "absolute left-1/2 z-20 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-primary-foreground shadow-sm transition-opacity duration-150",
          isFirst ? "bg-flag-red" : "bg-primary",
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
