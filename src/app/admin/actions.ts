"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isValidAdminCookie, ADMIN_COOKIE } from "@/core/admin/auth";
import { getDb, listings } from "@/core/db";
import { purgeListingById } from "@/core/db/purge-listing";
import { isSafeHttpUrl } from "@/core/security/urls";
import { fetchWebsiteMeta } from "@/experiments/leaderboard/identity";

async function requireAdmin() {
  const store = await cookies();
  if (!(await isValidAdminCookie(store.get(ADMIN_COOKIE)?.value))) {
    throw new Error("Unauthorized");
  }
}

function revalidateListing(slug?: string) {
  revalidateTag("home", "max");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/p/${slug}`);
}

export async function logout() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}

export async function hideListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const db = getDb();
  const [row] = await db
    .update(listings)
    .set({ moderationStatus: "hidden", updatedAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.moderationStatus, "active")))
    .returning({ slug: listings.slug });
  revalidateListing(row?.slug);
}

export async function removeListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const db = getDb();
  const [row] = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);
  if (!row) return;
  await purgeListingById(db, id);
  revalidateListing(row.slug);
}

export async function restoreListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const db = getDb();
  const [row] = await db
    .update(listings)
    .set({ moderationStatus: "active", updatedAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.moderationStatus, "hidden")))
    .returning({ slug: listings.slug });
  revalidateListing(row?.slug);
}

const listingEditSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().trim().min(1).max(80),
  description: z
    .string()
    .trim()
    .max(140)
    .transform((value) => (value ? value : null)),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .transform((value) => (value ? value : null)),
});

export async function updateListing(formData: FormData) {
  await requireAdmin();
  const parsed = listingEditSchema.safeParse({
    id: formData.get("id"),
    displayName: formData.get("displayName"),
    description: formData.get("description") || "",
    imageUrl: formData.get("imageUrl") || "",
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Revisa el título, la descripción y la imagen.",
    };
  }

  const imageUrl = parsed.data.imageUrl;
  if (imageUrl && !isSafeHttpUrl(imageUrl)) {
    return {
      ok: false as const,
      error: "La imagen tiene que ser un link http(s) válido.",
    };
  }

  const db = getDb();
  const [row] = await db
    .update(listings)
    .set({
      displayName: parsed.data.displayName,
      description: parsed.data.description,
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, parsed.data.id))
    .returning({ slug: listings.slug });

  if (!row) return { ok: false as const, error: "Ese listing no existe." };
  revalidateListing(row.slug);
  return { ok: true as const };
}

export async function refreshListingImage(listingId: string) {
  await requireAdmin();
  if (!listingId) return { ok: false as const, error: "Falta el listing." };

  const db = getDb();
  const [listing] = await db
    .select({
      slug: listings.slug,
      identifierType: listings.identifierType,
      destinationUrl: listings.destinationUrl,
    })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) return { ok: false as const, error: "Ese listing no existe." };
  if (listing.identifierType !== "website") {
    return {
      ok: false as const,
      error: "Solo se puede refrescar la imagen de un sitio web.",
    };
  }

  const meta = await fetchWebsiteMeta(listing.destinationUrl);
  if (!meta?.imageUrl) {
    return { ok: false as const, error: "Ese sitio no trajo imagen." };
  }

  await db
    .update(listings)
    .set({ imageUrl: meta.imageUrl, updatedAt: new Date() })
    .where(eq(listings.id, listingId));
  revalidateListing(listing.slug);
  return { ok: true as const, imageUrl: meta.imageUrl };
}
