import { BrandMark } from "@/components/brand-mark";
import { CreatorLink } from "@/components/creator-link";
import { PanamaFlag } from "@/components/panama-flag";
import { copy } from "@/experiments/leaderboard/copy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <p className="inline-flex items-center gap-1.5 text-base font-medium tracking-[-0.03em] text-foreground">
          <BrandMark className="h-7 sm:h-8" />
          <span className="sr-only">toppty.lol</span>
        </p>
        <p className="inline-flex flex-wrap items-center gap-x-1 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            Hecho en PTY <PanamaFlag className="h-3 w-4" /> por
          </span>
          <CreatorLink />. Aquí manda el que ponga más. Si hay un lío, chatéame.
        </p>
        <p className="text-xs leading-relaxed">{copy.paymentsFinal}</p>
      </div>
    </footer>
  );
}
