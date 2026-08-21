export const ADMIN_COOKIE = "toppty_admin";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function signingKey() {
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.IP_HASH_SALT ||
    "dev-admin-key"
  );
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return toHex(signature);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordsMatch(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(input, expected);
}

export async function signAdminCookie(expiresAt = Date.now() + WEEK_MS) {
  const payload = String(expiresAt);
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function isValidAdminCookie(value?: string | null) {
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await hmac(payload);
  return timingSafeEqual(sig, expected);
}
