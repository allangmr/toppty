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
            fontFamily: "Bebas Neue",
            fontSize: 40,
            letterSpacing: 4,
          }}
        >
          TOPPTY.LOL
        </div>
        <div style={{ fontSize: 24 }}>PANAMA</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Bebas Neue",
            fontSize: 120,
            lineHeight: 0.85,
          }}
        >
          {listing ? `#${listing.rank}` : "TOPPTY"}
        </div>
        <div
          style={{
            fontFamily: "Bebas Neue",
            fontSize: 72,
            lineHeight: 0.95,
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
            fontFamily: "Bebas Neue",
            fontSize: 84,
          }}
        >
          {listing ? formatUsd(listing.totalBidCents) : ""}
        </div>
        <div style={{ fontSize: 24 }}>A ver cuánto duras arriba.</div>
      </div>
    </OgShell>,
  );
}
