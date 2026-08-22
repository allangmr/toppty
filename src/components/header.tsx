import Link from "next/link";
import { CreatorLink } from "@/components/creator-link";
import { PanamaFlag } from "@/components/panama-flag";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy } from "@/experiments/leaderboard/copy";

export function Header() {
  return (
    <header className="sticky top-3 z-40 w-full px-3">
      <div className="glass-card mx-auto flex w-full max-w-4xl items-center justify-center rounded-full py-1.5 pr-4 pl-4 md:justify-between md:gap-4 md:pr-2 md:pl-5">
        <div className="flex min-w-0 items-center">
          <Link
            href="/"
            className="font-display flex items-center gap-2 leading-none"
          >
            <span className="font-display text-[20px] font-bold tracking-[-0.04em] sm:text-[22px]">
              toppty
              <span className="text-flag-red">.</span>
              lol
            </span>
            <span className="hidden items-center gap-1.5 text-xs font-medium leading-none text-muted-foreground md:flex">
              <PanamaFlag className="h-3 w-4 leading-none" />
              <span>Panamá</span>
            </span>
          </Link>
          <p className="sr-only">
            <CreatorLink prefix="hecho por" />
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
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
