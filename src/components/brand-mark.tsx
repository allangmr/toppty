import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-5 w-auto", className)}
    >
      <rect x="22" y="0" width="14" height="6" rx="3" className="fill-primary" />
      <rect
        x="12"
        y="11"
        width="24"
        height="6"
        rx="3"
        className="fill-foreground"
      />
      <rect
        x="0"
        y="22"
        width="36"
        height="6"
        rx="3"
        className="fill-foreground"
      />
    </svg>
  );
}
