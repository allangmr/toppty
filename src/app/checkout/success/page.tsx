import { Suspense } from "react";
import { CheckoutSuccessClient } from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          id="contenido"
          className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-4"
        >
          <p className="text-4xl font-bold tracking-[-0.04em]">
            Confirmando tu pago…
          </p>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
