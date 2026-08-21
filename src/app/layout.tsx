import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { TrackPageView } from "@/components/track-page-view";
import { copy } from "@/experiments/leaderboard/copy";
import { getAppUrl } from "@/lib/utils";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: copy.title,
  description: copy.description,
  applicationName: "TopPTY",
  alternates: { canonical: "/" },
  openGraph: {
    title: copy.title,
    description: copy.description,
    url: "/",
    siteName: "TopPTY.lol",
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: copy.title,
    description: copy.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}
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
        {children}
        <TrackPageView />
        <Analytics />
      </body>
    </html>
  );
}
