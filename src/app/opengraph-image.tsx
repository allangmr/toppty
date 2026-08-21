import { OgShell, ogSize, renderOg } from "@/core/social/og";

export const alt = "TopPTY.lol — ¿Quién está arriba en Panamá?";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  return renderOg(
    <OgShell>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            fontFamily: "Bebas Neue",
            fontSize: 42,
            letterSpacing: 4,
          }}
        >
          TOPPTY.LOL
        </div>
        <div style={{ fontSize: 28 }}>PANAMA</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Bebas Neue",
          fontSize: 92,
          lineHeight: 0.9,
          letterSpacing: 1,
        }}
      >
        ¿QUIEN ESTA ARRIBA
        <br />
        EN PANAMA?
      </div>
      <div style={{ fontSize: 28 }}>Paga. Sube. Que te tumben si pueden.</div>
    </OgShell>,
  );
}
