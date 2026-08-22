"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { copy } from "../copy";
import { leaderboardConfig } from "../config";
import type { RankedListing } from "../types";
import { useBid } from "./bid-context";
import { ListingCard } from "./listing-card";

const PAGE_SIZE = leaderboardConfig.pageSize;

function pageItems(current: number, total: number): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const marks = new Set(
    [1, total, current - 1, current, current + 1].filter(
      (n) => n >= 1 && n <= total,
    ),
  );
  const sorted = [...marks].sort((a, b) => a - b);
  const items: Array<number | "…"> = [];
  for (const n of sorted) {
    const prev = items[items.length - 1];
    if (typeof prev === "number" && n - prev > 1) items.push("…");
    items.push(n);
  }
  return items;
}

function Marker({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={`Fin de ${label.toLowerCase()}`}
      className="flex items-center gap-3 px-3 py-5 md:gap-4 md:px-4 md:py-7"
    >
      <span className="hairline flex-1" />
      <span className="glass-card font-display rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-primary uppercase md:px-3.5 md:text-xs">
        {label}
      </span>
      <span className="hairline flex-1" />
    </div>
  );
}

/** Equal-height wrapper for the top-3 podium (Outbid-style). */
function EqualHeightRows({
  children,
  syncKey,
}: {
  children: ReactNode;
  syncKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    let scheduled = false;
    function sync() {
      if (scheduled || !root) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        if (!root) return;
        const rows = Array.from(root.children).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        for (const row of rows) row.style.minHeight = "0px";
        const max = Math.max(
          0,
          ...rows.map((row) => row.getBoundingClientRect().height),
        );
        for (const row of rows) {
          row.style.minHeight = max > 0 ? `${max}px` : "";
        }
      });
    }

    const observer = new ResizeObserver(() => sync());
    observer.observe(root);
    for (const child of root.children) observer.observe(child);
    sync();
    return () => {
      observer.disconnect();
      for (const child of Array.from(root.children)) {
        if (child instanceof HTMLElement) child.style.minHeight = "";
      }
    };
  }, [syncKey]);

  return <div ref={ref}>{children}</div>;
}

export function LeaderboardList({
  listings,
  nowMs,
}: {
  listings: RankedListing[];
  nowMs: number;
}) {
  const { takePlace } = useBid();
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const currentPage = Math.min(page, totalPages);

  const visible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return listings.slice(start, start + PAGE_SIZE);
  }, [listings, currentPage]);

  const firstRank = visible[0]?.rank ?? 0;
  const splitTopThree =
    currentPage === 1 && firstRank === 1 && visible.length > 1;
  const podium = splitTopThree ? visible.slice(0, 3) : [];
  const rest = splitTopThree ? visible.slice(3) : visible;

  function goTo(next: number) {
    const clamped = Math.min(totalPages, Math.max(1, next));
    setPage(clamped);
    document.getElementById("ranking")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function renderCard(listing: RankedListing) {
    return (
      <ListingCard
        listing={listing}
        listings={listings}
        nowMs={nowMs}
      />
    );
  }

  if (listings.length === 0) {
    return (
      <div className="glass-card rounded-[24px] px-6 py-10 text-center">
        <p className="font-display text-2xl font-extrabold tracking-[-0.04em]">
          {copy.emptyTitle}
        </p>
        <p className="mt-2 text-muted-foreground">{copy.emptyBody}</p>
        <button
          type="button"
          onClick={() => takePlace(100)}
          className="btn-glossy mt-5 h-11 px-6 text-sm"
        >
          {copy.emptyCta}
        </button>
      </div>
    );
  }

  return (
    <div id="leaderboard" className="scroll-mt-6">
      {podium.length > 0 ? (
        <EqualHeightRows syncKey={podium.map((item) => item.id).join("|")}>
          {podium.map((listing) => (
            <div key={listing.id} className="h-full">
              {renderCard(listing)}
            </div>
          ))}
        </EqualHeightRows>
      ) : null}

      {podium.length > 0 && rest.length > 0 ? <Marker label="Top 3" /> : null}

      {rest.map((listing) => (
        <div key={listing.id}>
          {renderCard(listing)}
          {listing.rank === 10 && listings.length > 10 ? (
            <Marker label="Top 10" />
          ) : null}
          {listing.rank === 20 && listings.length > 20 ? (
            <Marker label="Top 20" />
          ) : null}
        </div>
      ))}

      {totalPages > 1 ? (
        <nav
          aria-label="Paginación de la tabla"
          className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {copy.pageLabel(currentPage, totalPages)}
            <span className="text-muted-foreground">
              {" "}
              · {listings.length} en total
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-3 text-sm font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon className="size-4" />
              {copy.pagePrev}
            </button>
            <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
              {pageItems(currentPage, totalPages).map((item, index) =>
                item === "…" ? (
                  <span
                    key={`gap-${index}`}
                    className="inline-flex size-9 items-center justify-center text-sm text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goTo(item)}
                    aria-label={`Ir a la página ${item}`}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={
                      item === currentPage
                        ? "inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                        : "inline-flex size-9 items-center justify-center rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    }
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Página siguiente"
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-3 text-sm font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.pageNext}
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
