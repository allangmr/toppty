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
- Stripe Checkout (temporary)
- Vercel-compatible

**Note:** Payments will migrate from Stripe to PayPal Checkout. Stripe is only the first checkout path. Design new payment work so swapping the provider later is straightforward.

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

Checkout currently uses Stripe. **We will migrate to PayPal Checkout.**

Until that swap, set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Webhook:

```text
https://your-domain/api/stripe/webhook
```

Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `charge.refunded`.

Bids only change the ranking after a verified webhook. The success URL is not treated as payment confirmation.

## Admin

Visit `/admin` and sign in with `ADMIN_PASSWORD`. Hide or remove listings, inspect payments and reports.

## Env

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL |
| `STRIPE_SECRET_KEY` | Stripe secret (temporary; PayPal next) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature (temporary) |
| `ADMIN_PASSWORD` | Admin gate |
| `IP_HASH_SALT` | Hash clicks without storing raw IPs |

## Production notes

- Do not run `db:seed` in production.
- Empty leaderboard is intentional at launch: the #1 is $1 until someone takes it.
- Payments are final except where the law requires otherwise. This is placement in a ranking, not an investment and not gambling.
