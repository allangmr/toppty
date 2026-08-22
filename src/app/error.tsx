"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="contenido"
      className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-4"
    >
      <p className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
        Se cayó la tabla
      </p>
      <p className="mt-3 text-muted-foreground">
        Inténtalo de una. Si sigue así, el #1 ta riéndose.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        Inténtalo de una
      </button>
    </main>
  );
}
