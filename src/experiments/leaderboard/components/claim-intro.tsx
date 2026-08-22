import { formatUsd } from "@/lib/utils";
import { leaderboardConfig } from "../config";

export function ClaimIntro() {
  return (
    <p className="mx-auto mt-2 max-w-md text-center text-sm font-medium leading-relaxed text-muted-foreground">
      <span className="text-primary">
        Los puestos nuevos arrancan en {formatUsd(leaderboardConfig.minBidCents)}.
      </span>{" "}
      Si pones menos que el #1 igual caes donde te alcance la plata. De una.
    </p>
  );
}
