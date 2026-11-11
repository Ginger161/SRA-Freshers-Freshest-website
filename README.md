# Freshest Fresher 2026/27 — Veritas University SRA

Paid voting site. ₦100 per vote through Paystack. Counts stay hidden until an admin reveals the results.

- `/` — home, prize, contestants
- `/c/<contestant>` — contestant page + vote (the link contestants share)
- `/results` — public only after **Reveal winners** in admin
- `/admin` — totals, transactions, CSV export, payment re-check, reveal toggle

## How a vote is counted

1. `/api/vote/init` records a **pending** vote and opens a Paystack transaction for `votes × ₦100`.
2. After payment, the browser asks `/api/vote/verify`, and Paystack also calls `/api/paystack/webhook`.
3. Both paths ask Paystack directly whether the payment succeeded and whether the amount matches before marking the row **paid**. Either path can run first, and running both never double-counts.
4. The live feed only shows paid votes, as `userXXXX just voted`. It reveals no contestant and no amount.

## Setup (one time)

### 1. Supabase
1. Create a project at supabase.com.
2. Open **SQL Editor → New query**, paste `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings → API** and copy the **Project URL** and the **service_role** key.

### 2. Paystack (SRA account, live mode)
1. Go to **Settings → API Keys & Webhooks** and copy the **Live Public Key** and **Live Secret Key**.
2. Set the **Live Webhook URL** to `https://<your-site>/api/paystack/webhook`.

### 3. Vercel
Import the GitHub repo (Next.js is detected automatically). Under **Environment Variables** add:

| Key | Value |
| --- | --- |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_…` |
| `PAYSTACK_SECRET_KEY` | `sk_live_…` |
| `ADMIN_PASSWORD` | a long password |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-site>.vercel.app` |
| `NEXT_PUBLIC_VOTING_OPENS_AT` | `2026-11-11T18:00:00+01:00` |
| `NEXT_PUBLIC_VOTING_CLOSES_AT` | `2026-11-12T15:00:00+01:00` |

`NEXT_PUBLIC_*` values are baked in at build time, so **redeploy after changing them**. Never set `FEED_MOCK` in production. It turns on a demo feed for local previews only.

### 4. Test before announcing
Make one real ₦100 vote. It should show as **paid** in `/admin` within a few seconds.

## Local

```bash
cp .env.example .env.local   # fill in
npm install
npm run dev
```

## Contestants

Contestants are listed in `lib/contestants.ts`. Photos live in `public/contestants/<id>.jpg`, plus an `<id>-sm.webp` thumbnail for the grid.
