import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TrackPageView } from "@/components/track-page-view";
import { copy } from "@/experiments/leaderboard/copy";
import { leaderboardConfig } from "@/experiments/leaderboard/config";
import { getAppUrl } from "@/lib/utils";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const title = copy.title;
const description = copy.description;

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: title,
    template: `%s · TopPTY.lol`,
  },
  description,
  applicationName: "TopPTY",
  keywords: [
    "Panamá",
    "PTY",
    "tabla",
    "ranking",
    "leaderboard",
    "pay to rank",
    "publicidad",
    "viral",
    "TopPTY",
  ],
  authors: [
    { name: leaderboardConfig.creator.name, url: leaderboardConfig.creator.xUrl },
  ],
  creator: `@${leaderboardConfig.creator.xHandle}`,
  publisher: "TopPTY.lol",
  category: "entertainment",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "TopPTY.lol",
    locale: "es_PA",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: `@${leaderboardConfig.creator.xHandle}`,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "TopPTY",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d121c" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-PA"
      className={`${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
        <TrackPageView />
        <Analytics />
      </body>
    </html>
  );
}
