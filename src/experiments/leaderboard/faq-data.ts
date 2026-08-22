import { copy } from "./copy";

export const FAQ_ITEMS = [
  {
    q: "¿Qué es TopPTY?",
    a: "La tabla pública de Panamá. Pagas, te subes, y el que pone más se queda más arriba. Así de directo, sin estafas.",
  },
  {
    q: "¿Cómo va la cosa?",
    a: "La plata manda. Más monto, más alto. Si dos ponen lo mismo, se queda arriba el que pagó primero.",
  },
  {
    q: "¿Tengo que pagar por el #1?",
    a: "No. Desde $1 caes en el puesto que te alcance. El #1 es pa' el que ponga más.",
  },
  {
    q: "¿Qué pasa si alguien me tumba?",
    a: "Te tumbaron. Sigues en la tabla, más abajo. Puedes volver a pagar y subir de una.",
  },
  {
    q: "¿Puedo subirle al monto?",
    a: "Sí. Cada pago nuevo se suma a tu puesto. Usa el mismo link o @usuario.",
  },
  {
    q: "¿Me devuelven la plata?",
    a: copy.paymentsFinal,
  },
  {
    q: "¿Qué puedo poner en la tabla?",
    a: "Un @ de Instagram, TikTok o X, una web, un negocio, un proyecto, un perfil. Nada ilegal, nada de estafas, nada de porno, nada de odio.",
  },
] as const;
