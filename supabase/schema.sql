-- Run once in Supabase → SQL Editor → New query → Run
create table if not exists public.votes (
  reference     text primary key,
  contestant_id text not null,
  votes         integer not null check (votes > 0),
  amount_kobo   integer not null check (amount_kobo > 0),
  email         text not null,
  status        text not null default 'pending' check (status in ('pending','paid','failed','flagged')),
  created_at    timestamptz not null default now(),
  paid_at       timestamptz,
  paystack_id   bigint,
  channel       text
);
create index if not exists votes_paid_idx on public.votes (status, paid_at desc);

create table if not exists public.settings (key text primary key, value jsonb not null);
insert into public.settings (key, value) values ('revealed', 'false') on conflict do nothing;

create or replace view public.tally with (security_invoker = true) as
  select contestant_id, sum(votes) as votes, count(*) as txns, sum(amount_kobo) as amount_kobo
  from public.votes where status = 'paid' group by contestant_id;

-- Only the server (service role key) can touch anything. The public anon key reads nothing.
alter table public.votes enable row level security;
alter table public.settings enable row level security;
revoke all on public.votes, public.settings, public.tally from anon, authenticated;
