const PRIVATE_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "::1",
  "127.0.0.1",
]);

const BLOCKED_PROTOCOLS = new Set([
  "javascript:",
  "data:",
  "file:",
  "vbscript:",
  "blob:",
  "about:",
]);

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.+$/, "");
  if (PRIVATE_HOSTS.has(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }

  if (host.startsWith("::") || host.includes(":")) return true;
  return false;
}

export function isSafeHttpUrl(value: string) {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if ([...BLOCKED_PROTOCOLS].some((p) => lower.startsWith(p))) return false;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.username || url.password) return false;
    if (!url.hostname) return false;
    if (isPrivateHostname(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export function canonicalizeHttpUrl(value: string) {
  const url = new URL(value.trim());
  url.hash = "";
  if (!url.pathname) url.pathname = "/";
  return url.toString();
}

export function withUtmSource(value: string, source: string) {
  const url = new URL(value);
  url.searchParams.set("utm_source", source);
  return url.toString();
}
