import { bids, getDb, listings, analyticsEvents } from "@/core/db";
import { paypalEnabled, paypalApiBase } from "@/core/payments/paypal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, unknown> = {
    ok: true,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
    paypalConfigured: paypalEnabled(),
    paypalEnv: process.env.PAYPAL_ENV || null,
    paypalApi: paypalEnabled() ? paypalApiBase() : null,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  };

  if (!process.env.DATABASE_URL) {
    checks.ok = false;
    checks.database = "missing";
    return Response.json(checks, { status: 503 });
  }

  const tables: Record<string, string> = {};
  try {
    const db = getDb();
    await db.select({ id: listings.id }).from(listings).limit(1);
    tables.listings = "ok";
    await db.select({ id: bids.id }).from(bids).limit(1);
    tables.bids = "ok";
    await db.select({ id: analyticsEvents.id }).from(analyticsEvents).limit(1);
    tables.analytics_events = "ok";
    checks.tables = tables;
  } catch (error) {
    checks.ok = false;
    checks.tables = tables;
    checks.databaseError =
      error instanceof Error ? error.message.slice(0, 240) : "unknown";
    return Response.json(checks, { status: 503 });
  }

  return Response.json(checks);
}
