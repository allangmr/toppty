"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { hideListing, removeListing, restoreListing } from "./actions";
import {
  EditListingButton,
  type ListingEditValues,
} from "./edit-listing-dialog";

function ActionButton({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger" &&
          "border border-destructive/25 text-destructive hover:bg-destructive/10",
        tone === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/80",
        tone === "neutral" &&
          "border border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function ListingActions({
  id,
  status,
  listing,
}: {
  id: string;
  status: "active" | "hidden" | "removed";
  listing?: ListingEditValues;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {listing ? <EditListingButton listing={listing} /> : null}
      {status === "active" ? (
        <form action={hideListing}>
          <input type="hidden" name="id" value={id} />
          <ActionButton label="Ocultar" />
        </form>
      ) : null}
      {status === "hidden" ? (
        <form action={restoreListing}>
          <input type="hidden" name="id" value={id} />
          <ActionButton label="Restaurar" tone="primary" />
        </form>
      ) : null}
      <form
        action={removeListing}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Esto borra el registro del todo. Después se puede volver a publicar el mismo perfil. ¿Seguro?",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <ActionButton label="Eliminar" tone="danger" />
      </form>
    </div>
  );
}
