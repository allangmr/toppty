import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ListingAvatar } from "@/experiments/leaderboard/components/avatar";
import { copy } from "@/experiments/leaderboard/copy";
import { leaderboardConfig } from "@/experiments/leaderboard/config";
import { getListingBySlug } from "@/experiments/leaderboard/queries/leaderboard";
import { listingUrl } from "@/core/social/share";
import { formatUsd } from "@/lib/utils";
import { BidCta } from "./bid-cta";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) {
    return { title: "TopPTY.lol" };
  }
  const title = `${listing.displayName} es #${listing.rank} en TopPTY`;
  const description = `${listing.displayName} está #${listing.rank} con ${formatUsd(listing.totalBidCents)}. ¿Lo tumbas?`;
  return {
    title,
    description,
    alternates: { canonical: `/p/${listing.slug}` },
    openGraph: {
      title,
      description,
      url: listingUrl(listing.slug),
      images: [{ url: `/p/${listing.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();
  const takeCents = listing.totalBidCents + leaderboardConfig.minIncrementCents;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        <p className="text-sm font-medium tracking-[-0.02em] text-muted-foreground">
          {copy.brand}
        </p>
        <p className="inline-flex w-fit rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
          #{listing.rank}
        </p>
        <div className="flex items-center gap-4">
          <ListingAvatar
            name={listing.displayName}
            imageUrl={listing.imageUrl}
            size="lg"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">
              {listing.displayName}
            </h1>
            <p className="text-muted-foreground">
              {listing.clickCount} clicks
            </p>
          </div>
        </div>
        <p className="text-5xl font-bold tracking-[-0.04em] text-primary">
          {formatUsd(listing.totalBidCents)}
        </p>
        {listing.description ? (
          <p className="max-w-2xl text-muted-foreground">{listing.description}</p>
        ) : null}
        <a
          href={`/go/${listing.slug}`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border px-4 text-center text-sm font-medium transition-colors hover:bg-muted"
        >
          Ir al perfil
        </a>
        <BidCta rank={listing.rank} amountCents={takeCents} />
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Ver el ranking completo
        </Link>
      </main>
      <Footer />
    </>
  );
}
