"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  GlobeIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
} from "@/components/icons";
import { trackClient } from "@/components/track-client";
import { centsToDollars, dollarsToCents, formatUsd } from "@/lib/utils";
import {
  createCheckout,
  lookupIdentity,
  type CheckoutState,
} from "../actions/create-checkout";
import { copy } from "../copy";
import { faviconUrlForDomain, parseIdentity } from "../identity";
import { estimateRank } from "../ranking";
import type { RankedListing, SocialNetwork } from "../types";
import { useBid } from "./bid-context";

const initialState: CheckoutState | null = null;
const DESCRIPTION_MAX = 140;

function SocialPreviewIcon({
  network,
  className,
}: {
  network: SocialNetwork;
  className?: string;
}) {
  if (network === "instagram") return <InstagramIcon className={className} />;
  if (network === "tiktok") return <TikTokIcon className={className} />;
  return <XIcon className={className} />;
}

function IdentityPreviewIcon({ identifier }: { identifier: string }) {
  const [brokenFaviconUrl, setBrokenFaviconUrl] = useState<string | null>(null);

  const preview = useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return { kind: "empty" as const };

    const parsed = parseIdentity(trimmed);
    if (!parsed.ok) return { kind: "fallback" as const };

    if (
      parsed.identity.identifierType === "social" &&
      parsed.identity.socialNetwork
    ) {
      return {
        kind: "social" as const,
        network: parsed.identity.socialNetwork,
      };
    }

    const faviconUrl = faviconUrlForDomain(parsed.identity.displayName);
    if (!faviconUrl) return { kind: "fallback" as const };
    return { kind: "website" as const, faviconUrl };
  }, [identifier]);

  if (preview.kind === "social") {
    return (
      <SocialPreviewIcon
        network={preview.network}
        className="size-3.5 text-foreground"
      />
    );
  }

  if (
    preview.kind === "website" &&
    preview.faviconUrl !== brokenFaviconUrl
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote favicons vary by host
      <img
        src={preview.faviconUrl}
        alt=""
        width={14}
        height={14}
        className="size-3.5 rounded-sm"
        onError={() => setBrokenFaviconUrl(preview.faviconUrl)}
      />
    );
  }

  return <GlobeIcon className="size-3.5" />;
}

export function BidModule({
  takeFirstCents,
  listings,
  claim,
  intro,
}: {
  takeFirstCents: number;
  listings: RankedListing[];
  claim: ReactNode;
  intro: ReactNode;
}) {
  const router = useRouter();
  const { amountDollars, setAmountDollars } = useBid();
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
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
    if (!state?.ok) return;
    // PayPal (and any absolute checkout URL) must be a full browser navigation.
    // router.push() on an external host can trip the App Router error boundary.
    const url = state.url;
    if (/^https?:\/\//i.test(url)) {
      window.location.assign(url);
      return;
    }
    router.push(url);
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
      ? copy.goingFirst
      : copy.landingAt(formatUsd(amountCents), estimated);

  const gapToFirst = Math.max(0, takeFirstDollars - amountDollars);
  const nextHint =
    estimated > 1 && gapToFirst > 0
      ? copy.shortToFirst(formatUsd(dollarsToCents(gapToFirst)))
      : "";

  return (
    <section id="subir" className="scroll-mt-6">
      <h1 className="flex flex-wrap items-center justify-center gap-x-2 text-center text-[28px] font-bold tracking-[-0.03em] md:text-[40px]">
        {claim}
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
              className="amount-dash absolute inset-0 flex items-baseline pb-0.5"
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

      {intro}

      <form action={action} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="amountDollars" value={amountDollars} />
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">
              <IdentityPreviewIcon identifier={identifier} />
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
            {pending ? copy.openingPay : copy.submit}
          </button>
        </div>

        <p className="text-center text-xs font-medium tracking-wide text-muted-foreground">
          {copy.identifierPrefixes}
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="sr-only">
            {copy.descriptionLabel}
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onFocus={markStarted}
            onChange={(event) =>
              setDescription(event.target.value.slice(0, DESCRIPTION_MAX))
            }
            placeholder={copy.descriptionPlaceholder}
            maxLength={DESCRIPTION_MAX}
            rows={2}
            className="min-h-[4.5rem] w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-center text-xs text-muted-foreground">
            {copy.descriptionHint}
            {description.length > 0
              ? ` · ${description.length}/${DESCRIPTION_MAX}`
              : ""}
          </p>
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
