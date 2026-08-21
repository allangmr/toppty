"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidAdminCookie, ADMIN_COOKIE } from "@/core/admin/auth";
import { getDb, listings } from "@/core/db";

async function requireAdmin() {
  const store = await cookies();
  if (!(await isValidAdminCookie(store.get(ADMIN_COOKIE)?.value))) {
    throw new Error("Unauthorized");
  }
}

export async function hideListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const db = getDb();
  await db
    .update(listings)
    .set({ moderationStatus: "hidden", updatedAt: new Date() })
    .where(eq(listings.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function removeListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const db = getDb();
  await db
    .update(listings)
    .set({ moderationStatus: "removed", updatedAt: new Date() })
    .where(eq(listings.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function restoreListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const db = getDb();
  await db
    .update(listings)
    .set({ moderationStatus: "active", updatedAt: new Date() })
    .where(eq(listings.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}
