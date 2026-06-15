create table if not exists public.wealth_app_state (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  state_key text not null default 'main',
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.wealth_app_state
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.wealth_app_state
add column if not exists state_key text not null default 'main';

create unique index if not exists wealth_app_state_user_state_key_idx
on public.wealth_app_state (user_id, state_key);

alter table public.wealth_app_state enable row level security;

drop policy if exists "wealth_app_state_select" on public.wealth_app_state;
drop policy if exists "wealth_app_state_insert" on public.wealth_app_state;
drop policy if exists "wealth_app_state_update" on public.wealth_app_state;
drop policy if exists "wealth_app_state_delete" on public.wealth_app_state;

create policy "wealth_app_state_select"
on public.wealth_app_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "wealth_app_state_insert"
on public.wealth_app_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "wealth_app_state_update"
on public.wealth_app_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "wealth_app_state_delete"
on public.wealth_app_state
for delete
to authenticated
using (auth.uid() = user_id);
