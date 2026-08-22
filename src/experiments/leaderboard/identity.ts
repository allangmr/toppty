import {
  canonicalizeHttpUrl,
  hostnameFromUrl,
  isSafeHttpUrl,
} from "@/core/security/urls";
import type { ParsedIdentity, SocialNetwork } from "./types";

const HANDLE_RE = /^[a-zA-Z0-9._-]{1,30}$/;

/** App prefix → network. Full profile URLs still work by domain. */
const HANDLE_PREFIX: Record<string, SocialNetwork> = {
  "@": "x",
  "#": "instagram",
  $: "tiktok",
};

const DISPLAY_PREFIX: Record<SocialNetwork, string> = {
  x: "@",
  instagram: "#",
  tiktok: "$",
};

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
  return value
    .trim()
    .replace(/^[@#$]/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function asSocial(network: SocialNetwork, handle: string): ParsedIdentity {
  const value = cleanHandle(handle);
  const prefix = DISPLAY_PREFIX[network];
  return {
    identifierType: "social",
    identifier: `${prefix}${value}`,
    normalizedIdentifier: `${network}:${value}`,
    socialNetwork: network,
    displayName: `${prefix}${value}`,
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
    return {
      ok: false,
      error: "Pon @usuario (X), #usuario (IG), $usuario (TikTok) o un link.",
    };
  }

  const lowered = input.toLowerCase();
  if (
    lowered.startsWith("javascript:") ||
    lowered.startsWith("data:") ||
    lowered.startsWith("vbscript:")
  ) {
    return { ok: false, error: "Ese link no es seguro." };
  }

  const prefix = input[0]!;
  const networkFromPrefix = HANDLE_PREFIX[prefix];
  if (networkFromPrefix) {
    const handle = cleanHandle(input);
    if (!HANDLE_RE.test(handle)) {
      return {
        ok: false,
        error: `Ese ${prefix}usuario no se ve válido.`,
      };
    }
    return { ok: true, identity: asSocial(networkFromPrefix, handle) };
  }

  // Domains allow dots that also match HANDLE_RE — parse URLs before bare handles.
  const looksLikeUrl =
    /^https?:\/\//i.test(input) ||
    input.includes("/") ||
    /\.[a-z0-9-]{2,}$/i.test(input);

  if (looksLikeUrl) {
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
      return {
        ok: false,
        error: "Pon @usuario (X), #usuario (IG), $usuario (TikTok) o un link.",
      };
    }
  }

  if (HANDLE_RE.test(input)) {
    return {
      ok: false,
      error: "Falta el prefijo: @ = X, # = Instagram, $ = TikTok.",
    };
  }

  return {
    ok: false,
    error: "Pon @usuario (X), #usuario (IG), $usuario (TikTok) o un link.",
  };
}

/** Client-safe favicon URL for website identity preview (Google s2). */
export function faviconUrlForDomain(domain: string) {
  const host = domain.trim().toLowerCase();
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

export function initialsFromName(name: string) {
  const cleaned = name.replace(/^[@#$]/, "").trim();
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
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TopPTYBot/1.0; +https://toppty.lol)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    const html = await readHtmlHead(response, 120_000);
    const pageUrl = response.url || destinationUrl;
    const domain = hostnameFromUrl(canonicalizeHttpUrl(pageUrl));

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

    const iconCandidates = [
      ...Array.from(
        html.matchAll(
          /<link[^>]+rel=["']([^"']*icon[^"']*)["'][^>]+href=["']([^"']+)["']/gi,
        ),
      ).map((match) => ({ rel: match[1]!.toLowerCase(), href: match[2]! })),
      ...Array.from(
        html.matchAll(
          /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']([^"']*icon[^"']*)["']/gi,
        ),
      ).map((match) => ({ rel: match[2]!.toLowerCase(), href: match[1]! })),
    ];

    const preferredIcon =
      iconCandidates.find((item) => item.rel.includes("apple-touch-icon"))
        ?.href ||
      iconCandidates.find((item) => item.rel.includes("icon"))?.href ||
      "/favicon.ico";

    let imageUrl: string | null = null;
    try {
      imageUrl = new URL(preferredIcon, pageUrl).toString();
      if (!isSafeHttpUrl(imageUrl)) imageUrl = null;
    } catch {
      imageUrl = null;
    }

    // Prefer a reliable Google favicon when the page icon is missing/broken.
    imageUrl = imageUrl || faviconUrlForDomain(domain);

    return {
      title: decodeHtml(title)?.slice(0, 80) || null,
      description: decodeHtml(description)?.slice(0, 140) || null,
      imageUrl,
    };
  } catch {
    try {
      const domain = hostnameFromUrl(canonicalizeHttpUrl(destinationUrl));
      return {
        title: null,
        description: null,
        imageUrl: faviconUrlForDomain(domain),
      };
    } catch {
      return null;
    }
  }
}

/** Stop reading after </head> so huge SPAs (e.g. outrank.so) don't time out. */
async function readHtmlHead(response: Response, maxBytes: number) {
  const reader = response.body?.getReader();
  if (!reader) {
    return (await response.text()).slice(0, maxBytes);
  }

  const decoder = new TextDecoder();
  let html = "";
  try {
    while (html.length < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // ignore cancel errors
    }
  }
  return html.slice(0, maxBytes);
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
