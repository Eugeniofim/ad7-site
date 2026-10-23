-- SALA 'ad7' no projeto da Ti Artes - gerado por gera-sala.py
create schema if not exists ad7;
grant usage on schema ad7 to anon, authenticated, service_role;

create table if not exists ad7.app_config (id int primary key default 1 check (id = 1), owner_uid uuid);
insert into ad7.app_config (id) values (1) on conflict (id) do nothing;
alter table ad7.app_config enable row level security;
drop policy if exists cfg_read on ad7.app_config;
create policy cfg_read on ad7.app_config for select using (true);

create or replace function ad7.is_owner() returns boolean
language sql stable security definer set search_path = ad7, public as $$
  select exists (select 1 from ad7.app_config where id = 1 and owner_uid = auth.uid());
$$;

create table if not exists ad7.appstate (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into ad7.appstate (id) values (1) on conflict (id) do nothing;
alter table ad7.appstate enable row level security;
drop policy if exists state_read on ad7.appstate;
drop policy if exists state_write on ad7.appstate;
create policy state_read  on ad7.appstate for select using (true);
create policy state_write on ad7.appstate for update to authenticated using (ad7.is_owner()) with check (id = 1);

create table if not exists ad7.bookings (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table ad7.bookings enable row level security;
drop policy if exists bk_insert_public on ad7.bookings;
drop policy if exists bk_read_owner on ad7.bookings;
drop policy if exists bk_write_owner on ad7.bookings;
drop policy if exists bk_delete_owner on ad7.bookings;
create policy bk_insert_public on ad7.bookings for insert to anon, authenticated with check (true);
create policy bk_read_owner    on ad7.bookings for select to authenticated using (ad7.is_owner());
create policy bk_write_owner   on ad7.bookings for update to authenticated using (ad7.is_owner());
create policy bk_delete_owner  on ad7.bookings for delete to authenticated using (ad7.is_owner());

create or replace view ad7.seat_counts as
  select data->>'tourId' as tour_id, data->>'date' as date, data->>'time' as time,
         sum((data->>'pax')::int) as pax
  from ad7.bookings
  where coalesce(data->>'status','confirmed') <> 'cancelled'
  group by 1,2,3;
alter view ad7.seat_counts set (security_invoker = off);

grant select on ad7.app_config, ad7.appstate, ad7.seat_counts to anon, authenticated;
grant update on ad7.appstate to authenticated;
grant insert on ad7.bookings to anon, authenticated;
grant select, update, delete on ad7.bookings to authenticated;

create table if not exists ad7.pedidos (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table ad7.pedidos enable row level security;
drop policy if exists pd_insert_public on ad7.pedidos;
drop policy if exists pd_read_owner on ad7.pedidos;
drop policy if exists pd_write_owner on ad7.pedidos;
create policy pd_insert_public on ad7.pedidos for insert to anon, authenticated with check (true);
create policy pd_read_owner    on ad7.pedidos for select to authenticated using (ad7.is_owner());
create policy pd_write_owner   on ad7.pedidos for update to authenticated using (ad7.is_owner());
grant insert on ad7.pedidos to anon, authenticated;
grant select, update on ad7.pedidos to authenticated;

create table if not exists ad7.itens (
  colecao text not null,
  id text not null,
  dados jsonb not null,
  atualizado_em timestamptz not null default now(),
  apagado boolean not null default false,
  primary key (colecao, id)
);
create index if not exists itens_atualizado on ad7.itens (atualizado_em);
alter table ad7.itens enable row level security;
create or replace function ad7.itens_carimba() returns trigger language plpgsql as $$
begin new.atualizado_em := now(); return new; end $$;
drop trigger if exists itens_carimba on ad7.itens;
create trigger itens_carimba before insert or update on ad7.itens for each row execute function ad7.itens_carimba();
drop policy if exists itens_dona on ad7.itens;
drop policy if exists itens_pedido_publico on ad7.itens;
create policy itens_dona on ad7.itens for all to authenticated using (ad7.is_owner()) with check (ad7.is_owner());
create policy itens_pedido_publico on ad7.itens for insert to anon, authenticated with check (colecao = 'pedidos' and apagado = false);
-- avaliação do QR do fim do passeio: o visitante só CRIA, e nunca já publicada (nuvem-itens.js)
drop policy if exists itens_avaliacao_publica on ad7.itens;
create policy itens_avaliacao_publica on ad7.itens for insert to anon, authenticated
  with check (colecao = 'avaliacoes' and apagado = false and coalesce((dados->>'publicar')::boolean, false) = false);
grant insert on ad7.itens to anon;
grant select, insert, update, delete on ad7.itens to authenticated;

grant all on all tables in schema ad7 to service_role;
grant execute on function ad7.is_owner() to anon, authenticated, service_role;
select 'sala ad7 pronta' as status;
-- depois, com o login criado:  update ad7.app_config set owner_uid = '<uid>' where id = 1;

