-- FROMAGO Planificador · almacenamiento compartido
-- Configuración equivalente a la instalada en el proyecto Supabase.

create table if not exists public.fromago_plans (
  id uuid primary key default gen_random_uuid(),
  secret text not null,
  data jsonb not null default '{"visitors":[],"selections":{},"buffer":45}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fromago_plans enable row level security;
revoke all on table public.fromago_plans from anon, authenticated;

drop policy if exists "deny direct access" on public.fromago_plans;
create policy "deny direct access"
on public.fromago_plans
for all
to anon, authenticated
using (false)
with check (false);

create or replace function public.create_fromago_plan(p_secret text, p_data jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if p_secret is null or length(p_secret) < 32 or length(p_secret) > 128 then
    raise exception 'invalid secret';
  end if;
  if p_data is null or octet_length(p_data::text) > 200000 then
    raise exception 'invalid plan data';
  end if;
  insert into public.fromago_plans(secret,data)
  values (p_secret,p_data)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.get_fromago_plan(p_id uuid, p_secret text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select data
  from public.fromago_plans
  where id=p_id and secret=p_secret
  limit 1;
$$;

create or replace function public.save_fromago_plan(p_id uuid, p_secret text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_data is null or octet_length(p_data::text) > 200000 then
    raise exception 'invalid plan data';
  end if;
  update public.fromago_plans
  set data=p_data, updated_at=now()
  where id=p_id and secret=p_secret;
  return found;
end;
$$;

revoke all on function public.create_fromago_plan(text,jsonb) from public, authenticated;
revoke all on function public.get_fromago_plan(uuid,text) from public, authenticated;
revoke all on function public.save_fromago_plan(uuid,text,jsonb) from public, authenticated;
grant execute on function public.create_fromago_plan(text,jsonb) to anon;
grant execute on function public.get_fromago_plan(uuid,text) to anon;
grant execute on function public.save_fromago_plan(uuid,text,jsonb) to anon;
