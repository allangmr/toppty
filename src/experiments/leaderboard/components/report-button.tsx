"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { reportListing } from "../actions/report-listing";
import { copy } from "../copy";

const REASONS = [
  { value: "scam", label: "Estafa o phishing" },
  { value: "malicious", label: "Sitio malicioso" },
  { value: "illegal", label: "Contenido ilegal" },
  { value: "pornography", label: "Pornografía" },
  { value: "hate", label: "Odio" },
  { value: "other", label: "Otro" },
] as const;

export function ReportButton({ listingId }: { listingId: string }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [reason, setReason] =
    useState<(typeof REASONS)[number]["value"]>("scam");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setPending(false);
        setDone(false);
        setError(null);
        setDetails("");
        setReason("scam");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("button, select, textarea")
        ?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setPending(false);
    setDone(false);
    setError(null);
    setDetails("");
    setReason("scam");
  }

  async function submit() {
    setPending(true);
    setError(null);
    const result = await reportListing({ listingId, reason, details });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  const dialog =
    open && mounted
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
              className="relative z-[1] w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
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
                    {copy.reported}
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
                        Reportar
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cuéntanos qué ta mal con este puesto.
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
                    Motivo
                    <select
                      className="mt-1.5 h-11 w-full rounded-xl border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={reason}
                      onChange={(event) =>
                        setReason(event.target.value as typeof reason)
                      }
                    >
                      {REASONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium">
                    Detalle (opcional)
                    <textarea
                      className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={details}
                      onChange={(event) => setDetails(event.target.value)}
                      maxLength={500}
                      placeholder="Links, contexto, lo que veas raro…"
                    />
                  </label>

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
                      disabled={pending}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pending ? "Enviando…" : "Enviar reporte"}
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
          setOpen(true);
        }}
        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Reportar
      </button>
      {dialog}
    </>
  );
}
