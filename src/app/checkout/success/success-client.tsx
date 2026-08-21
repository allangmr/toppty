"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { formatUsd } from "@/lib/utils";

type BidStatus = {
  status: string;
  amountCents: number;
  displayName: string | null;
  slug: string | null;
  rank: number | null;
};

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const bidId = params.get("bid");
  const [status, setStatus] = useState<BidStatus | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!bidId) return;
    let cancelled = false;
    async function poll() {
      const response = await fetch(`/api/bids/${bidId}`, { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const json = (await response.json()) as BidStatus;
      setStatus(json);
      setTries((n) => n + 1);
    }
    void fetch("/api/paypal/capture", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bidId }),
    }).finally(() => {
      if (!cancelled) void poll();
    });
    const timer = window.setInterval(poll, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [bidId]);

  const paid = status?.status === "paid";
  const failed = status?.status === "failed";

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-4 px-4 py-12">
        {paid ? (
          <>
            <p className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
              Ya estás dentro.
            </p>
            <p className="text-lg text-muted-foreground">
              {status.displayName} quedó #{status.rank} con{" "}
              {formatUsd(status.amountCents)}.
            </p>
            {status.rank === 1 ? (
              <p className="text-xl font-semibold text-primary">
                Nuevo #1 en PTY
              </p>
            ) : (
              <p className="text-muted-foreground">A ver cuánto duras ahí.</p>
            )}
            <Link
              href="/#ranking"
              className="mt-4 inline-flex h-11 w-fit items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Ver el ranking
            </Link>
          </>
        ) : failed ? (
          <>
            <p className="text-4xl font-bold tracking-[-0.04em]">
              El pago no pasó.
            </p>
            <Link
              href="/#subir"
              className="text-primary underline-offset-2 hover:underline"
            >
              Inténtalo otra vez
            </Link>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
              Confirmando tu pago…
            </p>
            <p className="text-muted-foreground">
              No cerramos con el redirect. Esperamos la confirmación real.
              {tries > 8 ? " Si tarda, recarga en un minuto." : ""}
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
