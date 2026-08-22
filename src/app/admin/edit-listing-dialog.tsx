"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { refreshListingImage, updateListing } from "./actions";

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 140;

export type ListingEditValues = {
  id: string;
  displayName: string;
  description: string | null;
  imageUrl: string | null;
  identifierType: "website" | "social";
};

export function EditListingButton({ listing }: { listing: ListingEditValues }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(listing.displayName);
  const [description, setDescription] = useState(listing.description ?? "");
  const [imageUrl, setImageUrl] = useState(listing.imageUrl ?? "");

  function resetFields() {
    setDisplayName(listing.displayName);
    setDescription(listing.description ?? "");
    setImageUrl(listing.imageUrl ?? "");
    setPending(false);
    setRefreshing(false);
    setDone(false);
    setError(null);
  }

  function close() {
    setOpen(false);
    resetFields();
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setPending(false);
        setRefreshing(false);
        setDone(false);
        setError(null);
        setDisplayName(listing.displayName);
        setDescription(listing.description ?? "");
        setImageUrl(listing.imageUrl ?? "");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("button, input, textarea")
        ?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [listing.description, listing.displayName, listing.imageUrl, open]);

  async function submit() {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", listing.id);
    formData.set("displayName", displayName);
    formData.set("description", description);
    formData.set("imageUrl", imageUrl);
    const result = await updateListing(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  async function refreshImage() {
    setRefreshing(true);
    setError(null);
    const result = await refreshListingImage(listing.id);
    setRefreshing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setImageUrl(result.imageUrl);
  }

  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            role="presentation"
          >
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute inset-0 bg-foreground/45 backdrop-blur-[3px]"
              onClick={close}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-[1] max-h-[min(90dvh,40rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
              onClick={(event) => event.stopPropagation()}
            >
              {done ? (
                <div className="space-y-4">
                  <p
                    id={titleId}
                    className="text-2xl font-bold tracking-[-0.03em]"
                  >
                    Listo
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ya quedó actualizado el título, la descripción y la imagen.
                  </p>
                  <button
                    type="button"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
                    onClick={close}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        id={titleId}
                        className="text-2xl font-bold tracking-[-0.03em]"
                      >
                        Editar
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cambia título, descripción o imagen si hubo un lío.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-lg leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  </div>

                  <label className="block text-sm font-medium">
                    Título
                    <input
                      className="mt-1.5 h-11 w-full rounded-xl border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={displayName}
                      onChange={(event) =>
                        setDisplayName(event.target.value.slice(0, TITLE_MAX))
                      }
                      maxLength={TITLE_MAX}
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Descripción (opcional)
                    <textarea
                      className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value.slice(0, DESCRIPTION_MAX),
                        )
                      }
                      maxLength={DESCRIPTION_MAX}
                      placeholder="Una línea pa' que sepan quién es"
                    />
                  </label>

                  <div className="block text-sm font-medium">
                    Imagen (URL)
                    <div className="mt-1.5 flex items-center gap-3">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview of remote listing art
                        <img
                          src={imageUrl}
                          alt=""
                          width={44}
                          height={44}
                          className="size-11 shrink-0 rounded-xl bg-muted object-cover"
                        />
                      ) : (
                        <div className="size-11 shrink-0 rounded-xl bg-muted" />
                      )}
                      <input
                        className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        placeholder="https://…"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {imageUrl ? (
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          Quitar imagen
                        </button>
                      ) : null}
                      {listing.identifierType === "website" ? (
                        <button
                          type="button"
                          disabled={refreshing}
                          onClick={() => void refreshImage()}
                          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
                        >
                          {refreshing ? "Buscando…" : "Traer imagen del sitio"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
                      onClick={close}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={pending || !displayName.trim()}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pending ? "Guardando…" : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          resetFields();
          setOpen(true);
        }}
        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-semibold transition-colors hover:bg-muted"
      >
        Editar
      </button>
      {dialog}
    </>
  );
}
