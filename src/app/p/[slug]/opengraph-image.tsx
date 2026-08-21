import { OgShell, ogSize, renderOg } from "@/core/social/og";
import { getListingBySlug } from "@/experiments/leaderboard/queries/leaderboard";
import { formatUsd } from "@/lib/utils";

export const alt = "Puesto en TopPTY.lol";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  return renderOg(
    <OgShell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          toppty
          <span style={{ color: "#d21034" }}>.</span>
          lol
        </div>
        <div style={{ fontSize: 22, color: "#67625d" }}>Panamá</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            width: "fit-content",
            borderRadius: 999,
            background: "#0b4fa8",
            color: "#fff",
            padding: "6px 14px",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {listing ? `#${listing.rank}` : "TopPTY"}
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {listing?.displayName ?? slug}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#0b4fa8",
            letterSpacing: -2,
          }}
        >
          {listing ? formatUsd(listing.totalBidCents) : ""}
        </div>
        <div style={{ fontSize: 24, color: "#67625d" }}>
          A ver cuánto duras arriba.
        </div>
      </div>
    </OgShell>,
  );
}
