"use server";

import { fetchWebsiteMeta, parseIdentity } from "../identity";
import type { SocialNetwork } from "../types";

export type ListingPreviewMeta =
  | {
      ok: true;
      identityType: "social";
      socialNetwork: SocialNetwork;
      displayName: string;
      description: string | null;
      imageUrl: null;
    }
  | {
      ok: true;
      identityType: "website";
      socialNetwork: null;
      displayName: string;
      description: string | null;
      imageUrl: string | null;
    }
  | { ok: false; error: string };

export async function previewListingMeta(
  identifier: string,
): Promise<ListingPreviewMeta> {
  const parsed = parseIdentity(identifier);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { identity } = parsed;
  if (identity.identifierType === "social" && identity.socialNetwork) {
    return {
      ok: true,
      identityType: "social",
      socialNetwork: identity.socialNetwork,
      displayName: identity.displayName,
      description: null,
      imageUrl: null,
    };
  }

  const meta = await fetchWebsiteMeta(identity.destinationUrl);
  return {
    ok: true,
    identityType: "website",
    socialNetwork: null,
    displayName: meta?.title || identity.displayName,
    description: meta?.description || null,
    imageUrl: meta?.imageUrl || null,
  };
}
