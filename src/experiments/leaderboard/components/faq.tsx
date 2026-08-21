import { copy } from "../copy";
import { FAQ_ITEMS } from "../faq-data";

export function Faq() {
  return (
    <section id="como-funciona" className="mt-10 scroll-mt-6 space-y-4">
      <h2 className="text-center text-2xl font-bold tracking-[-0.03em]">
        {copy.how}
      </h2>
      <div id="reglas" className="scroll-mt-6 space-y-2">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-soft)] open:bg-muted/40"
          >
            <summary className="cursor-pointer font-medium tracking-[-0.01em]">
              {item.q}
            </summary>
            <p className="mt-2 pb-1 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
