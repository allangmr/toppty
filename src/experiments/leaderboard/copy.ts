export const copy = {
  brand: "toppty.lol",
  flag: "🇵🇦",
  title: "TopPTY.lol — ¿Quién está arriba en Panamá?",
  description:
    "El ranking público de Panamá. Paga, sube y que te tumben si pueden.",
  hero: "Reclama el #1 por",
  punch: [
    "Compra tu puesto.",
    "Sube en el ranking.",
    "Que te tumben si pueden.",
  ],
  takeNumberOne: "Reclama el #1 por",
  identifierLabel: "Tu URL o @usuario",
  identifierHint:
    "¿Ya estás en la lista? Usa el mismo link o @usuario y sube tu apuesta.",
  submit: "Súbete",
  submitHint:
    "Los puestos nuevos empiezan en $1. Pagar menos que el #1 igual te pone en el ranking en el puesto que alcance tu monto.",
  alreadyIn:
    "Ya estás en el ranking. Usa el mismo link o @usuario para subir tu apuesta.",
  trending: "Lo que pega ahora",
  activity: "Última actividad",
  ranking: "Ranking",
  how: "Cómo funciona",
  rules: "Reglas",
  emptyTitle: "Nadie manda todavía en PTY.",
  emptyBody: "El #1 puede ser tuyo por $1.",
  emptyCta: "Quiero el #1",
  shareNumberOne: "Compartir",
  takePlace: (rank: number, amount: string) =>
    `reclama este puesto por ${amount}`,
  takeThisPlace: (amount: string) => `reclama este puesto por ${amount}`,
  newNumberOne: "Nuevo #1 en PTY",
  reported: "Gracias. Lo revisamos.",
  paymentsFinal:
    "Los pagos son finales una vez procesados, salvo donde la ley exija lo contrario. Estás comprando un puesto en el ranking, no una inversión ni un juego de azar.",
  showMore: "Ver más",
  showLess: "Ver menos",
  pagePrev: "Anterior",
  pageNext: "Siguiente",
  pageLabel: (page: number, total: number) => `Página ${page} de ${total}`,
};
