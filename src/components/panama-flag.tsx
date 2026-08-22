import { cn } from "@/lib/utils";

/** Panama flag via [`flag-icons`](https://github.com/lipis/flag-icons) (`fi fi-pa`). */
export function PanamaFlag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "fi fi-pa shrink-0 overflow-hidden rounded-[1px] align-[-0.12em] ring-1 ring-black/10 dark:ring-white/15",
        className,
      )}
      role="img"
      aria-label="Bandera de Panamá"
      title="Panamá"
    />
  );
}
