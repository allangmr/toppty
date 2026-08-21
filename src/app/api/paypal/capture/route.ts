import { z } from "zod";
import { canSkipPaypal } from "@/core/payments/paypal";
import { completePaypalBid } from "@/experiments/leaderboard/actions/complete-paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  bidId: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  if (canSkipPaypal()) {
    return Response.json({ ok: true, skipped: true });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    const result = await completePaypalBid(parsed.data.bidId);
    return Response.json(result);
  } catch {
    return Response.json({ ok: false, reason: "paypal-error" }, { status: 502 });
  }
}
