"use client";

import type { MouseEvent, ReactNode } from "react";

export function ListingGoLink({
  slug,
  className,
  children,
  onNavigate,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const href = `/go/${slug}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    const tab = window.open(href, "_blank", "noopener,noreferrer");
    if (!tab) window.location.assign(href);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
