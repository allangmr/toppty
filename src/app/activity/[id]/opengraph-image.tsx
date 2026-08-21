import { eq } from "drizzle-orm";
import { OgShell, ogSize, renderOg } from "@/core/social/og";
import { activities, getDb, listings } from "@/core/db";
import { formatUsd } from "@/lib/utils";

export const alt = "Movimiento en TopPTY.lol";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let name = "TopPTY";
  let prev: string | undefined;
  let isTakeover = false;
  let amount = "";

  try {
    const db = getDb();
    const [row] = await db
      .select({ activity: activities, listing: listings })
      .from(activities)
      .leftJoin(listings, eq(activities.listingId, listings.id))
      .where(eq(activities.id, id))
      .limit(1);
    name = row?.listing?.displayName ?? "TopPTY";
    prev = row?.activity.metadata?.previousNumberOneDisplayName as
      | string
      | undefined;
    isTakeover = row?.activity.type === "NEW_NUMBER_ONE";
    amount = row?.activity.amountCents
      ? formatUsd(row.activity.amountCents)
      : "";
  } catch {
    const { mockSnapshot } = await import(
      "@/experiments/leaderboard/queries/mock-snapshot"
    );
    const item = mockSnapshot().activity.find((row) => row.id === id);
    name = item?.listingDisplayName ?? "TopPTY";
    prev = item?.metadata?.previousNumberOneDisplayName as string | undefined;
    isTakeover = item?.type === "NEW_NUMBER_ONE";
    amount = item?.amountCents ? formatUsd(item.amountCents) : "";
  }

  return renderOg(
    <OgShell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        <div>
          toppty
          <span style={{ color: "#e57255" }}>.</span>
          lol
        </div>
        <div style={{ color: isTakeover ? "#e57255" : "#67625d" }}>
          {isTakeover ? "Nuevo #1 en Panamá" : "Movimiento"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#e57255",
            letterSpacing: -1,
          }}
        >
          {amount}
        </div>
      </div>
      <div style={{ fontSize: 26, color: "#67625d" }}>
        {isTakeover && prev
          ? `acaba de tumbar a ${prev}`
          : "A ver cuánto duras arriba."}
      </div>
    </OgShell>,
  );
}
