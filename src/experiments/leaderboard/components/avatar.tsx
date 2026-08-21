import { avatarHue, initialsFromName } from "../identity";
import { cn } from "@/lib/utils";

export function ListingAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "size-14 text-base md:size-14"
      : size === "sm"
        ? "size-8 text-xs"
        : size === "xs"
          ? "size-5 text-[10px]"
          : "size-10 text-sm md:size-14 md:text-base";
  const hue = avatarHue(name);
  const rounded = size === "xs" || size === "sm" ? "rounded-md" : "rounded-md";

  if (imageUrl) {
    return (
      // External favicons vary in format and host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        width={64}
        height={64}
        className={cn(dim, rounded, "shrink-0 bg-muted object-cover")}
      />
    );
  }

  return (
    <div
      className={cn(
        dim,
        rounded,
        "flex shrink-0 items-center justify-center font-semibold text-primary-foreground",
      )}
      style={{ background: `hsl(${hue} 42% 42%)` }}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
