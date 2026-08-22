type PaypalLink = {
  href: string;
  rel: string;
  method?: string;
};

export type PaypalOrder = {
  id: string;
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    reference_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id: string;
        status?: string;
        custom_id?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
  links?: PaypalLink[];
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function paypalEnabled() {
  return Boolean(env("PAYPAL_CLIENT_ID") && env("PAYPAL_CLIENT_SECRET"));
}

export function canSkipPaypal() {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.DEV_SKIP_PAYPAL === "true" || !paypalEnabled())
  );
}

export function paypalApiBase() {
  return env("PAYPAL_ENV") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function centsToPaypalValue(cents: number) {
  return (cents / 100).toFixed(2);
}

export function paypalValueToCents(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

export function extractOrderPayment(order: PaypalOrder) {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return {
    orderId: order.id,
    status: capture?.status ?? order.status ?? "",
    customId: capture?.custom_id ?? unit?.custom_id ?? unit?.reference_id ?? null,
    amountCents:
      paypalValueToCents(capture?.amount?.value) ??
      paypalValueToCents(unit?.amount?.value),
    captureId: capture?.id ?? null,
    captureStatus: capture?.status ?? null,
  };
}

export function paypalApproveUrl(order: PaypalOrder) {
  return (
    order.links?.find((link) => link.rel === "payer-action")?.href ??
    order.links?.find((link) => link.rel === "approve")?.href ??
    null
  );
}

async function paypalAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken;
  }

  const clientId = env("PAYPAL_CLIENT_ID");
  const secret = env("PAYPAL_CLIENT_SECRET");
  if (!clientId || !secret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required");
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `PayPal auth failed (${response.status})${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  const json = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

/** Lightweight credential check for /api/health (does not expose secrets). */
export async function probePaypalAuth() {
  if (!paypalEnabled()) {
    return { ok: false as const, reason: "missing_credentials" };
  }
  try {
    await paypalAccessToken();
    return {
      ok: true as const,
      env: env("PAYPAL_ENV") === "live" ? "live" : "sandbox",
      api: paypalApiBase(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return {
      ok: false as const,
      reason: "auth_failed",
      detail: message.slice(0, 180),
      env: env("PAYPAL_ENV") === "live" ? "live" : "sandbox",
      api: paypalApiBase(),
    };
  }
}

async function paypalRequest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  const token = await paypalAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  if (init.prefer) headers.set("Prefer", init.prefer);

  const response = await fetch(`${paypalApiBase()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as T & { message?: string }) : ({} as T);

  if (!response.ok) {
    const message =
      (json as { message?: string }).message ||
      `PayPal request failed (${response.status})`;
    const error = new Error(message) as Error & { status: number; body: unknown };
    error.status = response.status;
    error.body = json;
    throw error;
  }

  return json;
}

export async function createPaypalCheckout(input: {
  bidId: string;
  amountCents: number;
  currency: string;
  displayName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const currency = input.currency.toUpperCase();
  const value = centsToPaypalValue(input.amountCents);
  const itemName =
    `TopPTY.lol puesto digital (sin reembolso) · ${input.displayName}`.slice(
      0,
      127,
    );

  // application_context is the widely supported Orders shape for merchant apps.
  const order = await paypalRequest<PaypalOrder>("/v2/checkout/orders", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.bidId,
          custom_id: input.bidId,
          description: itemName,
          amount: {
            currency_code: currency,
            value,
            breakdown: {
              item_total: {
                currency_code: currency,
                value,
              },
            },
          },
          items: [
            {
              name: itemName.slice(0, 127),
              description:
                "Ranking spot on TopPTY.lol. Digital good delivered on payment capture. Non-refundable except where required by law.",
              quantity: "1",
              category: "DIGITAL_GOODS",
              unit_amount: {
                currency_code: currency,
                value,
              },
            },
          ],
        },
      ],
      application_context: {
        brand_name: "TopPTY.lol",
        locale: "es-XC",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: input.successUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  const url = paypalApproveUrl(order);
  if (!url) {
    throw new Error("PayPal did not return an approve URL");
  }

  return { orderId: order.id, url };
}

export async function getPaypalOrder(orderId: string) {
  return paypalRequest<PaypalOrder>(`/v2/checkout/orders/${orderId}`, {
    method: "GET",
  });
}

export async function capturePaypalOrder(orderId: string) {
  try {
    return await paypalRequest<PaypalOrder>(
      `/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        prefer: "return=representation",
        body: "{}",
      },
    );
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 422) {
      return getPaypalOrder(orderId);
    }
    throw error;
  }
}

function paypalCertUrlIsSafe(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "paypal.com" ||
        parsed.hostname.endsWith(".paypal.com"))
    );
  } catch {
    return false;
  }
}

export async function verifyPaypalWebhook(request: Request, rawBody: string) {
  const webhookId = env("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID is not set");
  }

  const authAlgo = request.headers.get("paypal-auth-algo");
  const certUrl = request.headers.get("paypal-cert-url");
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  const transmissionTime = request.headers.get("paypal-transmission-time");

  if (
    !authAlgo ||
    !certUrl ||
    !transmissionId ||
    !transmissionSig ||
    !transmissionTime
  ) {
    return false;
  }
  if (!paypalCertUrlIsSafe(certUrl)) {
    return false;
  }

  const result = await paypalRequest<{ verification_status?: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );

  return result.verification_status === "SUCCESS";
}
