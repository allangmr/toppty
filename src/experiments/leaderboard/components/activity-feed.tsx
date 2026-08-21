import { copy } from "../copy";
import type { ActivityItem } from "../types";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl tracking-[0.12em]">
        {copy.activity}
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`/activity/${item.id}`}
              className={
                item.highlight
                  ? "block border-2 border-ink bg-ink p-3 text-cream"
                  : "block border-2 border-ink bg-bg-card p-3"
              }
            >
              {item.highlight ? (
                <p className="font-display text-sm tracking-[0.16em] text-accent">
                  NUEVO #1
                </p>
              ) : null}
              <p className="text-sm leading-snug">{item.message}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
