import { eq } from "drizzle-orm";
import { bids, getDb } from "@/core/db";
import {
  capturePaypalOrder,
  extractOrderPayment,
  getPaypalOrder,
} from "@/core/payments/paypal";
import { fulfillPaidBid } from "./fulfill-bid";

export async function completePaypalBid(bidId: string) {
  const db = getDb();
  const [bid] = await db.select().from(bids).where(eq(bids.id, bidId)).limit(1);
  if (!bid) return { ok: false as const, reason: "missing" };
  if (bid.status === "paid") return { ok: true as const, already: true };
  if (bid.status === "refunded") return { ok: false as const, reason: "refunded" };
  if (!bid.paypalOrderId) return { ok: false as const, reason: "no-order" };

  let order = await getPaypalOrder(bid.paypalOrderId);
  let payment = extractOrderPayment(order);

  if (payment.customId && payment.customId !== bid.id) {
    return { ok: false as const, reason: "identity-mismatch" };
  }
  if (payment.amountCents != null && payment.amountCents !== bid.amountCents) {
    return { ok: false as const, reason: "amount-mismatch" };
  }

  if (order.status === "APPROVED" || (order.status === "CREATED" && !payment.captureId)) {
    order = await capturePaypalOrder(bid.paypalOrderId);
    payment = extractOrderPayment(order);
  }

  if (payment.amountCents != null && payment.amountCents !== bid.amountCents) {
    return { ok: false as const, reason: "amount-mismatch" };
  }

  const captured =
    payment.captureStatus === "COMPLETED" || order.status === "COMPLETED";
  if (!captured) {
    return { ok: false as const, reason: payment.captureStatus ?? order.status ?? "pending" };
  }

  if (payment.captureId) {
    await db
      .update(bids)
      .set({
        paypalOrderId: bid.paypalOrderId,
        paypalCaptureId: payment.captureId,
      })
      .where(eq(bids.id, bid.id));
  }

  await fulfillPaidBid({
    bidId: bid.id,
    paypalCaptureId: payment.captureId,
  });

  return { ok: true as const, already: false };
}
