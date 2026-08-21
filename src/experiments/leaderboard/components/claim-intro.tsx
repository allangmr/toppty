import { formatUsd } from "@/lib/utils";
import { leaderboardConfig } from "../config";

export function ClaimIntro() {
  return (
    <p className="mx-auto mt-2 max-w-md text-center text-sm font-medium leading-relaxed text-muted-foreground">
      <span className="text-primary">
        Los puestos nuevos empiezan en {formatUsd(leaderboardConfig.minBidCents)}.
      </span>{" "}
      Pagar menos que el #1 igual te pone en el ranking en el puesto que
      alcance tu monto.
    </p>
  );
}
