# TopPTY.lol

Public Panama leaderboard. People pay to rank higher. The amount paid is the rank.

```text
¿Quién está arriba en Panamá?

Compra tu puesto.
Sube en el ranking.
Que te tumben si pueden.
```

This repo is the ranking experiment inside TopPTY. Later experiments (`/ta-caro`, `/conquista`, `/ofertas`) can sit next to it without rewriting the app.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS
- PostgreSQL + Drizzle ORM
- PayPal Checkout
- Vercel-compatible

## Commands

```bash
npm run dev          # local app → http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint

npm run db:push      # push Drizzle schema to Postgres
npm run db:generate  # generate SQL migrations
npm run db:migrate   # apply migrations
npm run db:seed      # fake Panama listings (development only)
npm run db:studio    # Drizzle Studio
```

Docker:

```bash
docker compose up -d      # local Postgres on :5432
docker compose down       # stop Postgres
```

## Local setup

```bash
cp .env.example .env.local
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If checkout keys are empty, local bids skip the provider and mark as paid. That path is blocked in production.

## Payments

Checkout uses **PayPal**. Stripe is not used (it is not available for Panama).

Create a REST app in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/). Set:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV=sandbox` or `live`
- `PAYPAL_WEBHOOK_ID`

Webhook URL:

```text
https://your-domain/api/paypal/webhook
```

Subscribe at least to:

- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `CHECKOUT.ORDER.VOIDED`

The ranking only updates after PayPal confirms a **completed capture**. The return URL asks the server to capture the approved order, then polls bid status. A webhook is still required in production.

## Admin

Visit `/admin` and sign in with `ADMIN_PASSWORD`. Hide or remove listings, inspect payments and reports.

## Env

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL |
| `PAYPAL_CLIENT_ID` | PayPal REST client id |
| `PAYPAL_CLIENT_SECRET` | PayPal REST secret |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook id for signature verification |
| `PAYPAL_ENV` | `sandbox` or `live` |
| `ADMIN_PASSWORD` | Admin gate |
| `IP_HASH_SALT` | Hash clicks without storing raw IPs |

## Production notes

- Do not run `db:seed` in production.
- Empty leaderboard is intentional at launch: the #1 is $1 until someone takes it.
- Payments are final except where the law requires otherwise. This is placement in a ranking, not an investment and not gambling.
