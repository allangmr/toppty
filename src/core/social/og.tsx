import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export async function renderOg(element: React.ReactElement) {
  return new ImageResponse(element, {
    ...ogSize,
  });
}

export function OgShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: "#fffdfa",
        color: "#282624",
        padding: "48px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: 28,
          border: "2px solid #e6e0da",
          padding: "40px 44px",
          background: "#fffdfa",
          boxShadow: "0 18px 60px rgba(40,38,36,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
