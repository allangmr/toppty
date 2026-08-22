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
import {
  previewListingMeta,
  type ListingPreviewMeta,
} from "../actions/preview-listing-meta";
import { copy } from "../copy";
import { faviconUrlForDomain, parseIdentity } from "../identity";
import { estimateRank } from "../ranking";
import type { RankedListing, SocialNetwork } from "../types";
import { useBid } from "./bid-context";
import {
  ListingPreview,
  type ListingDraft,
} from "./listing-preview";

const initialState: CheckoutState | null = null;

type AutoMeta = Extract<ListingPreviewMeta, { ok: true }>;

type DraftOverrides = {
  displayName?: string;
  description?: string;
  imageUrl?: string;
};

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

  if (preview.kind === "website" && preview.faviconUrl !== brokenFaviconUrl) {
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
  const [lookup, setLookup] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [autoMeta, setAutoMeta] = useState<AutoMeta | null>(null);
  const [overrides, setOverrides] = useState<DraftOverrides>({});
  const [metaLoading, setMetaLoading] = useState(false);
  const [state, action, pending] = useActionState(createCheckout, initialState);
  const lastAmount = useRef(amountDollars);
  const metaRequest = useRef(0);
  const draftRef = useRef<ListingDraft | null>(null);

  const amountCents = dollarsToCents(amountDollars);
  const takeFirstDollars = centsToDollars(takeFirstCents);
  const estimated = useMemo(
    () => estimateRank(amountCents, listings),
    [amountCents, listings],
  );

  const parsedIdentity = useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    const result = parseIdentity(trimmed);
    return result.ok ? result.identity : null;
  }, [identifier]);

  const showPreview = Boolean(identifier.trim());

  const draft: ListingDraft = useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return {
        displayName: "",
        description: "",
        imageUrl: "",
        identityType: null,
        socialNetwork: null,
      };
    }

    const identityType =
      autoMeta?.identityType ?? parsedIdentity?.identifierType ?? null;
    const socialNetwork =
      autoMeta?.socialNetwork ?? parsedIdentity?.socialNetwork ?? null;
    const fallbackName =
      autoMeta?.displayName ||
      parsedIdentity?.displayName ||
      trimmed;
    const fallbackImage =
      identityType === "website"
        ? autoMeta?.imageUrl ||
          faviconUrlForDomain(
            parsedIdentity?.displayName ||
              (fallbackName.includes(".") ? fallbackName : trimmed),
          ) ||
          ""
        : "";

    return {
      identityType,
      socialNetwork,
      displayName: overrides.displayName ?? fallbackName,
      description: overrides.description ?? autoMeta?.description ?? "",
      imageUrl: overrides.imageUrl ?? fallbackImage,
    };
  }, [identifier, autoMeta, overrides, parsedIdentity]);

  draftRef.current = draft;

  useEffect(() => {
    if (!state?.ok) return;
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

  useEffect(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return;

    const requestId = ++metaRequest.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await previewListingMeta(trimmed);
          if (requestId !== metaRequest.current) return;
          if (result.ok) setAutoMeta(result);
          else setAutoMeta(null);
        } finally {
          if (requestId === metaRequest.current) setMetaLoading(false);
        }
      })();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [identifier]);

  function bump(delta: number) {
    setAmountDollars(Math.max(1, amountDollars + delta));
  }

  function markStarted() {
    if (started) return;
    setStarted(true);
    trackClient("bid_form_started");
  }

  function patchDraft(next: Partial<ListingDraft>) {
    setOverrides((prev) => ({
      ...prev,
      ...(next.displayName !== undefined
        ? { displayName: next.displayName }
        : {}),
      ...(next.description !== undefined
        ? { description: next.description }
        : {}),
      ...(next.imageUrl !== undefined ? { imageUrl: next.imageUrl } : {}),
    }));
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

      <form
        action={action}
        className="mt-4 flex flex-col gap-3"
        onSubmit={(event) => {
          // Flush in-progress preview edits before FormData is collected.
          const active = document.activeElement;
          if (active instanceof HTMLElement) active.blur();

          const latest = draftRef.current;
          if (!latest) return;
          const form = event.currentTarget;
          for (const [name, value] of [
            ["displayName", latest.displayName],
            ["description", latest.description],
            ["imageUrl", latest.imageUrl],
          ] as const) {
            const field = form.elements.namedItem(name);
            if (field instanceof HTMLInputElement) field.value = value;
          }
        }}
      >
        <input type="hidden" name="amountDollars" value={amountDollars} />
        <input type="hidden" name="displayName" value={draft.displayName} />
        <input type="hidden" name="description" value={draft.description} />
        <input type="hidden" name="imageUrl" value={draft.imageUrl} />
        <div className="relative min-w-0">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">
            <IdentityPreviewIcon identifier={identifier} />
          </span>
          <input
            id="identifier"
            name="identifier"
            value={identifier}
            onFocus={markStarted}
            onChange={(event) => {
              markStarted();
              const next = event.target.value;
              setIdentifier(next);
              setOverrides({});
              setAutoMeta(null);
              if (next.trim()) setMetaLoading(true);
              else setMetaLoading(false);
            }}
            onBlur={() => void onIdentifierBlur()}
            placeholder={copy.identifierLabel}
            aria-label={copy.identifierLabel}
            autoComplete="off"
            spellCheck={false}
            required
            className="h-11 w-full min-w-0 rounded-xl border border-input bg-transparent py-1 pr-3 pl-10 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <p className="text-center text-xs font-medium tracking-wide text-muted-foreground">
          {copy.identifierPrefixes}
        </p>

        {showPreview ? (
          <ListingPreview
            draft={draft}
            onChange={patchDraft}
            estimatedRank={estimated}
            amountCents={amountCents}
            loading={metaLoading}
          />
        ) : null}

        <button
          type="submit"
          disabled={pending || !identifier.trim() || !parsedIdentity}
          className="motion-press inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? copy.openingPay : copy.submit}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-pretty text-muted-foreground">
          {copy.checkoutAck}
        </p>

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
