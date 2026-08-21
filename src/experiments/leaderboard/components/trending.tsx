import type { TrendingListing } from "../types";
import { copy } from "../copy";

export function Trending({ items }: { items: TrendingListing[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl tracking-[0.12em]">
        🔥 {copy.trending}
      </h2>
      <ul className="border-2 border-ink bg-bg-card">
        {items.map((item) => (
          <li
            key={item.slug}
            className="flex items-baseline justify-between gap-3 border-b-2 border-ink px-3 py-2 last:border-b-0"
          >
            <a href={`#ranking`} className="truncate font-medium">
              {item.displayName}
            </a>
            <span className="shrink-0 font-mono text-sm">
              {item.clicksPerHour} clicks/h
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
