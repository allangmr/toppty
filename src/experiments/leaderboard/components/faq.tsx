import { copy } from "../copy";

const QUESTIONS = [
  {
    q: "¿Qué es TopPTY?",
    a: "Un ranking público de Panamá. Pagas, subes, y el que pone más se queda más arriba. Así de directo.",
  },
  {
    q: "¿Cómo funciona el ranking?",
    a: "El monto pagado manda. Más plata, más alto. Si dos personas ponen lo mismo, se queda arriba quien pagó primero.",
  },
  {
    q: "¿Tengo que pagar por el #1?",
    a: "No. Pon el monto que quieras desde $1 y caes en el puesto que ese monto alcance.",
  },
  {
    q: "¿Qué pasa si alguien me supera?",
    a: "Te tumbaron. Sigues en el ranking, más abajo. Puedes volver a pagar para subir.",
  },
  {
    q: "¿Puedo subir mi apuesta?",
    a: "Puedes subir tu monto. Cada pago nuevo se suma al total de tu puesto. Usa el mismo link o @usuario.",
  },
  {
    q: "¿Me devuelven el dinero?",
    a: copy.paymentsFinal,
  },
  {
    q: "¿Qué puedo poner en el ranking?",
    a: "Un @ de Instagram, TikTok o X, una web, un negocio, un proyecto, un perfil. Nada ilegal, nada de estafas, nada de porno, nada de odio.",
  },
];

export function Faq() {
  return (
    <section id="como-funciona" className="scroll-mt-24 space-y-4">
      <h2 className="font-display text-3xl tracking-[0.12em]">
        {copy.how}
      </h2>
      <div id="reglas" className="scroll-mt-24 space-y-2">
        {QUESTIONS.map((item) => (
          <details
            key={item.q}
            className="border-2 border-ink bg-bg-card px-3 py-2"
          >
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-2 pb-2 text-sm leading-relaxed text-muted">
              {item.a}
            </p>
          </details>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted">{copy.paymentsFinal}</p>
    </section>
  );
}
