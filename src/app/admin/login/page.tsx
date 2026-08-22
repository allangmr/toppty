import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminConfigured,
  passwordsMatch,
  signAdminCookie,
} from "@/core/admin/auth";
import { hcaptchaRequired, verifyHCaptchaToken } from "@/core/admin/hcaptcha";
import {
  clearAdminLoginFailures,
  getAdminLockStatus,
  registerAdminLoginFailure,
} from "@/core/admin/lockout";
import { fingerprintFromHeaders } from "@/core/security/fingerprint";
import { AdminLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";

  const headerList = await headers();
  const fingerprint = fingerprintFromHeaders(headerList);
  const lock = await getAdminLockStatus(fingerprint);
  if (lock.locked) {
    redirect("/admin/login?error=locked");
  }

  const captchaToken = String(
    formData.get("h-captcha-response") ||
      formData.get("g-recaptcha-response") ||
      "",
  );
  const captchaOk = await verifyHCaptchaToken(captchaToken || null);
  if (!captchaOk) {
    const result = await registerAdminLoginFailure(fingerprint);
    redirect(
      result.locked ? "/admin/login?error=locked" : "/admin/login?error=captcha",
    );
  }

  const password = String(formData.get("password") || "");
  if (!passwordsMatch(password)) {
    const result = await registerAdminLoginFailure(fingerprint);
    redirect(
      result.locked ? "/admin/login?error=locked" : "/admin/login?error=1",
    );
  }

  await clearAdminLoginFailures(fingerprint);

  const store = await cookies();
  store.set(ADMIN_COOKIE, await signAdminCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const headerList = await headers();
  const fingerprint = fingerprintFromHeaders(headerList);
  const lock = await getAdminLockStatus(fingerprint);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || null;
  const requireCaptcha = hcaptchaRequired();
  const lockedUntilLabel =
    lock.locked && lock.lockedUntil
      ? lock.lockedUntil.toLocaleString("es-PA", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <main
      id="contenido"
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4"
    >
      <h1 className="text-4xl font-bold tracking-[-0.04em]">Admin</h1>
      {!adminConfigured() ? (
        <p className="mt-4 text-muted-foreground">
          ADMIN_PASSWORD no ta configurado.
        </p>
      ) : (
        <AdminLoginForm
          action={login}
          siteKey={siteKey}
          requireCaptcha={requireCaptcha}
          error={error}
          locked={lock.locked || error === "locked"}
          lockedUntilLabel={lockedUntilLabel}
        />
      )}
    </main>
  );
}
