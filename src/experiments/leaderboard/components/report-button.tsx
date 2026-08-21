"use client";

import { useState } from "react";
import { reportListing } from "../actions/report-listing";

const REASONS = [
  { value: "scam", label: "Estafa o phishing" },
  { value: "malicious", label: "Sitio malicioso" },
  { value: "illegal", label: "Contenido ilegal" },
  { value: "pornography", label: "Pornografía" },
  { value: "hate", label: "Odio" },
  { value: "other", label: "Otro" },
] as const;

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("scam");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const result = await reportListing({ listingId, reason, details });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Reportar
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            {done ? (
              <div className="space-y-3">
                <p id="report-title" className="text-xl font-bold tracking-[-0.03em]">
                  Gracias
                </p>
                <p className="text-sm text-muted-foreground">
                  Lo revisamos. No hace falta que lo digas dos veces.
                </p>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
              >
                <p id="report-title" className="text-xl font-bold tracking-[-0.03em]">
                  Reportar
                </p>
                <label className="block text-sm">
                  Motivo
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-transparent px-3"
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
                <label className="block text-sm">
                  Detalle (opcional)
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-xl border border-input bg-transparent px-3 py-2"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    maxLength={500}
                  />
                </label>
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
