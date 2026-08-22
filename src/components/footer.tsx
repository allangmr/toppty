import { BrandMark } from "@/components/brand-mark";
import { CreatorLink } from "@/components/creator-link";
import { copy } from "@/experiments/leaderboard/copy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <p className="inline-flex items-center gap-1.5 text-base font-medium tracking-[-0.03em] text-foreground">
          <BrandMark className="h-4" />
          toppty<span className="text-flag-red">.</span>lol
        </p>
        <p>
          Hecho en PTY {copy.flag} por <CreatorLink />. Aquí manda el que ponga
          más. Si hay un lío, chatéame.
        </p>
        <p className="text-xs leading-relaxed">{copy.paymentsFinal}</p>
      </div>
    </footer>
  );
}
