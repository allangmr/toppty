"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PencilIcon } from "@/components/icons";
import { formatUsd, cn } from "@/lib/utils";
import { copy } from "../copy";
import type { SocialNetwork } from "../types";
import { ListingAvatar } from "./avatar";

export type ListingDraft = {
  displayName: string;
  description: string;
  imageUrl: string;
  identityType: "website" | "social" | null;
  socialNetwork: SocialNetwork | null;
};

type EditField = "title" | "description" | "logo" | null;

export function ListingPreview({
  draft,
  onChange,
  estimatedRank,
  amountCents,
  loading,
}: {
  draft: ListingDraft;
  onChange: (next: Partial<ListingDraft>) => void;
  estimatedRank: number;
  amountCents: number;
  loading?: boolean;
}) {
  const [editing, setEditing] = useState<EditField>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descId = useId();
  const logoId = useId();

  useEffect(() => {
    if (editing === "title") titleRef.current?.focus();
    if (editing === "description") descRef.current?.focus();
    if (editing === "logo") logoRef.current?.focus();
  }, [editing]);

  return (
    <div className="animate-card-in glass-card overflow-hidden rounded-[20px] border border-primary/20">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-primary/5 px-4 py-2.5">
        <p className="font-display text-xs font-bold tracking-wide text-primary uppercase">
          {copy.previewLabel}
        </p>
        <p className="text-[11px] text-muted-foreground">{copy.previewHint}</p>
      </div>

      <div
        className={cn(
          "relative px-3 py-3 transition-opacity md:px-4 md:py-3.5",
          loading ? "opacity-60" : "opacity-100",
        )}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex w-10 shrink-0 flex-col items-center gap-1.5 md:w-auto md:flex-row md:gap-3">
            <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-primary px-1.5 py-px text-xs font-semibold text-primary-foreground md:min-w-11 md:px-2 md:text-base">
              #{estimatedRank}
            </span>
            <div className="group/logo relative">
              <ListingAvatar
                name={draft.displayName || "PTY"}
                imageUrl={draft.imageUrl || null}
                socialNetwork={draft.socialNetwork}
                size="md"
              />
              <button
                type="button"
                onClick={() => setEditing("logo")}
                className="absolute -right-1 -bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform hover:scale-105"
                aria-label={copy.previewEditLogo}
                title={copy.previewEditLogo}
              >
                <PencilIcon className="size-2.5" />
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <div className="group/title relative min-w-0 flex-1">
                {editing === "title" ? (
                  <input
                    ref={titleRef}
                    id={titleId}
                    value={draft.displayName}
                    maxLength={80}
                    onChange={(event) =>
                      onChange({ displayName: event.target.value.slice(0, 80) })
                    }
                    onBlur={() => setEditing(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "Escape") {
                        event.preventDefault();
                        setEditing(null);
                      }
                    }}
                    className="h-8 w-full rounded-lg border border-ring bg-transparent px-2 text-sm font-bold outline-none md:text-base"
                    aria-label={copy.previewEditTitle}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing("title")}
                    className="flex w-full min-w-0 items-center gap-1.5 text-left"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-bold tracking-[-0.02em] md:text-base">
                      {draft.displayName || copy.previewTitlePlaceholder}
                    </span>
                    <PencilIcon className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/title:opacity-100" />
                  </button>
                )}
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-primary md:text-base">
                {formatUsd(amountCents)}
              </p>
            </div>

            <div className="group/desc relative">
              {editing === "description" ? (
                <textarea
                  ref={descRef}
                  id={descId}
                  value={draft.description}
                  maxLength={140}
                  rows={2}
                  onChange={(event) =>
                    onChange({
                      description: event.target.value.slice(0, 140),
                    })
                  }
                  onBlur={() => setEditing(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      setEditing(null);
                    }
                  }}
                  placeholder={copy.previewDescPlaceholder}
                  className="w-full resize-none rounded-lg border border-ring bg-transparent px-2 py-1.5 text-xs outline-none md:text-sm"
                  aria-label={copy.previewEditDesc}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing("description")}
                  className="flex w-full items-start gap-1.5 text-left"
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1 line-clamp-2 text-xs md:text-sm",
                      draft.description
                        ? "text-muted-foreground"
                        : "text-muted-foreground/70 italic",
                    )}
                  >
                    {draft.description || copy.previewDescPlaceholder}
                  </span>
                  <PencilIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/desc:opacity-100" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground md:text-xs">
              preview · recién · 0 clicks
            </p>
          </div>
        </div>

        {editing === "logo" ? (
          <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
            <label
              htmlFor={logoId}
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              {copy.previewLogoUrl}
            </label>
            <input
              ref={logoRef}
              id={logoId}
              value={draft.imageUrl}
              onChange={(event) => onChange({ imageUrl: event.target.value })}
              onBlur={() => setEditing(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.preventDefault();
                  setEditing(null);
                }
              }}
              placeholder={
                draft.identityType === "social"
                  ? "https://… (vacío = logo de la red)"
                  : "https://…"
              }
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
