"use client";

import { useState } from "react";
import type { TrendingListing } from "../types";
import { copy } from "../copy";
import { ListingAvatar } from "./avatar";

export function Trending({ items }: { items: TrendingListing[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = items.slice(0, 5);

  if (visible.length === 0) return null;

  return (
    <section className="flex h-full flex-col rounded-2xl bg-card px-4 pt-3.5 pb-1 shadow-[var(--shadow-soft)] md:px-5 md:pt-4">
      <h2 className="mb-1 text-sm font-semibold tracking-[-0.02em]">
        🔥 {copy.trending}
      </h2>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={
            expanded
              ? "overflow-visible"
              : "max-h-16 overflow-hidden md:max-h-none md:overflow-visible"
          }
        >
          <ul className="flex flex-1 flex-col">
            {visible.map((item, index) => (
              <li
                key={item.slug}
                className={index === 0 ? undefined : "border-t border-border"}
              >
                <a
                  href={`#ranking`}
                  className="flex items-center gap-2 py-1.5 text-xs transition-colors hover:text-primary"
                >
                  <ListingAvatar name={item.displayName} size="xs" />
                  <p className="min-w-0 flex-1 truncate font-semibold">
                    {item.displayName}
                  </p>
                  <span className="shrink-0 text-muted-foreground">
                    {item.clicksPerHour} clicks/h
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {visible.length > 1 && !expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 items-end justify-center pb-1 md:hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-card from-20% via-card/80 to-transparent" />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="pointer-events-auto relative z-10 inline-flex h-6 items-center rounded-full border border-border bg-card px-2 text-xs font-bold transition-colors hover:bg-muted"
            >
              {copy.showMore}
            </button>
          </div>
        ) : null}
        {visible.length > 1 && expanded ? (
          <div className="flex justify-center py-2 md:hidden">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex h-6 items-center rounded-full border border-border bg-card px-2 text-xs font-bold transition-colors hover:bg-muted"
            >
              {copy.showLess}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
