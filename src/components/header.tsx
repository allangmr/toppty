import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy } from "@/experiments/leaderboard/copy";

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 pt-5 pb-4">
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
          <span className="ml-1.5 hidden text-xs font-medium text-muted-foreground sm:inline">
            Panamá {copy.flag}
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav aria-label="Principal">
            <ul className="flex items-center gap-4 text-sm sm:gap-5">
              <li>
                <a
                  href="#ranking"
                  className="font-medium text-foreground transition-colors hover:text-foreground"
                >
                  {copy.ranking}
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copy.how}
                </a>
              </li>
              <li>
                <a
                  href="#reglas"
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copy.rules}
                </a>
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
