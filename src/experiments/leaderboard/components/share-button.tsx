"use client";

import { useState } from "react";
import { trackClient } from "@/components/track-client";
import { shareText } from "@/core/social/share";
import { cn } from "@/lib/utils";

export function ShareButton({
  slug,
  rank,
  displayName,
  prominent = false,
}: {
  slug: string;
  rank: number;
  displayName: string;
  prominent?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://toppty.lol";
  const url = `${origin}/p/${slug}?ref=${encodeURIComponent(slug)}`;
  const text = shareText({ rank, displayName, url });

  async function share() {
    trackClient("share_clicked", { slug, rank });
    try {
      if (navigator.share) {
        await navigator.share({
          title: `TopPTY · ${displayName}`,
          text,
          url,
        });
        trackClient("share_completed", { slug, rank });
        return;
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackClient("share_completed", { slug, rank, method: "copy" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "border-2 border-ink bg-cream px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
        prominent &&
          "bg-accent px-4 py-2 font-display text-base tracking-[0.14em] text-cream",
      )}
    >
      {copied
        ? "Link copiado"
        : prominent
          ? "COMPARTIR 👑"
          : "Compartir"}
    </button>
  );
}
