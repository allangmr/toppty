import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const identifierTypeEnum = pgEnum("identifier_type", [
  "website",
  "social",
]);

export const socialNetworkEnum = pgEnum("social_network", [
  "instagram",
  "tiktok",
  "x",
]);

export const bidStatusEnum = pgEnum("bid_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "active",
  "hidden",
  "removed",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "LISTING_CREATED",
  "BID_INCREASED",
  "RANK_CHANGED",
  "NEW_NUMBER_ONE",
]);

export const listings = pgTable(
  "listings",
  {
    id: text("id").primaryKey(),
    experimentId: text("experiment_id").notNull().default("ranking"),
    slug: text("slug").notNull(),
    identifierType: identifierTypeEnum("identifier_type").notNull(),
    identifier: text("identifier").notNull(),
    normalizedIdentifier: text("normalized_identifier").notNull(),
    socialNetwork: socialNetworkEnum("social_network"),
    displayName: text("display_name").notNull(),
    destinationUrl: text("destination_url").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    totalBidCents: integer("total_bid_cents").notNull().default(0),
    clickCount: integer("click_count").notNull().default(0),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("active"),
    firstPaidAt: timestamp("first_paid_at", { withTimezone: true }),
    lastPaidAt: timestamp("last_paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("listings_slug_idx").on(table.slug),
    uniqueIndex("listings_normalized_idx").on(
      table.experimentId,
      table.normalizedIdentifier,
    ),
    index("listings_rank_idx").on(
      table.experimentId,
      table.totalBidCents,
      table.lastPaidAt,
    ),
  ],
);

export const bids = pgTable(
  "bids",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    status: bidStatusEnum("status").notNull().default("pending"),
    fingerprintHash: text("fingerprint_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("bids_stripe_session_idx").on(table.stripeSessionId),
    index("bids_listing_idx").on(table.listingId),
    index("bids_status_idx").on(table.status),
  ],
);

export const clicks = pgTable(
  "clicks",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    fingerprintHash: text("fingerprint_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("clicks_listing_created_idx").on(table.listingId, table.createdAt),
    index("clicks_fingerprint_idx").on(
      table.listingId,
      table.fingerprintHash,
      table.createdAt,
    ),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: text("id").primaryKey(),
    experimentId: text("experiment_id").notNull().default("ranking"),
    type: activityTypeEnum("type").notNull(),
    listingId: text("listing_id").references(() => listings.id),
    previousRank: integer("previous_rank"),
    newRank: integer("new_rank"),
    amountCents: integer("amount_cents"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("activities_created_idx").on(table.experimentId, table.createdAt),
    index("activities_type_idx").on(table.type),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    reason: text("reason").notNull(),
    details: text("details"),
    fingerprintHash: text("fingerprint_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("reports_listing_idx").on(table.listingId)],
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    properties: jsonb("properties").$type<Record<string, unknown>>(),
    referral: text("referral"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    fingerprintHash: text("fingerprint_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_name_created_idx").on(table.name, table.createdAt),
  ],
);

export type ListingRow = typeof listings.$inferSelect;
export type BidRow = typeof bids.$inferSelect;
export type ActivityRow = typeof activities.$inferSelect;
