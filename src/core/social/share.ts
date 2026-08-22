import { getAppUrl } from "@/lib/utils";

export function listingUrl(slug: string, ref?: string) {
  const url = new URL(`/p/${slug}`, getAppUrl());
  if (ref) url.searchParams.set("ref", ref);
  return url.toString();
}

export function activityUrl(id: string) {
  return `${getAppUrl()}/activity/${id}`;
}

export function shareText(input: {
  rank: number;
  displayName: string;
  url: string;
}) {
  if (input.rank === 1) {
    return `Toy #1 en TopPTY 👑🇵🇦\n\nA ver cuánto duro arriba.\n\n${input.url}`;
  }
  return `${input.displayName} ta #${input.rank} en TopPTY 🇵🇦\n\n${input.url}`;
}
