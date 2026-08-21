import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { TrackPageView } from "@/components/track-page-view";
import { copy } from "@/experiments/leaderboard/copy";
import { getAppUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = localFont({
  src: "../fonts/BebasNeue-Regular.ttf",
  variable: "--font-display",
  display: "swap",
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
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        {children}
        <TrackPageView />
        <Analytics />
      </body>
    </html>
  );
}
