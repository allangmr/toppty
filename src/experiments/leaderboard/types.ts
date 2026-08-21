export type IdentifierType = "website" | "social";
export type SocialNetwork = "instagram" | "tiktok" | "x";
export type BidStatus = "pending" | "paid" | "failed" | "refunded";
export type ModerationStatus = "active" | "hidden" | "removed";
export type ActivityType =
  | "LISTING_CREATED"
  | "BID_INCREASED"
  | "RANK_CHANGED"
  | "NEW_NUMBER_ONE";

export type ParsedIdentity = {
  identifierType: IdentifierType;
  identifier: string;
  normalizedIdentifier: string;
  socialNetwork: SocialNetwork | null;
  displayName: string;
  destinationUrl: string;
  slugBase: string;
};

export type RankedListing = {
  id: string;
  slug: string;
  identifierType: IdentifierType;
  identifier: string;
  normalizedIdentifier: string;
  socialNetwork: SocialNetwork | null;
  displayName: string;
  destinationUrl: string;
  description: string | null;
  imageUrl: string | null;
  totalBidCents: number;
  clickCount: number;
  lastPaidAt: string | null;
  createdAt: string;
  rank: number;
};

export type TrendingListing = {
  slug: string;
  displayName: string;
  clicksPerHour: number;
  rank: number;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  listingSlug: string | null;
  listingDisplayName: string | null;
  previousRank: number | null;
  newRank: number | null;
  amountCents: number | null;
  message: string;
  highlight: boolean;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

export type HomeSnapshot = {
  listings: RankedListing[];
  trending: TrendingListing[];
  activity: ActivityItem[];
  onlineCount: number | null;
  visitCount: number | null;
  takeFirstCents: number;
  numberOne: RankedListing | null;
};

export type ActivityOgPayload = {
  type: ActivityType;
  winnerName: string;
  winnerAmountCents: number;
  previousName: string | null;
  previousAmountCents: number | null;
};
