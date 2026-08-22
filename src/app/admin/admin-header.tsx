import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "./actions";

export function AdminHeader() {
  return (
    <header className="border-b border-border/80 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[18px] font-medium tracking-[-0.04em]"
          >
            <span>
              toppty
              <span className="text-flag-red">.</span>
              lol
            </span>
          </Link>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Ver sitio
          </Link>
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
