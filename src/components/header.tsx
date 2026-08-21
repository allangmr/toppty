import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { CreatorLink } from "@/components/creator-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy } from "@/experiments/leaderboard/copy";

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 pt-5 pb-4">
        <div className="min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[22px] font-medium tracking-[-0.04em]"
          >
            <BrandMark />
            <span>
              toppty
              <span className="text-flag-red">.</span>
              lol
            </span>
          </Link>
          <p className="mt-0.5 hidden pl-[1.85rem] text-[11px] font-medium text-muted-foreground sm:block">
            <CreatorLink prefix="hecho por" /> pa&apos; Panamá {copy.flag}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav aria-label="Principal">
            <ul className="flex items-center gap-4 text-sm sm:gap-5">
              <li>
                <Link
                  href="/#ranking"
                  className="font-medium text-foreground transition-colors hover:text-foreground"
                >
                  {copy.ranking}
                </Link>
              </li>
              <li>
                <Link
                  href="/#como-funciona"
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copy.how}
                </Link>
              </li>
              <li>
                <Link
                  href="/#reglas"
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
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
