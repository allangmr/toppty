import { OgShell, ogSize, renderOg } from "@/core/social/og";

export const alt = "TopPTY.lol — ¿Quién ta arriba en Panamá?";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  return renderOg(
    <OgShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: 42, height: 10, borderRadius: 999, background: "#d21034" }} />
            <div style={{ width: 58, height: 10, borderRadius: 999, background: "#0b4fa8" }} />
            <div style={{ width: 72, height: 10, borderRadius: 999, background: "#121826" }} />
          </div>
          <span>
            toppty
            <span style={{ color: "#d21034" }}>.</span>
            lol
          </span>
        </div>
        <div style={{ fontSize: 22, color: "#5b6578" }}>Panamá 🇵🇦</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.02,
          letterSpacing: -2,
        }}
      >
        Coge el #1
        <span style={{ color: "#0b4fa8" }}>en Panamá.</span>
      </div>
      <div style={{ fontSize: 26, color: "#5b6578" }}>
        Paga. Súbete. Que te tumben si pueden.
      </div>
    </OgShell>,
  );
}
