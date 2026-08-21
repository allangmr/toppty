"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
      <p className="font-display text-5xl">Se cayó el ranking</p>
      <p className="mt-3">Inténtalo otra vez. Si sigue así, el #1 se está riendo.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 border-2 border-ink bg-ink px-4 py-3 font-display tracking-widest text-cream"
      >
        Reintentar
      </button>
    </main>
  );
}
