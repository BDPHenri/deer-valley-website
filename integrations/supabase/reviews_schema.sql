-- Run this in Supabase SQL editor

create table if not exists public.public_reviews (
  id bigint generated always as identity primary key,
  listing_slug text not null default 'deer-valley-basecamp',
  external_id text not null,
  platform text not null check (platform in ('airbnb', 'vrbo', 'booking')),
  guest_name text not null,
  review_text text not null,
  rating numeric(3, 2) not null default 5,
  review_date timestamptz,
  date_text text,
  published boolean not null default true,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_id)
);

create index if not exists idx_public_reviews_listing_date
  on public.public_reviews (listing_slug, review_date desc nulls last, created_at desc);

create or replace function public.set_updated_at_reviews()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_public_reviews_updated_at on public.public_reviews;
create trigger trg_public_reviews_updated_at
before update on public.public_reviews
for each row execute function public.set_updated_at_reviews();

alter table public.public_reviews enable row level security;

drop policy if exists "Public can read published reviews" on public.public_reviews;
create policy "Public can read published reviews"
on public.public_reviews
for select
using (published = true);
