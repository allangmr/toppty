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
        className="text-xs text-muted underline-offset-2 hover:underline"
      >
        Reportar
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
        >
          <div className="w-full max-w-md border-2 border-ink bg-bg-card p-4 shadow-[4px_4px_0_#161412]">
            {done ? (
              <div className="space-y-3">
                <p id="report-title" className="font-display text-2xl">
                  Gracias
                </p>
                <p>Lo revisamos. No hace falta que lo digas dos veces.</p>
                <button
                  type="button"
                  className="border-2 border-ink bg-ink px-3 py-2 font-display tracking-widest text-cream"
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
                <p id="report-title" className="font-display text-2xl">
                  Reportar
                </p>
                <label className="block text-sm">
                  Motivo
                  <select
                    className="mt-1 w-full border-2 border-ink bg-cream px-2 py-2"
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
                    className="mt-1 min-h-20 w-full border-2 border-ink bg-cream px-2 py-2"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    maxLength={500}
                  />
                </label>
                {error ? <p className="text-sm text-accent">{error}</p> : null}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="border-2 border-ink bg-ink px-3 py-2 font-display tracking-widest text-cream"
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    className="border-2 border-ink px-3 py-2"
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
