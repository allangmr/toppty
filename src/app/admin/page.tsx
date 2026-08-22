import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import {
  analyticsEvents,
  bids,
  getDb,
  listings,
  reports,
} from "@/core/db";
import { cn, formatUsd } from "@/lib/utils";
import { AdminHeader } from "./admin-header";
import {
  ListingsTable,
  PaymentsTable,
  ReportsTable,
} from "./admin-tables";

export const dynamic = "force-dynamic";

type Section = "listings" | "pagos" | "reportes";
type Estado = "todos" | "activos" | "ocultos";

function parseSection(value?: string): Section {
  if (value === "pagos" || value === "reportes") return value;
  return "listings";
}

function parseEstado(value?: string): Estado {
  if (value === "activos" || value === "ocultos") return value;
  return "todos";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string; estado?: string }>;
}) {
  if (!process.env.DATABASE_URL) {
    return (
      <>
        <AdminHeader />
        <main id="contenido" className="mx-auto max-w-xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-[-0.04em]">Moderación</h1>
          <p className="mt-3 text-muted-foreground">
            Configura DATABASE_URL para ver listings y pagos.
          </p>
        </main>
      </>
    );
  }

  const params = await searchParams;
  const section = parseSection(params.seccion);
  const estado = parseEstado(params.estado);
  const db = getDb();

  const [
    listingRows,
    bidRows,
    reportRows,
    [visits],
    statusCounts,
    [paid],
    [reportCount],
  ] = await Promise.all([
    db.select().from(listings).orderBy(desc(listings.updatedAt)).limit(500),
    db
      .select({
        bid: bids,
        listing: listings,
      })
      .from(bids)
      .leftJoin(listings, eq(bids.listingId, listings.id))
      .orderBy(desc(bids.createdAt))
      .limit(500),
    db
      .select({
        report: reports,
        listing: listings,
      })
      .from(reports)
      .leftJoin(listings, eq(reports.listingId, listings.id))
      .orderBy(desc(reports.createdAt))
      .limit(500),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.name, "page_view")),
    db
      .select({
        status: listings.moderationStatus,
        n: sql<number>`count(*)::int`,
      })
      .from(listings)
      .groupBy(listings.moderationStatus),
    db
      .select({
        count: sql<number>`count(*)::int`,
        cents: sql<number>`coalesce(sum(${bids.amountCents}), 0)::int`,
      })
      .from(bids)
      .where(eq(bids.status, "paid")),
    db.select({ n: sql<number>`count(*)::int` }).from(reports),
  ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map((row) => [row.status, row.n]),
  );
  const activeCount = countByStatus.active ?? 0;
  const hiddenCount = countByStatus.hidden ?? 0;
  const listingTotal = statusCounts.reduce((sum, row) => sum + row.n, 0);
  const paidCount = paid?.count ?? 0;
  const revenueCents = paid?.cents ?? 0;

  return (
    <>
      <AdminHeader />
      <main id="contenido" className="mx-auto w-full max-w-6xl px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] md:text-4xl">
            Moderación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ocultar saca de la tabla y se puede restaurar. Eliminar borra el
            registro y libera el perfil.
          </p>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat
            href="/admin?seccion=listings&estado=activos"
            label="Activos"
            value={activeCount}
            hint="En la tabla"
            active={section === "listings" && estado === "activos"}
          />
          <Stat
            href="/admin?seccion=listings&estado=ocultos"
            label="Ocultos"
            value={hiddenCount}
            hint="Se pueden restaurar"
            active={section === "listings" && estado === "ocultos"}
          />
          <Stat
            href="/admin?seccion=pagos"
            label="Ingresos"
            formatted={formatUsd(revenueCents)}
            hint={`${paidCount.toLocaleString("es-PA")} pagos`}
            active={section === "pagos"}
          />
          <Stat label="Visitas" value={visits?.n ?? 0} hint="Page views" />
          <Stat
            href="/admin?seccion=reportes"
            label="Reportes"
            value={reportCount?.n ?? 0}
            hint="Revisar denuncias"
            active={section === "reportes"}
            alert={(reportCount?.n ?? 0) > 0}
          />
        </section>

        <nav
          aria-label="Secciones"
          className="mt-8 flex gap-1 rounded-full border border-border bg-card p-1"
        >
          <SectionTab
            href="/admin?seccion=listings"
            active={section === "listings"}
            label="Publicados"
            count={listingTotal}
          />
          <SectionTab
            href="/admin?seccion=pagos"
            active={section === "pagos"}
            label="Pagos"
            count={paidCount}
          />
          <SectionTab
            href="/admin?seccion=reportes"
            active={section === "reportes"}
            label="Reportes"
            count={reportCount?.n ?? 0}
          />
        </nav>

        <section className="mt-5">
          {section === "listings" ? (
            <>
              <h2 className="mb-4 text-lg font-semibold tracking-[-0.03em]">
                Publicados
              </h2>
              <ListingsTable
                key={estado}
                initialFilter={estado}
                rows={listingRows.map((row) => ({
                  id: row.id,
                  displayName: row.displayName,
                  identifier: row.identifier,
                  slug: row.slug,
                  description: row.description,
                  imageUrl: row.imageUrl,
                  identifierType: row.identifierType,
                  totalBidCents: row.totalBidCents,
                  clickCount: row.clickCount,
                  moderationStatus: row.moderationStatus,
                  updatedAt: row.updatedAt.toISOString(),
                }))}
              />
            </>
          ) : null}

          {section === "pagos" ? (
            <>
              <h2 className="mb-4 text-lg font-semibold tracking-[-0.03em]">
                Pagos
              </h2>
              <PaymentsTable
                rows={bidRows.map(({ bid, listing }) => ({
                  id: bid.id,
                  amountCents: bid.amountCents,
                  status: bid.status,
                  createdAt: bid.createdAt.toISOString(),
                  paypalCaptureId: bid.paypalCaptureId,
                  listingName: listing?.displayName ?? null,
                  listingSlug: listing?.slug ?? null,
                }))}
              />
            </>
          ) : null}

          {section === "reportes" ? (
            <>
              <h2 className="mb-4 text-lg font-semibold tracking-[-0.03em]">
                Reportes
              </h2>
              <ReportsTable
                rows={reportRows.map(({ report, listing }) => ({
                  id: report.id,
                  reason: report.reason,
                  details: report.details,
                  createdAt: report.createdAt.toISOString(),
                  listingId: listing?.id ?? null,
                  listingName: listing?.displayName ?? null,
                  listingSlug: listing?.slug ?? null,
                  listingStatus: listing?.moderationStatus ?? null,
                  listingDescription: listing?.description ?? null,
                  listingImageUrl: listing?.imageUrl ?? null,
                  listingIdentifierType: listing?.identifierType ?? null,
                }))}
              />
            </>
          ) : null}
        </section>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  formatted,
  hint,
  href,
  active,
  alert,
}: {
  label: string;
  value?: number;
  formatted?: string;
  hint?: string;
  href?: string;
  active?: boolean;
  alert?: boolean;
}) {
  const className = cn(
    "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors",
    active ? "border-primary/40 ring-2 ring-primary/15" : "border-border",
    href && "hover:border-primary/30 hover:bg-muted/40",
  );
  const display = formatted ?? (value ?? 0).toLocaleString("es-PA");
  const body = (
    <>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-bold tracking-[-0.03em] tabular-nums",
          formatted ? "text-2xl md:text-3xl" : "text-3xl",
          alert && (value ?? 0) > 0 && "text-destructive",
        )}
      >
        {display}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}

function SectionTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
          active ? "bg-background/15" : "bg-muted",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
