import { leaderboardConfig } from "./config";

const creatorAt = `@${leaderboardConfig.creator.xHandle}`;

export const copy = {
  brand: "toppty.lol",
  flag: "🇵🇦",
  title: "TopPTY.lol — ¿Quién ta arriba en Panamá?",
  description:
    "La tabla de PTY. Pagas, te subes y que te tumben si pueden. Sin estafas: el que pone más, manda.",
  hero: "Coge el #1 por",
  punch: [
    "Coge tu puesto.",
    "Súbete en la tabla.",
    "Que te tumben si pueden.",
  ],
  takeNumberOne: "Coge el #1 por",
  identifierLabel: "@X · #IG · $TikTok o tu link",
  identifierPrefixes: "@ X · # Instagram · $ TikTok",
  identifierHint:
    "¿Ya ta' en la lista? Mete el mismo @/#/$ o link y súbele al monto.",
  descriptionLabel: "Descripción (opcional)",
  descriptionPlaceholder: "Una línea pa' que sepan quién eres",
  descriptionHint: "Sale debajo de tu nombre en la tabla.",
  submit: "Súbete",
  submitHint:
    "Los puestos nuevos arrancan en $1. Si pones menos que el #1 igual caes donde te alcance la plata.",
  alreadyIn:
    "Ya ta' en la lista. Usa el mismo @/#/$ o link y súbele al monto.",
  trending: "Lo que ta pegao",
  activity: "Lo que se movió",
  ranking: "La tabla",
  how: "Cómo va la cosa",
  rules: "Las reglas",
  emptyTitle: "Nadie manda todavía en PTY.",
  emptyBody: "El #1 se coge por $1. De una.",
  emptyCta: "Yo quiero el #1",
  shareNumberOne: "Tíralo",
  share: "Tíralo",
  copied: "Link copiado",
  viewTable: "Ver la tabla",
  tryAgain: "Inténtalo de una",
  openingPay: "Abriendo el pago…",
  takePlace: (rank: number, amount: string) =>
    `coge este puesto por ${amount}`,
  takeThisPlace: (amount: string) => `coge este puesto por ${amount}`,
  newNumberOne: "Nuevo #1 en PTY",
  reported: "Listo. Lo vemos.",
  paymentsFinal:
    "El pago es de una y no se devuelve, salvo donde la ley lo pida. Estás comprando un puesto en la tabla, no una inversión ni un chance.",
  showMore: "Ver to'o",
  showLess: "Ver menos",
  pagePrev: "Pa' atrás",
  pageNext: "Sigue",
  pageLabel: (page: number, total: number) => `Página ${page} de ${total}`,
  onlineNow: (n: number) => `${n.toLocaleString("es-PA")} mirando ahora`,
  visitsSince: (n: number) =>
    `${n.toLocaleString("es-PA")} visitas desde que arrancamos`,
  madeFor: `hecho por ${creatorAt} pa' Panamá`,
  dmCreator: `Si hay un lío, chatéame a ${creatorAt}`,
  goingFirst: "Vas por el #1.",
  landingAt: (amount: string, rank: number) =>
    `Con ${amount} caes en el #${rank}.`,
  shortToFirst: (amount: string) => ` Te faltan ${amount} pa'l #1.`,
};