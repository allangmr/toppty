import { cn } from "@/lib/utils";

const LOGO_WIDTH = 1204;
const LOGO_HEIGHT = 495;

/** Horizontal TopPTY wordmark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset from /public
    <img
      src="/logo.webp"
      alt=""
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      decoding="async"
      className={cn("h-8 w-auto sm:h-9", className)}
      aria-hidden="true"
    />
  );
}
