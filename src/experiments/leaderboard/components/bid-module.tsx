"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobeIcon } from "@/components/icons";
import { trackClient } from "@/components/track-client";
import { centsToDollars, dollarsToCents, formatUsd } from "@/lib/utils";
import {
  createCheckout,
  lookupIdentity,
  type CheckoutState,
} from "../actions/create-checkout";
import { leaderboardConfig } from "../config";
import { copy } from "../copy";
import { estimateRank } from "../ranking";
import type { RankedListing } from "../types";
import { useBid } from "./bid-context";

const initialState: CheckoutState | null = null;

export function BidModule({
  takeFirstCents,
  listings,
}: {
  takeFirstCents: number;
  listings: RankedListing[];
}) {
  const router = useRouter();
  const { amountDollars, setAmountDollars } = useBid();
  const [identifier, setIdentifier] = useState("");
  const [lookup, setLookup] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [state, action, pending] = useActionState(createCheckout, initialState);
  const lastAmount = useRef(amountDollars);

  const amountCents = dollarsToCents(amountDollars);
  const takeFirstDollars = centsToDollars(takeFirstCents);
  const estimated = useMemo(
    () => estimateRank(amountCents, listings),
    [amountCents, listings],
  );

  useEffect(() => {
    if (state?.ok) router.push(state.url);
  }, [router, state]);

  useEffect(() => {
    if (amountDollars === lastAmount.current) return;
    lastAmount.current = amountDollars;
    const handle = window.setTimeout(() => {
      trackClient("bid_amount_changed", { amountDollars });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [amountDollars]);

  function bump(delta: number) {
    setAmountDollars(Math.max(1, amountDollars + delta));
  }

  function markStarted() {
    if (started) return;
    setStarted(true);
    trackClient("bid_form_started");
  }

  async function onIdentifierBlur() {
    if (!identifier.trim()) {
      setLookup(null);
      return;
    }
    const result = await lookupIdentity(identifier);
    if (result.ok && result.exists) {
      setLookup(
        `${copy.alreadyIn} Ahora mismo ${result.displayName} va con ${formatUsd(result.totalBidCents ?? 0)}.`,
      );
    } else if (result.ok) {
      setLookup(null);
    } else {
      setLookup(result.error);
    }
  }

  const helper =
    estimated === 1
      ? "Vas por el #1."
      : `Con ${formatUsd(amountCents)} caes en el #${estimated}.`;

  const gapToFirst = Math.max(0, takeFirstDollars - amountDollars);
  const nextHint =
    estimated > 1 && gapToFirst > 0
      ? ` Te faltan ${formatUsd(dollarsToCents(gapToFirst))} para el #1.`
      : "";

  return (
    <section id="subir" className="scroll-mt-6 animate-fade-up">
      <h1 className="flex flex-wrap items-center justify-center gap-x-2 text-center text-[28px] font-bold tracking-[-0.03em] text-pretty md:text-[40px]">
        <span>{copy.takeNumberOne}</span>
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              markStarted();
              bump(-1);
            }}
            aria-label="Bajar monto un dólar"
            className="motion-press inline-flex size-6 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary transition-colors hover:bg-primary/25"
          >
            −
          </button>
          <label className="relative inline-block text-primary">
            <span className="sr-only">Monto en dólares</span>
            <span className="invisible whitespace-nowrap tabular-nums" aria-hidden>
              ${amountDollars}
            </span>
            <span
              key={amountDollars}
              className="amount-dash animate-pop absolute inset-0 flex items-baseline pb-0.5"
            >
              <span aria-hidden>$</span>
              <input
                name="amountDollarsDisplay"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amountDollars}
                onFocus={markStarted}
                onChange={(event) => {
                  markStarted();
                  const next = event.target.value.replace(/[^\d]/g, "");
                  setAmountDollars(next ? Math.max(1, Number(next)) : 1);
                }}
                className="w-full min-w-0 bg-transparent p-0 font-[inherit] text-[inherit] tracking-[inherit] tabular-nums outline-none"
              />
            </span>
          </label>
          <button
            type="button"
            onClick={() => {
              markStarted();
              bump(1);
            }}
            aria-label="Subir monto un dólar"
            className="motion-press inline-flex size-6 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary transition-colors hover:bg-primary/25"
          >
            +
          </button>
        </span>
      </h1>

      <p className="mx-auto mt-2 max-w-md text-center text-sm font-medium leading-relaxed text-pretty text-muted-foreground">
        <span className="text-primary/70">
          Los puestos nuevos empiezan en{" "}
          {formatUsd(leaderboardConfig.minBidCents)}.
        </span>{" "}
        Pagar menos que el #1 igual te pone en el ranking en el puesto que
        alcance tu monto.
      </p>

      <form action={action} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="amountDollars" value={amountDollars} />
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">
              <GlobeIcon className="size-3.5" />
            </span>
            <input
              id="identifier"
              name="identifier"
              value={identifier}
              onFocus={markStarted}
              onChange={(event) => setIdentifier(event.target.value)}
              onBlur={() => void onIdentifierBlur()}
              placeholder={copy.identifierLabel}
              aria-label={copy.identifierLabel}
              autoComplete="off"
              spellCheck={false}
              required
              className="h-11 w-full min-w-0 rounded-xl border border-input bg-transparent py-1 pr-3 pl-10 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <button
            type="submit"
            disabled={pending || !identifier.trim()}
            className="motion-press inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {pending ? "Abriendo pago…" : copy.submit}
          </button>
        </div>

        <p className="text-center text-xs leading-relaxed text-pretty text-muted-foreground">
          {copy.identifierHint}
        </p>
        <p
          key={`${estimated}-${amountDollars}`}
          className="animate-pop text-center text-sm text-muted-foreground"
        >
          {helper}
          {nextHint}
        </p>
        {lookup ? (
          <p className="text-center text-sm text-muted-foreground">{lookup}</p>
        ) : null}
        {state && !state.ok ? (
          <p className="text-center text-sm text-destructive">{state.error}</p>
        ) : null}
      </form>
    </section>
  );
}
