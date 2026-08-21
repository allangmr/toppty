import { analyticsEvents } from "@/core/db/schema";
import { getDb } from "@/core/db";
import { createId } from "@/lib/utils";
import type { AnalyticsEventName } from "./events";

type TrackInput = {
  name: AnalyticsEventName;
  properties?: Record<string, unknown>;
  referral?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  fingerprintHash?: string | null;
};

function sanitizeProperties(properties?: Record<string, unknown>) {
  if (!properties) return null;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties).slice(0, 20)) {
    if (typeof key !== "string" || key.length > 40) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      clean[key] = typeof value === "string" ? value.slice(0, 200) : value;
    }
  }
  return Object.keys(clean).length ? clean : null;
}

export async function trackEvent(input: TrackInput) {
  try {
    const db = getDb();
    await db.insert(analyticsEvents).values({
      id: createId("evt"),
      name: input.name,
      properties: sanitizeProperties(input.properties),
      referral: input.referral?.slice(0, 80) || null,
      utmSource: input.utmSource?.slice(0, 80) || null,
      utmMedium: input.utmMedium?.slice(0, 80) || null,
      utmCampaign: input.utmCampaign?.slice(0, 80) || null,
      fingerprintHash: input.fingerprintHash || null,
    });
  } catch (error) {
    console.error("analytics_track_failed", error);
  }
}
