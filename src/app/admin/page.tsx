import { desc, eq, sql } from "drizzle-orm";
import {
  analyticsEvents,
  bids,
  getDb,
  listings,
  reports,
} from "@/core/db";
import { formatUsd } from "@/lib/utils";
import { hideListing, removeListing, restoreListing } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-5xl">Admin</h1>
        <p className="mt-4">Configura DATABASE_URL para ver listings y pagos.</p>
      </main>
    );
  }

  const db = getDb();
  const [listingRows, bidRows, reportRows, [visits], [paid]] = await Promise.all([
    db.select().from(listings).orderBy(desc(listings.updatedAt)).limit(100),
    db.select().from(bids).orderBy(desc(bids.createdAt)).limit(50),
    db
      .select({
        report: reports,
        listing: listings,
      })
      .from(reports)
      .leftJoin(listings, eq(reports.listingId, listings.id))
      .orderBy(desc(reports.createdAt))
      .limit(50),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.name, "page_view")),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(bids)
      .where(eq(bids.status, "paid")),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 text-sm">
      <h1 className="font-display text-5xl">Admin</h1>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Listings" value={listingRows.length} />
        <Stat label="Pagos" value={paid?.n ?? 0} />
        <Stat label="Visitas" value={visits?.n ?? 0} />
        <Stat label="Reportes" value={reportRows.length} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Listings</h2>
        <div className="overflow-x-auto border-2 border-ink">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-paper">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Clicks</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listingRows.map((row) => (
                <tr key={row.id} className="border-t border-ink">
                  <td className="p-2">
                    {row.displayName}
                    <div className="text-xs text-muted">{row.slug}</div>
                  </td>
                  <td className="p-2">{formatUsd(row.totalBidCents)}</td>
                  <td className="p-2">{row.clickCount}</td>
                  <td className="p-2">{row.moderationStatus}</td>
                  <td className="space-x-2 p-2">
                    <form action={hideListing} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <button className="underline">Ocultar</button>
                    </form>
                    <form action={removeListing} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <button className="underline">Quitar</button>
                    </form>
                    <form action={restoreListing} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <button className="underline">Restaurar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Pagos</h2>
        <ul className="space-y-1 border-2 border-ink p-3">
          {bidRows.map((bid) => (
            <li key={bid.id}>
              {bid.status} · {formatUsd(bid.amountCents)} · {bid.id}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Reportes</h2>
        <ul className="space-y-2 border-2 border-ink p-3">
          {reportRows.map((row) => (
            <li key={row.report.id}>
              {row.listing?.displayName ?? row.report.listingId} ·{" "}
              {row.report.reason}
              {row.report.details ? ` — ${row.report.details}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-ink bg-bg-card p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-4xl">{value}</p>
    </div>
  );
}
