import { Suspense } from "react";
import { CheckoutSuccessClient } from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
          <p className="font-display text-5xl">Confirmando tu pago…</p>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
