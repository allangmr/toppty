const BOT_HINTS = [
  "bot",
  "spider",
  "crawl",
  "slurp",
  "preview",
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "whatsapp",
  "telegrambot",
  "slackbot",
  "discordbot",
  "linkedinbot",
  "pinterest",
  "applebot",
  "googlebot",
  "bingbot",
  "yandex",
  "baiduspider",
  "embedly",
  "quora link preview",
  "vkshare",
  "w3c_validator",
  "redditbot",
  "ia_archiver",
  "skypeuripreview",
  "nuzzel",
  "qwantify",
  "bitrix",
];

export function isLikelyBot(userAgent: string) {
  const ua = userAgent.trim().toLowerCase();
  if (!ua || ua.length < 8) return true;
  return BOT_HINTS.some((hint) => ua.includes(hint));
}
