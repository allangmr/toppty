import { BrandMark } from "@/components/brand-mark";
import { copy } from "@/experiments/leaderboard/copy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <p className="inline-flex items-center gap-1.5 text-base font-medium tracking-[-0.03em] text-foreground">
          <BrandMark className="h-4" />
          toppty<span className="text-flag-red">.</span>lol
        </p>
        <p>Hecho en Panamá {copy.flag}. El ranking manda.</p>
        <p className="text-xs leading-relaxed">{copy.paymentsFinal}</p>
        <p>
          <a
            href="/admin"
            className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Admin
          </a>
        </p>
      </div>
    </footer>
  );
}
