import { formatUsd, getAppUrl } from "@/lib/utils";
import { copy } from "./copy";
import { FAQ_ITEMS } from "./faq-data";
import type { HomeSnapshot, RankedListing } from "./types";

export function homeJsonLd(snapshot: HomeSnapshot) {
  const base = getAppUrl();
  const top = snapshot.listings.slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: "TopPTY.lol",
        alternateName: ["TopPTY", "toppty.lol"],
        description: copy.description,
        inLanguage: "es-PA",
        isAccessibleForFree: true,
      },
      {
        "@type": "WebPage",
        "@id": `${base}/#webpage`,
        url: `${base}/`,
        name: copy.title,
        description: copy.description,
        isPartOf: { "@id": `${base}/#website` },
        inLanguage: "es-PA",
        about: {
          "@type": "Thing",
          name: "La tabla pública de Panamá",
        },
      },
      {
        "@type": "ItemList",
        "@id": `${base}/#ranking`,
        name: "La tabla TopPTY",
        numberOfItems: snapshot.listings.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: top.map((listing) => ({
          "@type": "ListItem",
          position: listing.rank,
          name: listing.displayName,
          url: `${base}/p/${listing.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${base}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };
}

export function listingJsonLd(listing: RankedListing) {
  const base = getAppUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${base}/p/${listing.slug}#profile`,
    url: `${base}/p/${listing.slug}`,
    name: `${listing.displayName} es #${listing.rank} en TopPTY`,
    description: `${listing.displayName} ta #${listing.rank} con ${formatUsd(listing.totalBidCents)}.`,
    inLanguage: "es-PA",
    isPartOf: { "@id": `${base}/#website` },
    mainEntity: {
      "@type": "Thing",
      name: listing.displayName,
      url: listing.destinationUrl,
    },
  };
}

export function activityJsonLd(input: {
  id: string;
  name: string;
  description: string;
}) {
  const base = getAppUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    url: `${base}/activity/${input.id}`,
    headline: input.name,
    articleBody: input.description,
    inLanguage: "es-PA",
    isPartOf: { "@id": `${base}/#website` },
  };
}
