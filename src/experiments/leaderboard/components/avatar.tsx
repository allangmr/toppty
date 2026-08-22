import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
} from "@/components/icons";
import { avatarHue, initialsFromName } from "../identity";
import type { SocialNetwork } from "../types";
import { cn } from "@/lib/utils";

function SocialGlyph({
  network,
  className,
}: {
  network: SocialNetwork;
  className?: string;
}) {
  if (network === "instagram") return <InstagramIcon className={className} />;
  if (network === "tiktok") return <TikTokIcon className={className} />;
  return <XIcon className={className} />;
}

export function ListingAvatar({
  name,
  imageUrl,
  socialNetwork,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  socialNetwork?: SocialNetwork | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const dim =
    size === "xl"
      ? "size-14 text-base md:size-16 md:text-lg"
      : size === "lg"
        ? "size-12 text-sm md:size-14 md:text-base"
        : size === "sm"
          ? "size-8 text-xs"
          : size === "xs"
            ? "size-5 text-[10px]"
            : "size-10 text-sm md:size-12 md:text-base";
  const icon =
    size === "xl"
      ? "size-7"
      : size === "lg"
        ? "size-6"
        : size === "sm"
          ? "size-3.5"
          : size === "xs"
            ? "size-2.5"
            : "size-5";
  const hue = avatarHue(name);

  if (imageUrl) {
    return (
      // External favicons / profile images vary in format and host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className={cn(dim, "shrink-0 rounded-md bg-muted object-cover")}
      />
    );
  }

  if (socialNetwork) {
    return (
      <div
        className={cn(
          dim,
          "flex shrink-0 items-center justify-center rounded-md bg-foreground text-background",
        )}
        aria-hidden
      >
        <SocialGlyph network={socialNetwork} className={icon} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-md font-semibold text-primary-foreground",
      )}
      style={{ background: `hsl(${hue} 48% 28%)` }}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
