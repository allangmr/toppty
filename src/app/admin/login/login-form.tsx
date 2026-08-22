"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onTopptyHcaptchaLoad?: () => void;
  }
}

export function AdminLoginForm({
  action,
  siteKey,
  requireCaptcha,
  error,
  locked,
  lockedUntilLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  siteKey: string | null;
  requireCaptcha: boolean;
  error?: string;
  locked: boolean;
  lockedUntilLabel?: string | null;
}) {
  const [token, setToken] = useState("");
  const mountRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!requireCaptcha || !siteKey || locked) return;

    function renderWidget() {
      if (!mountRef.current || !window.hcaptcha || widgetIdRef.current) return;
      widgetIdRef.current = window.hcaptcha.render(mountRef.current, {
        sitekey: siteKey!,
        callback: (value) => setToken(value),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    }

    if (window.hcaptcha) {
      renderWidget();
      return;
    }

    window.onTopptyHcaptchaLoad = () => {
      renderWidget();
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-toppty-hcaptcha="1"]',
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src =
      "https://js.hcaptcha.com/1/api.js?render=explicit&onload=onTopptyHcaptchaLoad";
    script.async = true;
    script.defer = true;
    script.dataset.topptyHcaptcha = "1";
    document.head.appendChild(script);
  }, [locked, requireCaptcha, siteKey]);

  if (locked) {
    return (
      <p className="mt-6 text-sm text-destructive">
        Demasiados intentos. Acceso bloqueado
        {lockedUntilLabel ? ` hasta ${lockedUntilLabel}` : ""}.
      </p>
    );
  }

  const captchaMissing = requireCaptcha && !siteKey;

  return (
    <form action={action} className="mt-6 space-y-3">
      <input
        type="password"
        name="password"
        placeholder="Clave"
        autoComplete="current-password"
        required
        className="h-11 w-full rounded-xl border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {requireCaptcha && siteKey ? (
        <div className="min-h-[78px]">
          <div ref={mountRef} />
          <input type="hidden" name="h-captcha-response" value={token} />
        </div>
      ) : null}
      {captchaMissing ? (
        <p className="text-sm text-destructive">
          Falta configurar hCaptcha en el servidor.
        </p>
      ) : null}
      {error === "captcha" ? (
        <p className="text-sm text-destructive">Completa el captcha.</p>
      ) : null}
      {error === "1" ? (
        <p className="text-sm text-destructive">Clave incorrecta.</p>
      ) : null}
      <button
        type="submit"
        disabled={captchaMissing || (requireCaptcha && !token)}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Entrar
      </button>
    </form>
  );
}
