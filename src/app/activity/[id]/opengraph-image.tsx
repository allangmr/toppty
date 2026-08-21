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
  let name = "TOPPTY";
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
    name = row?.listing?.displayName ?? "TOPPTY";
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
    name = item?.listingDisplayName ?? "TOPPTY";
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
          fontFamily: "Bebas Neue",
          fontSize: 40,
          letterSpacing: 3,
        }}
      >
        <div>TOPPTY.LOL</div>
        <div style={{ color: isTakeover ? "#d61f26" : "#161412" }}>
          {isTakeover ? "NUEVO #1 EN PANAMA" : "MOVIMIENTO"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Bebas Neue",
            fontSize: 88,
            lineHeight: 0.9,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "Bebas Neue",
            fontSize: 72,
          }}
        >
          {amount}
        </div>
      </div>
      <div style={{ fontSize: 28 }}>
        {isTakeover && prev
          ? `acaba de tumbar a ${prev}`
          : "A ver cuánto duras arriba."}
      </div>
    </OgShell>,
  );
}
