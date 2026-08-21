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
    void poll();
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-12">
        {paid ? (
          <>
            <p className="font-display text-5xl leading-none">Ya estás dentro.</p>
            <p className="text-lg">
              {status.displayName} quedó #{status.rank} con{" "}
              {formatUsd(status.amountCents)}.
            </p>
            {status.rank === 1 ? (
              <p className="font-display text-2xl">Nuevo rey de PTY 👑</p>
            ) : (
              <p>A ver cuánto duras ahí.</p>
            )}
            <Link
              href="/#ranking"
              className="mt-4 border-2 border-ink bg-ink px-4 py-3 text-center font-display text-xl tracking-widest text-cream"
            >
              VER EL RANKING
            </Link>
          </>
        ) : failed ? (
          <>
            <p className="font-display text-5xl">El pago no pasó.</p>
            <Link href="/#subir" className="underline">
              Inténtalo otra vez
            </Link>
          </>
        ) : (
          <>
            <p className="font-display text-5xl leading-none">
              Confirmando tu pago…
            </p>
            <p className="text-muted">
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
