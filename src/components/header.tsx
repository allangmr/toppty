import Link from "next/link";
import { copy } from "@/experiments/leaderboard/copy";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="font-display text-2xl tracking-[0.08em]">
          {copy.brand} {copy.flag}
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
          <a href="#ranking">{copy.ranking}</a>
          <a href="#como-funciona">{copy.how}</a>
          <a href="#reglas">{copy.rules}</a>
        </nav>
      </div>
    </header>
  );
}
