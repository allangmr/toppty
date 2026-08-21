import { createHash } from "node:crypto";

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "0.0.0.0";
  return headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

export function hashFingerprint(parts: string[]) {
  const salt = process.env.IP_HASH_SALT || "dev-only-change-me";
  return createHash("sha256")
    .update([salt, ...parts].join("|"))
    .digest("hex");
}

export function fingerprintFromHeaders(headers: Headers) {
  const ip = getClientIp(headers);
  const ua = headers.get("user-agent") || "";
  return hashFingerprint([ip, ua]);
}

export function getUserAgent(headers: Headers) {
  return headers.get("user-agent") || "";
}
