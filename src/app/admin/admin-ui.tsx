import { cn } from "@/lib/utils";

export const REPORT_LABELS: Record<string, string> = {
  illegal: "Ilegal",
  scam: "Estafa",
  phishing: "Phishing",
  pornography: "Pornografía",
  hate: "Odio",
  malicious: "Malicioso",
  other: "Otro",
};

export const BID_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Falló",
  refunded: "Reembolsado",
};

export function StatusBadge({
  status,
}: {
  status: "active" | "hidden" | "removed";
}) {
  const label =
    status === "active" ? "Activo" : status === "hidden" ? "Oculto" : "Quitado";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "active" && "bg-live/12 text-live",
        status === "hidden" && "bg-muted text-muted-foreground",
        status === "removed" && "bg-destructive/10 text-destructive",
      )}
    >
      {label}
    </span>
  );
}

export function BidBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "paid" && "bg-live/12 text-live",
        status === "pending" && "bg-primary/10 text-primary",
        status === "failed" && "bg-destructive/10 text-destructive",
        status === "refunded" && "bg-muted text-muted-foreground",
      )}
    >
      {BID_LABELS[status] ?? status}
    </span>
  );
}

export const LOGIN_OUTCOME_LABELS: Record<string, string> = {
  success: "Entró",
  bad_password: "Clave mala",
  captcha_fail: "Captcha",
  locked: "Bloqueado",
};

export function LoginOutcomeBadge({ outcome }: { outcome: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        outcome === "success" && "bg-live/12 text-live",
        outcome === "bad_password" && "bg-destructive/10 text-destructive",
        outcome === "captcha_fail" && "bg-primary/10 text-primary",
        outcome === "locked" && "bg-flag-red/10 text-destructive",
      )}
    >
      {LOGIN_OUTCOME_LABELS[outcome] ?? outcome}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
