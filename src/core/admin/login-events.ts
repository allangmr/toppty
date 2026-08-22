import { adminLoginEvents, getDb } from "@/core/db";
import { createId } from "@/lib/utils";
import {
  fingerprintFromHeaders,
  getClientIp,
  getUserAgent,
} from "@/core/security/fingerprint";

export type AdminLoginOutcome =
  | "success"
  | "bad_password"
  | "captcha_fail"
  | "locked";

export async function logAdminLoginEvent(
  headerList: Headers,
  outcome: AdminLoginOutcome,
) {
  if (!process.env.DATABASE_URL) return;

  try {
    const db = getDb();
    await db.insert(adminLoginEvents).values({
      id: createId("alg"),
      ip: getClientIp(headerList).slice(0, 64),
      userAgent: getUserAgent(headerList).slice(0, 240) || null,
      fingerprintHash: fingerprintFromHeaders(headerList),
      outcome,
    });
  } catch (error) {
    console.error("admin_login_event_failed", error);
  }
}
