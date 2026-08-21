"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
    <section
      id="subir"
      className="scroll-mt-24 border-2 border-ink bg-bg-card p-4 shadow-[4px_4px_0_#161412] sm:p-6"
    >
      <p className="font-display text-xl tracking-[0.18em] text-muted sm:text-2xl">
        {copy.takeNumberOne}
      </p>
      <p className="font-display text-[clamp(4.5rem,22vw,8.5rem)] leading-none">
        {formatUsd(takeFirstCents)}
      </p>

      <form action={action} className="mt-4 space-y-3">
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => {
              markStarted();
              bump(-1);
            }}
            className="h-14 w-14 shrink-0 border-2 border-ink bg-paper font-display text-3xl leading-none"
            aria-label="Bajar monto"
          >
            −
          </button>
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Monto en dólares</span>
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-display text-3xl">
              $
            </span>
            <input
              name="amountDollars"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amountDollars}
              onFocus={markStarted}
              onChange={(event) => {
                markStarted();
                const next = event.target.value.replace(/[^\d]/g, "");
                setAmountDollars(next ? Math.max(1, Number(next)) : 1);
              }}
              className="h-14 w-full border-2 border-ink bg-cream pl-8 text-center font-display text-3xl"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              markStarted();
              bump(1);
            }}
            className="h-14 w-14 shrink-0 border-2 border-ink bg-paper font-display text-3xl leading-none"
            aria-label="Subir monto"
          >
            +
          </button>
        </div>

        <label className="block">
          <span className="sr-only">{copy.identifierLabel}</span>
          <input
            id="identifier"
            name="identifier"
            value={identifier}
            onFocus={markStarted}
            onChange={(event) => setIdentifier(event.target.value)}
            onBlur={() => void onIdentifierBlur()}
            placeholder={copy.identifierLabel}
            autoComplete="off"
            spellCheck={false}
            required
            className="h-14 w-full border-2 border-ink bg-cream px-3 text-base"
          />
        </label>
        <p className="text-xs text-muted">{copy.identifierHint}</p>

        <p className="text-sm">
          {helper}
          {nextHint}
        </p>
        {lookup ? <p className="text-sm">{lookup}</p> : null}
        {state && !state.ok ? (
          <p className="text-sm text-accent">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="h-14 w-full border-2 border-ink bg-ink font-display text-2xl tracking-[0.18em] text-cream shadow-[4px_4px_0_#161412] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
        >
          {pending ? "ABRIENDO PAGO…" : copy.submit}
        </button>
        <p className="text-sm text-muted">{copy.submitHint}</p>
        <p className="text-[11px] text-muted">
          Mínimo {formatUsd(leaderboardConfig.minBidCents)}. Cada peso extra
          cuenta.
        </p>
      </form>
    </section>
  );
}
