create table if not exists public.wealth_app_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.wealth_app_state enable row level security;

drop policy if exists "wealth_app_state_select" on public.wealth_app_state;
drop policy if exists "wealth_app_state_insert" on public.wealth_app_state;
drop policy if exists "wealth_app_state_update" on public.wealth_app_state;
drop policy if exists "wealth_app_state_delete" on public.wealth_app_state;

create policy "wealth_app_state_select"
on public.wealth_app_state
for select
to anon
using (true);

create policy "wealth_app_state_insert"
on public.wealth_app_state
for insert
to anon
with check (true);

create policy "wealth_app_state_update"
on public.wealth_app_state
for update
to anon
using (true)
with check (true);

create policy "wealth_app_state_delete"
on public.wealth_app_state
for delete
to anon
using (true);
