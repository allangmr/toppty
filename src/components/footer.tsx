import { copy } from "@/experiments/leaderboard/copy";

export function Footer() {
  return (
    <footer className="border-t-2 border-ink px-4 py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-xl flex-col gap-2">
        <p className="font-display text-lg tracking-widest text-ink">
          {copy.brand}
        </p>
        <p>Hecho en Panamá. El ranking manda.</p>
        <p>
          <a href="/admin" className="underline-offset-2 hover:underline">
            Admin
          </a>
        </p>
      </div>
    </footer>
  );
}
