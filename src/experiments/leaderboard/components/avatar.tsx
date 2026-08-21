import { avatarHue, initialsFromName } from "../identity";

export function ListingAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-10 w-10 text-sm" : "h-12 w-12 text-base";
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
        className={`${dim} shrink-0 border-2 border-ink bg-cream object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center border-2 border-ink font-display text-cream`}
      style={{ background: `hsl(${hue} 45% 28%)` }}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
