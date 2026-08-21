import "dotenv/config";
import { eq } from "drizzle-orm";
import { createId } from "../../lib/utils";
import { activities, bids, clicks, getDb, listings } from "./index";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed production.");
  process.exit(1);
}

const db = getDb();

const now = Date.now();
const minutesAgo = (n: number) => new Date(now - n * 60_000);

const seedListings = [
  {
    slug: "cafecito",
    displayName: "@cafecito",
    identifier: "@cafecito",
    normalizedIdentifier: "instagram:cafecito",
    identifierType: "social" as const,
    socialNetwork: "instagram" as const,
    destinationUrl: "https://www.instagram.com/cafecito/",
    description: "Café en Casco. El primero en llegar.",
    totalBidCents: 4800,
    clickCount: 128,
    minutes: 17,
  },
  {
    slug: "ptyfoodie",
    displayName: "@ptyfoodie",
    identifier: "@ptyfoodie",
    normalizedIdentifier: "instagram:ptyfoodie",
    identifierType: "social" as const,
    socialNetwork: "instagram" as const,
    destinationUrl: "https://www.instagram.com/ptyfoodie/",
    description: "Come rico en la ciudad.",
    totalBidCents: 3700,
    clickCount: 96,
    minutes: 42,
  },
  {
    slug: "sushipty",
    displayName: "@sushipty",
    identifier: "@sushipty",
    normalizedIdentifier: "tiktok:sushipty",
    identifierType: "social" as const,
    socialNetwork: "tiktok" as const,
    destinationUrl: "https://www.tiktok.com/@sushipty",
    description: "Rolls y drama.",
    totalBidCents: 2500,
    clickCount: 210,
    minutes: 8,
  },
  {
    slug: "panamastartup-com",
    displayName: "panamastartup.com",
    identifier: "https://panamastartup.com/",
    normalizedIdentifier: "website:panamastartup.com",
    identifierType: "website" as const,
    socialNetwork: null,
    destinationUrl: "https://panamastartup.com/",
    description: "Startups en PTY.",
    totalBidCents: 1800,
    clickCount: 54,
    minutes: 90,
  },
  {
    slug: "juancito",
    displayName: "@juancito",
    identifier: "@juancito",
    normalizedIdentifier: "instagram:juancito",
    identifierType: "social" as const,
    socialNetwork: "instagram" as const,
    destinationUrl: "https://www.instagram.com/juancito/",
    description: null,
    totalBidCents: 1200,
    clickCount: 33,
    minutes: 12,
  },
  {
    slug: "techpty",
    displayName: "@techpty",
    identifier: "@techpty",
    normalizedIdentifier: "x:techpty",
    identifierType: "social" as const,
    socialNetwork: "x" as const,
    destinationUrl: "https://x.com/techpty",
    description: "Tech en el istmo.",
    totalBidCents: 800,
    clickCount: 41,
    minutes: 200,
  },
  {
    slug: "maria",
    displayName: "@maria",
    identifier: "@maria",
    normalizedIdentifier: "instagram:maria",
    identifierType: "social" as const,
    socialNetwork: "instagram" as const,
    destinationUrl: "https://www.instagram.com/maria/",
    description: null,
    totalBidCents: 500,
    clickCount: 19,
    minutes: 300,
  },
  ...Array.from({ length: 38 }, (_, index) => {
    const rank = index + 8;
    return {
      slug: `spot-${rank}`,
      displayName: `spot${rank}.pa`,
      identifier: `https://spot${rank}.pa/`,
      normalizedIdentifier: `website:spot${rank}.pa`,
      identifierType: "website" as const,
      socialNetwork: null,
      destinationUrl: `https://spot${rank}.pa/`,
      description: rank <= 20 ? `Puesto #${rank} en el ranking de PTY.` : null,
      totalBidCents: Math.max(100, 450 - index * 8),
      clickCount: Math.max(1, 40 - index),
      minutes: 20 + index * 7,
    };
  }),
];

async function seed() {
  console.log("Seeding development leaderboard…");

  for (const item of seedListings) {
    const existing = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.normalizedIdentifier, item.normalizedIdentifier))
      .limit(1);
    if (existing[0]) continue;

    const listingId = createId("lst");
    const paidAt = minutesAgo(item.minutes);
    await db.insert(listings).values({
      id: listingId,
      experimentId: "ranking",
      slug: item.slug,
      identifierType: item.identifierType,
      identifier: item.identifier,
      normalizedIdentifier: item.normalizedIdentifier,
      socialNetwork: item.socialNetwork,
      displayName: item.displayName,
      destinationUrl: item.destinationUrl,
      description: item.description,
      totalBidCents: item.totalBidCents,
      clickCount: item.clickCount,
      firstPaidAt: paidAt,
      lastPaidAt: paidAt,
    });

    await db.insert(bids).values({
      id: createId("bid"),
      listingId,
      amountCents: item.totalBidCents,
      currency: "usd",
      status: "paid",
      paidAt,
      createdAt: paidAt,
    });

    for (let i = 0; i < Math.min(12, Math.ceil(item.clickCount / 20)); i += 1) {
      await db.insert(clicks).values({
        id: createId("clk"),
        listingId,
        fingerprintHash: `seed-${item.slug}-${i}`,
        createdAt: minutesAgo(Math.max(1, i * 7)),
      });
    }

    await db.insert(activities).values({
      id: createId("act"),
      experimentId: "ranking",
      type: "LISTING_CREATED",
      listingId,
      previousRank: null,
      newRank: seedListings.findIndex((row) => row.slug === item.slug) + 1,
      amountCents: item.totalBidCents,
      metadata: { displayName: item.displayName, slug: item.slug },
      createdAt: paidAt,
    });
  }

  const numberOne = seedListings[0];
  const previous = seedListings[1];
  if (numberOne && previous) {
    const [row] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.slug, numberOne.slug))
      .limit(1);
    if (row) {
      await db.insert(activities).values({
        id: createId("act"),
        experimentId: "ranking",
        type: "NEW_NUMBER_ONE",
        listingId: row.id,
        previousRank: 2,
        newRank: 1,
        amountCents: numberOne.totalBidCents,
        metadata: {
          displayName: numberOne.displayName,
          slug: numberOne.slug,
          previousNumberOneDisplayName: previous.displayName,
          previousNumberOneSlug: previous.slug,
          previousAmountCents: previous.totalBidCents,
        },
        createdAt: minutesAgo(numberOne.minutes),
      });
    }
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
