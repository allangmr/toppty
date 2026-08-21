import type { AnalyticsEventName } from "@/core/analytics/events";

export function trackClient(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | null>,
  attribution?: {
    referral?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  },
) {
  const payload = JSON.stringify({
    name,
    properties,
    referral: attribution?.referral,
    utmSource: attribution?.utmSource,
    utmMedium: attribution?.utmMedium,
    utmCampaign: attribution?.utmCampaign,
  });

  try {
    navigator.sendBeacon?.(
      "/api/collect",
      new Blob([payload], { type: "application/json" }),
    );
  } catch {
    void fetch("/api/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }
}
