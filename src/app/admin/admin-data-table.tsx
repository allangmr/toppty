"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./admin-ui";

export type TableFilter = {
  id: string;
  label: string;
};

export type TableColumn<T> = {
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

export function AdminDataTable<T>({
  rows,
  columns,
  getKey,
  searchPlaceholder,
  searchText,
  filters,
  filterMatch,
  initialFilter = "todos",
  emptyTitle,
  emptyBody,
}: {
  rows: T[];
  columns: TableColumn<T>[];
  getKey: (row: T) => string;
  searchPlaceholder: string;
  searchText: (row: T) => string;
  filters: TableFilter[];
  filterMatch: (row: T, filterId: string) => boolean;
  initialFilter?: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(
    filters.some((item) => item.id === initialFilter)
      ? initialFilter
      : (filters[0]?.id ?? "todos"),
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!filterMatch(row, filter)) return false;
      if (!needle) return true;
      return searchText(row).toLowerCase().includes(needle);
    });
  }, [filter, filterMatch, query, rows, searchText]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1 sm:max-w-sm">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <div className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === item.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {visible.length} de {rows.length}
        {query.trim() ? ` · “${query.trim()}”` : ""}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? emptyTitle : "Nada coincide"}
          body={
            rows.length === 0
              ? emptyBody
              : "Prueba otro nombre o cambia el filtro."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/70 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    className={cn("px-4 py-3 font-semibold", column.className)}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={getKey(row)}
                  className="border-t border-border/80 hover:bg-muted/40"
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={cn("px-4 py-3 align-middle", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
