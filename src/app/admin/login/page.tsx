import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminConfigured,
  passwordsMatch,
  signAdminCookie,
} from "@/core/admin/auth";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  if (!passwordsMatch(password)) {
    redirect("/admin/login?error=1");
  }
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
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-5xl">Admin</h1>
      {!adminConfigured() ? (
        <p className="mt-4">ADMIN_PASSWORD no está configurado.</p>
      ) : (
        <form action={login} className="mt-6 space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Clave"
            className="h-12 w-full border-2 border-ink bg-cream px-3"
          />
          {error ? <p className="text-sm text-accent">Clave incorrecta.</p> : null}
          <button
            type="submit"
            className="h-12 w-full border-2 border-ink bg-ink font-display tracking-widest text-cream"
          >
            Entrar
          </button>
        </form>
      )}
    </main>
  );
}
