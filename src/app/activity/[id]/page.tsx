import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { activities, getDb, listings } from "@/core/db";
import { activityUrl } from "@/core/social/share";
import { formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getActivity(id: string) {
  try {
    const db = getDb();
    const [row] = await db
      .select({ activity: activities, listing: listings })
      .from(activities)
      .leftJoin(listings, eq(activities.listingId, listings.id))
      .where(eq(activities.id, id))
      .limit(1);
    return row ?? null;
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    const { mockSnapshot } = await import(
      "@/experiments/leaderboard/queries/mock-snapshot"
    );
    const item = mockSnapshot().activity.find((row) => row.id === id);
    if (!item) return null;
    return {
      activity: {
        id: item.id,
        type: item.type,
        listingId: item.listingSlug,
        previousRank: item.previousRank,
        newRank: item.newRank,
        amountCents: item.amountCents,
        metadata: item.metadata,
        createdAt: new Date(item.createdAt),
      },
      listing: item.listingDisplayName
        ? {
            displayName: item.listingDisplayName,
            slug: item.listingSlug,
          }
        : null,
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getActivity(id);
  if (!row) return { title: "TopPTY.lol" };
  const name = row.listing?.displayName ?? "Alguien";
  const title =
    row.activity.type === "NEW_NUMBER_ONE"
      ? `NUEVO #1 EN PANAMÁ — ${name}`
      : `${name} se movió en TopPTY`;
  return {
    title,
    description: copyFrom(row),
    alternates: { canonical: `/activity/${id}` },
    openGraph: {
      title,
      description: copyFrom(row),
      url: activityUrl(id),
    },
    twitter: { card: "summary_large_image", title },
  };
}

function copyFrom(row: NonNullable<Awaited<ReturnType<typeof getActivity>>>) {
  const name = row.listing?.displayName ?? "Alguien";
  const prev = row.activity.metadata?.previousNumberOneDisplayName as
    | string
    | undefined;
  if (row.activity.type === "NEW_NUMBER_ONE" && prev) {
    return `${name} acaba de tumbar a ${prev}.`;
  }
  if (row.activity.amountCents) {
    return `${name} está en el ranking con ${formatUsd(row.activity.amountCents)}.`;
  }
  return `${name} se movió en el ranking.`;
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getActivity(id);
  if (!row) notFound();
  const name = row.listing?.displayName ?? "Alguien";
  const prev = row.activity.metadata?.previousNumberOneDisplayName as
    | string
    | undefined;
  const prevAmount = row.activity.metadata?.previousAmountCents as
    | number
    | undefined;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-8">
        {row.activity.type === "NEW_NUMBER_ONE" ? (
          <p className="font-display text-2xl tracking-[0.14em] text-accent">
            NUEVO #1 EN PANAMÁ 👑
          </p>
        ) : (
          <p className="font-display text-2xl tracking-[0.14em]">MOVIMIENTO</p>
        )}
        <h1 className="font-display text-6xl leading-none">{name}</h1>
        {row.activity.amountCents ? (
          <p className="font-display text-6xl">
            {formatUsd(row.activity.amountCents)}
          </p>
        ) : null}
        {prev ? (
          <p className="text-lg">
            acaba de tumbar a {prev}
            {prevAmount ? ` · ${formatUsd(prevAmount)} → ${formatUsd(row.activity.amountCents ?? 0)}` : ""}
          </p>
        ) : (
          <p className="text-lg">{copyFrom(row)}</p>
        )}
        <Link
          href="/#ranking"
          className="mt-4 border-2 border-ink bg-ink px-4 py-3 text-center font-display text-xl tracking-widest text-cream"
        >
          VER EL RANKING
        </Link>
      </main>
      <Footer />
    </>
  );
}
