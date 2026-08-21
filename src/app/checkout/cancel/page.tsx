import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function CheckoutCancelPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-12">
        <p className="font-display text-5xl leading-none">No se cobró nada.</p>
        <p>El puesto sigue ahí. Si te alcanza, súbete.</p>
        <Link
          href="/#subir"
          className="border-2 border-ink bg-ink px-4 py-3 text-center font-display text-xl tracking-widest text-cream"
        >
          VOLVER AL RANKING
        </Link>
      </main>
      <Footer />
    </>
  );
}
