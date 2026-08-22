import { leaderboardConfig } from "@/experiments/leaderboard/config";

export function CreatorLink({
  className,
  prefix,
}: {
  className?: string;
  prefix?: string;
}) {
  const handle = `@${leaderboardConfig.creator.xHandle}`;
  return (
    <span className={className}>
      {prefix ? `${prefix} ` : null}
      <a
        href={leaderboardConfig.creator.xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-foreground underline-offset-2 hover:underline"
      >
        {handle}
      </a>
    </span>
  );
}
