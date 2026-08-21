import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function CheckoutCancelPage() {
  return (
    <>
      <Header />
      <main
        id="contenido"
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-4 px-4 py-12"
      >
        <p className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
          No se cobró nada.
        </p>
        <p className="text-muted-foreground">
          El puesto sigue ahí. Si te alcanza, súbete.
        </p>
        <Link
          href="/#subir"
          className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Volver pa&apos; la tabla
        </Link>
      </main>
      <Footer />
    </>
  );
}
