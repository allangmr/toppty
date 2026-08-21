import {
  canonicalizeHttpUrl,
  hostnameFromUrl,
  isSafeHttpUrl,
} from "@/core/security/urls";
import type { ParsedIdentity, SocialNetwork } from "./types";

const HANDLE_RE = /^[a-zA-Z0-9._-]{1,30}$/;

const SOCIAL_HOSTS: Record<string, SocialNetwork> = {
  "instagram.com": "instagram",
  "www.instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
  "x.com": "x",
  "www.x.com": "x",
  "twitter.com": "x",
  "www.twitter.com": "x",
};

const SOCIAL_DESTINATION: Record<SocialNetwork, (handle: string) => string> = {
  instagram: (handle) => `https://www.instagram.com/${handle}/`,
  tiktok: (handle) => `https://www.tiktok.com/@${handle}`,
  x: (handle) => `https://x.com/${handle}`,
};

export type IdentityResult =
  | { ok: true; identity: ParsedIdentity }
  | { ok: false; error: string };

function cleanHandle(value: string) {
  return value.trim().replace(/^@/, "").replace(/\/+$/, "").toLowerCase();
}

function asSocial(network: SocialNetwork, handle: string): ParsedIdentity {
  const value = cleanHandle(handle);
  return {
    identifierType: "social",
    identifier: `@${value}`,
    normalizedIdentifier: `${network}:${value}`,
    socialNetwork: network,
    displayName: `@${value}`,
    destinationUrl: SOCIAL_DESTINATION[network](value),
    slugBase: value,
  };
}

function asWebsite(url: string): ParsedIdentity {
  const canonical = canonicalizeHttpUrl(url);
  const domain = hostnameFromUrl(canonical);
  return {
    identifierType: "website",
    identifier: canonical,
    normalizedIdentifier: `website:${domain}`,
    socialNetwork: null,
    displayName: domain,
    destinationUrl: canonical,
    slugBase: domain.replace(/\./g, "-"),
  };
}

function socialFromUrl(url: URL): ParsedIdentity | null {
  const network = SOCIAL_HOSTS[url.hostname.toLowerCase()];
  if (!network) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const reserved = new Set([
    "p",
    "reel",
    "reels",
    "stories",
    "tv",
    "video",
    "videos",
    "explore",
    "share",
    "status",
    "i",
    "intent",
  ]);
  if (reserved.has(parts[0]!.toLowerCase())) return null;

  const handle = cleanHandle(parts[0]!);
  if (!HANDLE_RE.test(handle)) return null;
  return asSocial(network, handle);
}

export function parseIdentity(raw: string): IdentityResult {
  const input = raw.trim();
  if (!input || input.length > 200) {
    return { ok: false, error: "Pon un @usuario o un link válido." };
  }

  const lowered = input.toLowerCase();
  if (
    lowered.startsWith("javascript:") ||
    lowered.startsWith("data:") ||
    lowered.startsWith("vbscript:")
  ) {
    return { ok: false, error: "Ese link no es seguro." };
  }

  if (input.startsWith("@") || HANDLE_RE.test(input)) {
    const handle = cleanHandle(input);
    if (!HANDLE_RE.test(handle)) {
      return { ok: false, error: "Ese @usuario no se ve válido." };
    }
    return { ok: true, identity: asSocial("instagram", handle) };
  }

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  if (!isSafeHttpUrl(withProtocol)) {
    return { ok: false, error: "Ese link no es seguro." };
  }

  try {
    const url = new URL(withProtocol);
    const social = socialFromUrl(url);
    if (social) return { ok: true, identity: social };
    return { ok: true, identity: asWebsite(url.toString()) };
  } catch {
    return { ok: false, error: "Pon un @usuario o un link válido." };
  }
}

export function initialsFromName(name: string) {
  const cleaned = name.replace(/^@/, "").trim();
  if (!cleaned) return "P";
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function avatarHue(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

export async function fetchWebsiteMeta(destinationUrl: string) {
  if (!isSafeHttpUrl(destinationUrl)) return null;

  try {
    const response = await fetch(destinationUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(2500),
      headers: {
        "User-Agent": "TopPTYBot/1.0 (+https://toppty.lol)",
        Accept: "text/html",
      },
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    const html = (await response.text()).slice(0, 80_000);

    const meta = (property: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i",
      );
      const alt = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
        "i",
      );
      return html.match(re)?.[1] || html.match(alt)?.[1] || null;
    };

    const title =
      meta("og:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      null;
    const description =
      meta("og:description") || meta("description") || null;
    const iconHref =
      html.match(
        /<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i,
      )?.[1] ||
      html.match(
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i,
      )?.[1] ||
      "/favicon.ico";

    let imageUrl: string | null = null;
    try {
      imageUrl = new URL(iconHref, destinationUrl).toString();
      if (!isSafeHttpUrl(imageUrl)) imageUrl = null;
    } catch {
      imageUrl = null;
    }

    return {
      title: decodeHtml(title)?.slice(0, 80) || null,
      description: decodeHtml(description)?.slice(0, 140) || null,
      imageUrl,
    };
  } catch {
    return null;
  }
}

function decodeHtml(value: string | null) {
  if (!value) return null;
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
