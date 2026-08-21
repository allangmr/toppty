import { eq } from "drizzle-orm";
import { bids, getDb } from "@/core/db";
import { verifyPaypalWebhook } from "@/core/payments/paypal";
import { completePaypalBid } from "@/experiments/leaderboard/actions/complete-paypal";
import {
  markBidFailed,
  markBidRefunded,
} from "@/experiments/leaderboard/actions/fulfill-bid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaypalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
    purchase_units?: Array<{
      custom_id?: string;
      reference_id?: string;
      payments?: { captures?: Array<{ id?: string }> };
    }>;
  };
};

function bidIdFromEvent(event: PaypalWebhookEvent) {
  return (
    event.resource?.custom_id ||
    event.resource?.purchase_units?.[0]?.custom_id ||
    event.resource?.purchase_units?.[0]?.reference_id ||
    null
  );
}

async function bidIdFromOrderId(orderId: string | undefined) {
  if (!orderId) return null;
  const db = getDb();
  const [bid] = await db
    .select({ id: bids.id })
    .from(bids)
    .where(eq(bids.paypalOrderId, orderId))
    .limit(1);
  return bid?.id ?? null;
}

async function bidIdFromCaptureId(captureId: string | undefined) {
  if (!captureId) return null;
  const db = getDb();
  const [bid] = await db
    .select({ id: bids.id })
    .from(bids)
    .where(eq(bids.paypalCaptureId, captureId))
    .limit(1);
  return bid?.id ?? null;
}

export async function POST(request: Request) {
  const raw = await request.text();
  let verified = false;
  try {
    verified = await verifyPaypalWebhook(request, raw);
  } catch {
    return new Response("webhook not configured", { status: 500 });
  }
  if (!verified) return new Response("invalid signature", { status: 400 });

  let event: PaypalWebhookEvent;
  try {
    event = JSON.parse(raw) as PaypalWebhookEvent;
  } catch {
    return new Response("invalid payload", { status: 400 });
  }

  const type = event.event_type ?? "";
  const resource = event.resource ?? {};
  const orderId =
    resource.id && type.startsWith("CHECKOUT.ORDER.")
      ? resource.id
      : resource.supplementary_data?.related_ids?.order_id;
  const captureId =
    type.startsWith("PAYMENT.CAPTURE.") ? resource.id : undefined;

  switch (type) {
    case "CHECKOUT.ORDER.APPROVED":
    case "PAYMENT.CAPTURE.COMPLETED": {
      const bidId =
        bidIdFromEvent(event) ||
        (await bidIdFromOrderId(orderId)) ||
        (await bidIdFromCaptureId(captureId));
      if (bidId) await completePaypalBid(bidId);
      break;
    }
    case "CHECKOUT.ORDER.VOIDED":
    case "CHECKOUT.PAYMENT-APPROVAL.REVERSED":
    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED": {
      const bidId =
        bidIdFromEvent(event) ||
        (await bidIdFromOrderId(orderId)) ||
        (await bidIdFromCaptureId(captureId));
      if (bidId) await markBidFailed(bidId);
      break;
    }
    case "PAYMENT.CAPTURE.REFUNDED":
    case "PAYMENT.CAPTURE.REVERSED": {
      if (captureId) await markBidRefunded(captureId);
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
