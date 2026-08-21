import { copy } from "@/experiments/leaderboard/copy";

export function LiveStatus({
  onlineCount,
  visitCount,
}: {
  onlineCount: number | null;
  visitCount: number | null;
}) {
  if (!onlineCount && !visitCount) return null;

  return (
    <div
      aria-live="polite"
      className="inline-block max-w-full rounded-full bg-muted px-3 py-1.5 text-center text-sm text-balance text-muted-foreground transition-colors"
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {onlineCount ? (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="relative inline-flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-live" />
            </span>
            <span className="font-semibold text-live">
              {copy.onlineNow(onlineCount)}
            </span>
          </span>
        ) : null}
        {onlineCount && visitCount ? <span>·</span> : null}
        {visitCount ? <span>{copy.visitsSince(visitCount)}</span> : null}
      </span>
    </div>
  );
}
