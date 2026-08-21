import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-4xl flex-col justify-center px-4">
        <p className="text-6xl font-bold tracking-[-0.04em]">404</p>
        <p className="mt-2 text-muted-foreground">
          Ese puesto no existe. El ranking sí.
        </p>
        <Link
          href="/"
          className="mt-6 text-primary underline-offset-2 hover:underline"
        >
          Volver
        </Link>
      </main>
      <Footer />
    </>
  );
}
