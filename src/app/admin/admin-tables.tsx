"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatUsd, timeAgoEs } from "@/lib/utils";
import { AdminDataTable } from "./admin-data-table";
import { BidBadge, LoginOutcomeBadge, REPORT_LABELS, StatusBadge } from "./admin-ui";
import { ListingActions } from "./listing-actions";

export type AdminListingRow = {
  id: string;
  displayName: string;
  identifier: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  identifierType: "website" | "social";
  totalBidCents: number;
  clickCount: number;
  moderationStatus: "active" | "hidden" | "removed";
  updatedAt: string;
};

export type AdminBidRow = {
  id: string;
  amountCents: number;
  status: string;
  createdAt: string;
  paypalCaptureId: string | null;
  listingName: string | null;
  listingSlug: string | null;
};

export type AdminReportRow = {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  listingId: string | null;
  listingName: string | null;
  listingSlug: string | null;
  listingStatus: "active" | "hidden" | "removed" | null;
  listingDescription: string | null;
  listingImageUrl: string | null;
  listingIdentifierType: "website" | "social" | null;
};

const LISTING_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "activos", label: "Activos" },
  { id: "ocultos", label: "Ocultos" },
];

const BID_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "paid", label: "Pagados" },
  { id: "pending", label: "Pendientes" },
  { id: "failed", label: "Fallidos" },
  { id: "refunded", label: "Reembolsos" },
];

const REPORT_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "activos", label: "Activos" },
  { id: "ocultos", label: "Ocultos" },
];

export function ListingsTable({
  rows,
  initialFilter,
}: {
  rows: AdminListingRow[];
  initialFilter?: string;
}) {
  const [now] = useState(() => Date.now());
  const columns = useMemo(
    () => [
      {
        header: "Perfil",
        cell: (row: AdminListingRow) => (
          <div>
            <Link
              href={`/p/${row.slug}`}
              className="font-semibold hover:text-primary"
            >
              {row.displayName}
            </Link>
            <p className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground">
              {row.identifier}
            </p>
          </div>
        ),
      },
      {
        header: "Monto",
        cell: (row: AdminListingRow) => (
          <span className="font-medium tabular-nums">
            {formatUsd(row.totalBidCents)}
          </span>
        ),
      },
      {
        header: "Clicks",
        cell: (row: AdminListingRow) => (
          <span className="tabular-nums">{row.clickCount}</span>
        ),
      },
      {
        header: "Estado",
        cell: (row: AdminListingRow) => (
          <StatusBadge status={row.moderationStatus} />
        ),
      },
      {
        header: "Actualizado",
        cell: (row: AdminListingRow) => (
          <span
            className="text-muted-foreground"
            title={new Date(row.updatedAt).toLocaleString("es-PA")}
          >
            {timeAgoEs(new Date(row.updatedAt), now)}
          </span>
        ),
      },
      {
        header: "Acciones",
        className: "text-right",
        cell: (row: AdminListingRow) => (
          <ListingActions
            id={row.id}
            status={row.moderationStatus}
            listing={{
              id: row.id,
              displayName: row.displayName,
              description: row.description,
              imageUrl: row.imageUrl,
              identifierType: row.identifierType,
            }}
          />
        ),
      },
    ],
    [now],
  );

  return (
    <AdminDataTable
      rows={rows}
      columns={columns}
      getKey={(row) => row.id}
      searchPlaceholder="Buscar por nombre o @/#/$"
      searchText={(row) => `${row.displayName} ${row.identifier} ${row.slug}`}
      filters={LISTING_FILTERS}
      initialFilter={initialFilter}
      filterMatch={(row, filter) =>
        filter === "activos"
          ? row.moderationStatus === "active"
          : filter === "ocultos"
            ? row.moderationStatus === "hidden"
            : true
      }
      emptyTitle="No hay listings"
      emptyBody="Cuando alguien se suba a la tabla, aparece aquí."
    />
  );
}

export function PaymentsTable({ rows }: { rows: AdminBidRow[] }) {
  const [now] = useState(() => Date.now());
  const columns = useMemo(
    () => [
      {
        header: "Perfil",
        cell: (row: AdminBidRow) =>
          row.listingSlug ? (
            <Link
              href={`/p/${row.listingSlug}`}
              className="font-semibold hover:text-primary"
            >
              {row.listingName}
            </Link>
          ) : (
            <span className="font-semibold text-muted-foreground">
              {row.listingName ?? "Listing borrado"}
            </span>
          ),
      },
      {
        header: "Monto",
        cell: (row: AdminBidRow) => (
          <span className="font-medium tabular-nums">
            {formatUsd(row.amountCents)}
          </span>
        ),
      },
      {
        header: "Estado",
        cell: (row: AdminBidRow) => <BidBadge status={row.status} />,
      },
      {
        header: "Referencia",
        cell: (row: AdminBidRow) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.paypalCaptureId ?? "—"}
          </span>
        ),
      },
      {
        header: "Fecha",
        cell: (row: AdminBidRow) => (
          <span
            className="text-muted-foreground"
            title={new Date(row.createdAt).toLocaleString("es-PA")}
          >
            {timeAgoEs(new Date(row.createdAt), now)}
          </span>
        ),
      },
    ],
    [now],
  );

  return (
    <AdminDataTable
      rows={rows}
      columns={columns}
      getKey={(row) => row.id}
      searchPlaceholder="Buscar por nombre"
      searchText={(row) =>
        `${row.listingName ?? ""} ${row.paypalCaptureId ?? ""} ${row.id}`
      }
      filters={BID_FILTERS}
      filterMatch={(row, filter) =>
        filter === "todos" ? true : row.status === filter
      }
      emptyTitle="Todavía no hay pagos"
      emptyBody="Cuando alguien pague un puesto, el movimiento sale aquí."
    />
  );
}

export function ReportsTable({ rows }: { rows: AdminReportRow[] }) {
  const [now] = useState(() => Date.now());
  const columns = useMemo(
    () => [
      {
        header: "Perfil",
        cell: (row: AdminReportRow) =>
          row.listingSlug ? (
            <Link
              href={`/p/${row.listingSlug}`}
              className="font-semibold hover:text-primary"
            >
              {row.listingName}
            </Link>
          ) : (
            <span className="font-semibold text-muted-foreground">
              {row.listingName ?? "Listing borrado"}
            </span>
          ),
      },
      {
        header: "Motivo",
        cell: (row: AdminReportRow) => (
          <span className="rounded-full bg-flag-red/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            {REPORT_LABELS[row.reason] ?? row.reason}
          </span>
        ),
      },
      {
        header: "Detalle",
        cell: (row: AdminReportRow) => (
          <p className="max-w-[280px] truncate text-muted-foreground">
            {row.details || "—"}
          </p>
        ),
      },
      {
        header: "Estado",
        cell: (row: AdminReportRow) =>
          row.listingStatus ? (
            <StatusBadge status={row.listingStatus} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        header: "Fecha",
        cell: (row: AdminReportRow) => (
          <span
            className="text-muted-foreground"
            title={new Date(row.createdAt).toLocaleString("es-PA")}
          >
            {timeAgoEs(new Date(row.createdAt), now)}
          </span>
        ),
      },
      {
        header: "Acciones",
        className: "text-right",
        cell: (row: AdminReportRow) =>
          row.listingId && row.listingStatus ? (
            <ListingActions
              id={row.listingId}
              status={row.listingStatus}
              listing={
                row.listingIdentifierType
                  ? {
                      id: row.listingId,
                      displayName: row.listingName ?? "",
                      description: row.listingDescription,
                      imageUrl: row.listingImageUrl,
                      identifierType: row.listingIdentifierType,
                    }
                  : undefined
              }
            />
          ) : null,
      },
    ],
    [now],
  );

  return (
    <AdminDataTable
      rows={rows}
      columns={columns}
      getKey={(row) => row.id}
      searchPlaceholder="Buscar por nombre"
      searchText={(row) =>
        `${row.listingName ?? ""} ${row.reason} ${row.details ?? ""}`
      }
      filters={REPORT_FILTERS}
      filterMatch={(row, filter) =>
        filter === "activos"
          ? row.listingStatus === "active"
          : filter === "ocultos"
            ? row.listingStatus === "hidden"
            : true
      }
      emptyTitle="Sin reportes"
      emptyBody="Si alguien denuncia un perfil, lo ves aquí para ocultarlo o borrarlo."
    />
  );
}

const LOGIN_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "bad_password", label: "Clave mala" },
  { id: "captcha_fail", label: "Captcha" },
  { id: "locked", label: "Bloqueados" },
  { id: "success", label: "Entradas" },
];

export type AdminLoginEventRow = {
  id: string;
  ip: string;
  userAgent: string | null;
  outcome: string;
  createdAt: string;
};

export function LoginEventsTable({ rows }: { rows: AdminLoginEventRow[] }) {
  const [now] = useState(() => Date.now());
  const columns = useMemo(
    () => [
      {
        header: "Cuándo",
        cell: (row: AdminLoginEventRow) => (
          <span
            className="text-muted-foreground"
            title={new Date(row.createdAt).toLocaleString("es-PA")}
          >
            {timeAgoEs(new Date(row.createdAt), now)}
          </span>
        ),
      },
      {
        header: "IP",
        cell: (row: AdminLoginEventRow) => (
          <span className="font-mono text-xs">{row.ip}</span>
        ),
      },
      {
        header: "Resultado",
        cell: (row: AdminLoginEventRow) => (
          <LoginOutcomeBadge outcome={row.outcome} />
        ),
      },
      {
        header: "Navegador",
        cell: (row: AdminLoginEventRow) => (
          <p className="max-w-[320px] truncate text-xs text-muted-foreground">
            {row.userAgent || "—"}
          </p>
        ),
      },
    ],
    [now],
  );

  return (
    <AdminDataTable
      rows={rows}
      columns={columns}
      getKey={(row) => row.id}
      searchPlaceholder="Buscar por IP o navegador"
      searchText={(row) => `${row.ip} ${row.userAgent ?? ""} ${row.outcome}`}
      filters={LOGIN_FILTERS}
      filterMatch={(row, filter) =>
        filter === "todos" ? true : row.outcome === filter
      }
      emptyTitle="Sin intentos todavía"
      emptyBody="Cuando alguien pruebe el login del admin, el intento queda aquí."
    />
  );
}
