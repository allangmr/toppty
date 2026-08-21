import Stripe from "stripe";

let stripe: Stripe | null = null;

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function canSkipStripe() {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.DEV_SKIP_STRIPE === "true" || !process.env.STRIPE_SECRET_KEY)
  );
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}
