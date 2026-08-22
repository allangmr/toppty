import { leaderboardConfig } from "./config";

const creatorAt = `@${leaderboardConfig.creator.xHandle}`;

export const copy = {
  brand: "toppty.lol",
  flag: "🇵🇦",
  title: "toppty.lol — ¿Quién ta arriba en Panamá?",
  description:
    "La tabla de PTY. Pagas, te subes y que te tumben si pueden. Sin estafas: el que pone más, manda.",
  hero: "Conquista el #1 por",
  punch: [
    "Coge tu puesto.",
    "Súbete en la tabla.",
    "Que te tumben si pueden.",
  ],
  takeNumberOne: "Conquista el #1 por",
  identifierLabel: "@X · #IG · $TikTok o tu link",
  identifierPrefixes: "@ X · # Instagram · $ TikTok",
  identifierHint:
    "¿Ya ta' en la lista? Mete el mismo @/#/$ o link y súbele al monto.",
  previewLabel: "Así va a lucir",
  previewHint: "Toca el lápiz pa' editar",
  previewTitlePlaceholder: "Tu título",
  previewDescPlaceholder: "Una línea pa' que sepan quién eres",
  previewEditTitle: "Editar título",
  previewEditDesc: "Editar descripción",
  previewEditLogo: "Editar logo",
  previewLogoUrl: "URL del logo",
  submit: "Súbete",
  submitHint:
    "Los puestos nuevos arrancan en $1. Si pones menos que el #1 igual caes donde te alcance la plata.",
  alreadyIn:
    "Ya ta' en la lista. Usa el mismo @/#/$ o link y súbele al monto.",
  trending: "Lo que ta pegao",
  trendingEmpty: "Nadie ta pegao todavía. Dale click a alguien en la tabla.",
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
    `Conquista este puesto por ${amount}`,
  takeThisPlace: (amount: string) => `Conquista este puesto por ${amount}`,
  newNumberOne: "Nuevo #1 en PTY",
  reported: "Listo. Lo vemos.",
  paymentsFinal:
    "El pago es de una y no se devuelve, salvo donde la ley lo pida. Al pagar compras un puesto digital en la tabla (se entrega al instante cuando PayPal confirma). Que te tumben, que no te guste el resultado, o que removamos el puesto por romper las reglas, no da derecho a devolución ni a reclamación en PayPal. Estás comprando un puesto en la tabla, no una inversión ni un chance.",
  disputePolicy:
    "Si abres un dispute, chargeback o reclamación en PayPal después de que el puesto ya quedó en la tabla, lo tratamos como abuso: podemos ocultar o remover el listing y bloquearte de futuros pagos. El servicio digital ya se entregó al capturar el pago. Si hay un lío real (doble cobro, fallo técnico), chatéanos primero — no abras reclamo a ciegas.",
  checkoutAck:
    "Al pagar aceptas: puesto digital, entrega inmediata, sin devolución. Reclamar en PayPal después de entregado = abuso.",
  listingAllowed:
    "@ pa' X, # pa' Instagram, $ pa' TikTok, o un link limpio. No se permite porno ni contenido adulto, estafas, phishing, malware, ni sitios marcados como no seguros. Eso se remueve de una y no hay devolución.",
  listingProhibited:
    "Nada de sitios pornográficos o NSFW, nada de estafas ni engaños, nada de phishing/malware, y nada de links que Chrome u otros marquen como no seguros. Si entra, lo sacamos. Plata pagada: no se devuelve.",
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