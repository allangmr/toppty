export const analyticsEventNames = [
  "page_view",
  "bid_form_started",
  "bid_amount_changed",
  "bid_checkout_started",
  "bid_payment_completed",
  "listing_clicked",
  "share_clicked",
  "share_completed",
  "rank_cta_clicked",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export function isAnalyticsEventName(
  value: string,
): value is AnalyticsEventName {
  return (analyticsEventNames as readonly string[]).includes(value);
}
