import { z } from "zod";
import { isAnalyticsEventName } from "@/core/analytics/events";
import { trackEvent } from "@/core/analytics/track";
import { fingerprintFromHeaders } from "@/core/security/fingerprint";

const schema = z.object({
  name: z.string(),
  properties: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    )
    .optional(),
  referral: z.string().max(80).nullable().optional(),
  utmSource: z.string().max(80).nullable().optional(),
  utmMedium: z.string().max(80).nullable().optional(),
  utmCampaign: z.string().max(80).nullable().optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    const raw = await request.text();
    json = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success || !isAnalyticsEventName(parsed.data.name)) {
    return new Response("invalid", { status: 400 });
  }

  await trackEvent({
    name: parsed.data.name,
    properties: parsed.data.properties,
    referral: parsed.data.referral,
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    fingerprintHash: fingerprintFromHeaders(request.headers),
  });

  return new Response(null, { status: 204 });
}
