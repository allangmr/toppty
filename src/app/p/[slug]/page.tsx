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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <p className="font-display text-xl tracking-[0.16em] text-muted">
          {copy.brand}
        </p>
        <p className="font-display text-7xl leading-none">#{listing.rank}</p>
        <div className="flex items-center gap-4">
          <ListingAvatar
            name={listing.displayName}
            imageUrl={listing.imageUrl}
            size="lg"
          />
          <div>
            <h1 className="font-display text-4xl">{listing.displayName}</h1>
            <p className="text-muted">{listing.clickCount} clicks</p>
          </div>
        </div>
        <p className="font-display text-7xl leading-none">
          {formatUsd(listing.totalBidCents)}
        </p>
        <a
          href={`/go/${listing.slug}`}
          className="border-2 border-ink px-4 py-3 text-center font-medium"
        >
          Ir al perfil
        </a>
        <BidCta rank={listing.rank} amountCents={takeCents} />
        <Link href="/" className="text-sm underline-offset-2 hover:underline">
          Ver el ranking completo
        </Link>
      </main>
      <Footer />
    </>
  );
}
