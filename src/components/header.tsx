import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { CreatorLink } from "@/components/creator-link";
import { PanamaFlag } from "@/components/panama-flag";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy } from "@/experiments/leaderboard/copy";

export function Header() {
  return (
    <header className="sticky top-3 z-40 w-full px-3">
      <div className="glass-card mx-auto flex w-full max-w-4xl items-center justify-between gap-2 rounded-full py-1.5 pr-2 pl-4 sm:gap-4 sm:pl-5">
        <div className="min-w-0">
          <Link
            href="/"
            className="font-display inline-flex items-center gap-2 text-[20px] font-bold tracking-[-0.04em] sm:text-[22px]"
          >
            <BrandMark className="h-9 sm:h-10" />
            <span className="sr-only">toppty.lol</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <PanamaFlag className="h-3 w-4" />
              <span className="hidden sm:inline">Panamá</span>
            </span>
          </Link>
          <p className="sr-only">
            <CreatorLink prefix="hecho por" />
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Principal">
            <ul className="flex items-center text-sm">
              <li>
                <Link
                  href="/#ranking"
                  className="rounded-full px-2.5 py-2 leading-none font-bold whitespace-nowrap text-foreground transition-colors hover:bg-muted/70 sm:px-3.5"
                >
                  {copy.ranking}
                </Link>
              </li>
              <li>
                <Link
                  href="/#como-funciona"
                  className="rounded-full px-2.5 py-2 leading-none font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground sm:px-3.5"
                >
                  {copy.how}
                </Link>
              </li>
              <li>
                <Link
                  href="/#reglas"
                  className="rounded-full px-2.5 py-2 leading-none font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground sm:px-3.5"
                >
                  {copy.rules}
                </Link>
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
