import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-4">
        <p className="font-display text-6xl">404</p>
        <p className="mt-2">Ese puesto no existe. El ranking sí.</p>
        <Link href="/" className="mt-6 underline">
          Volver
        </Link>
      </main>
      <Footer />
    </>
  );
}
