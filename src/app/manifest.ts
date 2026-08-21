import type { MetadataRoute } from "next";
import { copy } from "@/experiments/leaderboard/copy";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TopPTY.lol",
    short_name: "TopPTY",
    description: copy.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fc",
    theme_color: "#0b4fa8",
    lang: "es-PA",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
