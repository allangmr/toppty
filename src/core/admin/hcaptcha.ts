export function hcaptchaConfigured() {
  return Boolean(
    process.env.HCAPTCHA_SECRET && process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY,
  );
}

export function hcaptchaRequired() {
  return process.env.NODE_ENV === "production" || hcaptchaConfigured();
}

export async function verifyHCaptchaToken(token: string | null | undefined) {
  if (!hcaptchaRequired()) return true;
  if (!hcaptchaConfigured()) return false;
  if (!token) return false;

  const body = new URLSearchParams({
    secret: process.env.HCAPTCHA_SECRET!,
    response: token,
  });

  try {
    const response = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const json = (await response.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}
