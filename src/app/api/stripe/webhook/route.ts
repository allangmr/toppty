import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { bids, getDb } from "@/core/db";
import { getStripe } from "@/core/payments/stripe";
import {
  fulfillPaidBid,
  markBidFailed,
  markBidRefunded,
} from "@/experiments/leaderboard/actions/fulfill-bid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const bidId =
        session.metadata?.bidId || session.client_reference_id || null;
      if (!bidId) break;
      const paymentIntent =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      if (session.id) {
        const db = getDb();
        await db
          .update(bids)
          .set({
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntent ?? null,
          })
          .where(eq(bids.id, bidId));
      }
      await fulfillPaidBid({
        bidId,
        stripePaymentIntentId: paymentIntent,
      });
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const bidId =
        session.metadata?.bidId || session.client_reference_id || null;
      if (bidId) await markBidFailed(bidId);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntent =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (paymentIntent) await markBidRefunded(paymentIntent);
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
