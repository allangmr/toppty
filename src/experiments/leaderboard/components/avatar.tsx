import { avatarHue, initialsFromName } from "../identity";
import { cn } from "@/lib/utils";

export function ListingAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
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
  const hue = avatarHue(name);

  if (imageUrl) {
    return (
      // External favicons vary in format and host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        width={64}
        height={64}
        className={cn(dim, "shrink-0 rounded-md bg-muted object-cover")}
      />
    );
  }

  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-md font-semibold text-primary-foreground",
      )}
      style={{ background: `hsl(${hue} 42% 42%)` }}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
