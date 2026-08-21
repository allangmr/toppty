import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export async function displayFontData() {
  return readFile(join(process.cwd(), "src/fonts/BebasNeue-Regular.ttf"));
}

export async function renderOg(element: React.ReactElement) {
  const font = await displayFontData();
  return new ImageResponse(element, {
    ...ogSize,
    fonts: [
      {
        name: "Bebas Neue",
        data: font,
        style: "normal",
        weight: 400,
      },
    ],
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
        background: "#f3eee4",
        color: "#161412",
        padding: "42px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "10px solid #161412",
          padding: "36px 40px",
          background: "#fffaf1",
        }}
      >
        {children}
      </div>
    </div>
  );
}
