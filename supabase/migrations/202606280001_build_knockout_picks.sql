create table if not exists public.knockout_matches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  fifa_match_number int unique,
  round text not null check (round in ('ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL')),
  bracket_side text not null check (bracket_side in ('LEFT', 'RIGHT', 'CENTER')),
  display_order int not null unique,
  home_team_id uuid references public.teams(id) on delete restrict,
  away_team_id uuid references public.teams(id) on delete restrict,
  home_source_match_code text,
  away_source_match_code text,
  next_match_code text,
  next_slot text check (next_slot in ('home', 'away')),
  points int not null check (
    (round = 'ROUND_OF_32' and points = 1) or
    (round = 'ROUND_OF_16' and points = 2) or
    (round = 'QUARTERFINAL' and points = 4) or
    (round = 'SEMIFINAL' and points = 8) or
    (round = 'FINAL' and points = 16)
  ),
  starts_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knockout_matches_home_slot_check check (home_team_id is not null or home_source_match_code is not null),
  constraint knockout_matches_away_slot_check check (away_team_id is not null or away_source_match_code is not null),
  constraint knockout_matches_next_check check (
    (round = 'FINAL' and next_match_code is null and next_slot is null) or
    (round <> 'FINAL' and next_match_code is not null and next_slot is not null)
  )
);

create table if not exists public.knockout_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.knockout_picks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.knockout_submissions(id) on delete cascade,
  match_id uuid not null references public.knockout_matches(id) on delete cascade,
  picked_team_id uuid not null references public.teams(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(submission_id, match_id)
);

create table if not exists public.knockout_match_results (
  match_id uuid primary key references public.knockout_matches(id) on delete cascade,
  winner_team_id uuid references public.teams(id) on delete restrict,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.knockout_pick_scores (
  pick_id uuid primary key references public.knockout_picks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_correct boolean not null default false,
  points int not null default 0 check (points >= 0),
  calculated_at timestamptz not null default now()
);

create index if not exists knockout_matches_round_display_idx on public.knockout_matches (round, display_order);
create index if not exists knockout_matches_next_match_code_idx on public.knockout_matches (next_match_code);
create index if not exists knockout_submissions_user_id_idx on public.knockout_submissions (user_id);
create index if not exists knockout_picks_submission_id_idx on public.knockout_picks (submission_id);
create index if not exists knockout_picks_match_id_idx on public.knockout_picks (match_id);
create index if not exists knockout_picks_picked_team_id_idx on public.knockout_picks (picked_team_id);
create index if not exists knockout_pick_scores_user_id_idx on public.knockout_pick_scores (user_id);

alter table public.knockout_matches enable row level security;
alter table public.knockout_submissions enable row level security;
alter table public.knockout_picks enable row level security;
alter table public.knockout_match_results enable row level security;
alter table public.knockout_pick_scores enable row level security;

drop policy if exists "knockout_matches_select_public" on public.knockout_matches;
create policy "knockout_matches_select_public" on public.knockout_matches
  for select to anon, authenticated
  using (true);

drop policy if exists "knockout_matches_service_role_all" on public.knockout_matches;
create policy "knockout_matches_service_role_all" on public.knockout_matches
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "knockout_submissions_service_role_all" on public.knockout_submissions;
create policy "knockout_submissions_service_role_all" on public.knockout_submissions
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "knockout_picks_service_role_all" on public.knockout_picks;
create policy "knockout_picks_service_role_all" on public.knockout_picks
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "knockout_match_results_service_role_all" on public.knockout_match_results;
create policy "knockout_match_results_service_role_all" on public.knockout_match_results
  for all to service_role
  using (true)
  with check (true);

drop policy if exists "knockout_pick_scores_service_role_all" on public.knockout_pick_scores;
create policy "knockout_pick_scores_service_role_all" on public.knockout_pick_scores
  for all to service_role
  using (true)
  with check (true);

with match_seed (
  code, fifa_match_number, round, bracket_side, display_order, home_team_code, away_team_code,
  home_source_match_code, away_source_match_code, next_match_code, next_slot, points, starts_at
) as (
  values
    ('R32-74', 74, 'ROUND_OF_32', 'LEFT', 1, 'GER', 'PAR', null, null, 'R16-90', 'home', 1, null::timestamptz),
    ('R32-77', 77, 'ROUND_OF_32', 'LEFT', 2, 'FRA', 'SWE', null, null, 'R16-90', 'away', 1, null::timestamptz),
    ('R32-73', 73, 'ROUND_OF_32', 'LEFT', 3, 'RSA', 'CAN', null, null, 'R16-89', 'home', 1, '2026-06-28T19:00:00.000Z'::timestamptz),
    ('R32-75', 75, 'ROUND_OF_32', 'LEFT', 4, 'NED', 'MAR', null, null, 'R16-89', 'away', 1, null::timestamptz),
    ('R32-83', 83, 'ROUND_OF_32', 'LEFT', 5, 'POR', 'CRO', null, null, 'R16-93', 'home', 1, null::timestamptz),
    ('R32-84', 84, 'ROUND_OF_32', 'LEFT', 6, 'ESP', 'AUT', null, null, 'R16-93', 'away', 1, null::timestamptz),
    ('R32-81', 81, 'ROUND_OF_32', 'LEFT', 7, 'USA', 'BIH', null, null, 'R16-94', 'home', 1, null::timestamptz),
    ('R32-82', 82, 'ROUND_OF_32', 'LEFT', 8, 'BEL', 'SEN', null, null, 'R16-94', 'away', 1, null::timestamptz),
    ('R32-76', 76, 'ROUND_OF_32', 'RIGHT', 9, 'BRA', 'JPN', null, null, 'R16-91', 'home', 1, null::timestamptz),
    ('R32-78', 78, 'ROUND_OF_32', 'RIGHT', 10, 'CIV', 'NOR', null, null, 'R16-91', 'away', 1, null::timestamptz),
    ('R32-79', 79, 'ROUND_OF_32', 'RIGHT', 11, 'MEX', 'ECU', null, null, 'R16-92', 'home', 1, null::timestamptz),
    ('R32-80', 80, 'ROUND_OF_32', 'RIGHT', 12, 'ENG', 'COD', null, null, 'R16-92', 'away', 1, null::timestamptz),
    ('R32-86', 86, 'ROUND_OF_32', 'RIGHT', 13, 'ARG', 'CPV', null, null, 'R16-95', 'home', 1, null::timestamptz),
    ('R32-88', 88, 'ROUND_OF_32', 'RIGHT', 14, 'AUS', 'EGY', null, null, 'R16-95', 'away', 1, null::timestamptz),
    ('R32-85', 85, 'ROUND_OF_32', 'RIGHT', 15, 'SUI', 'ALG', null, null, 'R16-96', 'home', 1, null::timestamptz),
    ('R32-87', 87, 'ROUND_OF_32', 'RIGHT', 16, 'COL', 'GHA', null, null, 'R16-96', 'away', 1, null::timestamptz),
    ('R16-90', 90, 'ROUND_OF_16', 'LEFT', 17, null, null, 'R32-74', 'R32-77', 'QF-97', 'home', 2, null::timestamptz),
    ('R16-89', 89, 'ROUND_OF_16', 'LEFT', 18, null, null, 'R32-73', 'R32-75', 'QF-97', 'away', 2, null::timestamptz),
    ('R16-93', 93, 'ROUND_OF_16', 'LEFT', 19, null, null, 'R32-83', 'R32-84', 'QF-98', 'home', 2, null::timestamptz),
    ('R16-94', 94, 'ROUND_OF_16', 'LEFT', 20, null, null, 'R32-81', 'R32-82', 'QF-98', 'away', 2, null::timestamptz),
    ('R16-91', 91, 'ROUND_OF_16', 'RIGHT', 21, null, null, 'R32-76', 'R32-78', 'QF-99', 'home', 2, null::timestamptz),
    ('R16-92', 92, 'ROUND_OF_16', 'RIGHT', 22, null, null, 'R32-79', 'R32-80', 'QF-99', 'away', 2, null::timestamptz),
    ('R16-95', 95, 'ROUND_OF_16', 'RIGHT', 23, null, null, 'R32-86', 'R32-88', 'QF-100', 'home', 2, null::timestamptz),
    ('R16-96', 96, 'ROUND_OF_16', 'RIGHT', 24, null, null, 'R32-85', 'R32-87', 'QF-100', 'away', 2, null::timestamptz),
    ('QF-97', 97, 'QUARTERFINAL', 'LEFT', 25, null, null, 'R16-90', 'R16-89', 'SF-101', 'home', 4, null::timestamptz),
    ('QF-98', 98, 'QUARTERFINAL', 'LEFT', 26, null, null, 'R16-93', 'R16-94', 'SF-101', 'away', 4, null::timestamptz),
    ('QF-99', 99, 'QUARTERFINAL', 'RIGHT', 27, null, null, 'R16-91', 'R16-92', 'SF-102', 'home', 4, null::timestamptz),
    ('QF-100', 100, 'QUARTERFINAL', 'RIGHT', 28, null, null, 'R16-95', 'R16-96', 'SF-102', 'away', 4, null::timestamptz),
    ('SF-101', 101, 'SEMIFINAL', 'CENTER', 29, null, null, 'QF-97', 'QF-98', 'F-104', 'home', 8, null::timestamptz),
    ('SF-102', 102, 'SEMIFINAL', 'CENTER', 30, null, null, 'QF-99', 'QF-100', 'F-104', 'away', 8, null::timestamptz),
    ('F-104', 104, 'FINAL', 'CENTER', 31, null, null, 'SF-101', 'SF-102', null, null, 16, null::timestamptz)
)
insert into public.knockout_matches (
  code, fifa_match_number, round, bracket_side, display_order, home_team_id, away_team_id,
  home_source_match_code, away_source_match_code, next_match_code, next_slot, points, starts_at, updated_at
)
select
  match_seed.code,
  match_seed.fifa_match_number,
  match_seed.round,
  match_seed.bracket_side,
  match_seed.display_order,
  home_team.id,
  away_team.id,
  match_seed.home_source_match_code,
  match_seed.away_source_match_code,
  match_seed.next_match_code,
  match_seed.next_slot,
  match_seed.points,
  match_seed.starts_at,
  now()
from match_seed
left join public.teams home_team on home_team.code = match_seed.home_team_code
left join public.teams away_team on away_team.code = match_seed.away_team_code
on conflict (code) do update set
  fifa_match_number = excluded.fifa_match_number,
  round = excluded.round,
  bracket_side = excluded.bracket_side,
  display_order = excluded.display_order,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  home_source_match_code = excluded.home_source_match_code,
  away_source_match_code = excluded.away_source_match_code,
  next_match_code = excluded.next_match_code,
  next_slot = excluded.next_slot,
  points = excluded.points,
  starts_at = excluded.starts_at,
  updated_at = excluded.updated_at;

do $$
begin
  if (select count(*) from public.knockout_matches) <> 31 then
    raise exception 'Chave do mata-mata deve ter 31 jogos.';
  end if;

  if exists (
    select 1
    from public.knockout_matches match
    left join public.knockout_matches source on source.code = match.home_source_match_code
    where match.home_source_match_code is not null and source.id is null
  ) or exists (
    select 1
    from public.knockout_matches match
    left join public.knockout_matches source on source.code = match.away_source_match_code
    where match.away_source_match_code is not null and source.id is null
  ) or exists (
    select 1
    from public.knockout_matches match
    left join public.knockout_matches next_match on next_match.code = match.next_match_code
    where match.next_match_code is not null and next_match.id is null
  ) then
    raise exception 'Chave do mata-mata tem links quebrados.';
  end if;

  if exists (
    select 1
    from public.knockout_matches
    where round = 'ROUND_OF_32' and (home_team_id is null or away_team_id is null)
  ) then
    raise exception 'Chave do mata-mata tem selecoes iniciais ausentes.';
  end if;
end;
$$;

create or replace function public.submit_knockout_picks(
  submitted_picks jsonb,
  locked_at timestamptz,
  profile_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_submission_id uuid;
  match_record record;
  home_resolved uuid;
  away_resolved uuid;
  selected_team uuid;
begin
  if profile_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if now() >= locked_at then
    raise exception 'Picks do mata-mata bloqueados. O prazo de envio ja passou.';
  end if;

  if not exists (select 1 from public.profiles where id = profile_id) then
    raise exception 'Crie um nickname antes de enviar seus picks.';
  end if;

  if exists (select 1 from public.knockout_submissions where user_id = profile_id) then
    raise exception 'Voce ja enviou seus picks do mata-mata.';
  end if;

  if jsonb_typeof(submitted_picks) <> 'array' or jsonb_array_length(submitted_picks) <> 31 then
    raise exception 'Voce precisa escolher os 31 jogos do mata-mata.';
  end if;

  create temp table _submitted_knockout_picks (
    match_code text primary key,
    picked_team_id uuid not null
  ) on commit drop;

  insert into _submitted_knockout_picks (match_code, picked_team_id)
  select item->>'matchCode', (item->>'pickedTeamId')::uuid
  from jsonb_array_elements(submitted_picks) as item;

  if (select count(*) from _submitted_knockout_picks) <> 31 then
    raise exception 'Cada jogo deve ter apenas um vencedor escolhido.';
  end if;

  if (
    select count(*)
    from _submitted_knockout_picks pick
    left join public.knockout_matches match on match.code = pick.match_code
    where match.id is null
  ) > 0 then
    raise exception 'Existe um jogo invalido nos picks.';
  end if;

  if (
    select count(*)
    from _submitted_knockout_picks pick
    left join public.teams team on team.id = pick.picked_team_id
    where team.id is null
  ) > 0 then
    raise exception 'Existe uma selecao invalida nos picks.';
  end if;

  create temp table _resolved_knockout_matches (
    match_code text primary key,
    home_team_id uuid not null,
    away_team_id uuid not null,
    picked_team_id uuid not null
  ) on commit drop;

  for match_record in
    select *
    from public.knockout_matches
    order by
      case round
        when 'ROUND_OF_32' then 1
        when 'ROUND_OF_16' then 2
        when 'QUARTERFINAL' then 3
        when 'SEMIFINAL' then 4
        when 'FINAL' then 5
      end,
      display_order
  loop
    home_resolved := match_record.home_team_id;
    away_resolved := match_record.away_team_id;

    if home_resolved is null then
      select picked_team_id into home_resolved
      from _resolved_knockout_matches
      where match_code = match_record.home_source_match_code;
    end if;

    if away_resolved is null then
      select picked_team_id into away_resolved
      from _resolved_knockout_matches
      where match_code = match_record.away_source_match_code;
    end if;

    select picked_team_id into selected_team
    from _submitted_knockout_picks
    where match_code = match_record.code;

    if home_resolved is null or away_resolved is null then
      raise exception 'Chave incompleta no jogo %.', match_record.code;
    end if;

    if selected_team is distinct from home_resolved and selected_team is distinct from away_resolved then
      raise exception 'Pick incoerente no jogo %.', match_record.code;
    end if;

    insert into _resolved_knockout_matches (match_code, home_team_id, away_team_id, picked_team_id)
    values (match_record.code, home_resolved, away_resolved, selected_team);
  end loop;

  insert into public.knockout_submissions (user_id)
  values (profile_id)
  returning id into new_submission_id;

  insert into public.knockout_picks (submission_id, match_id, picked_team_id)
  select new_submission_id, match.id, resolved.picked_team_id
  from _resolved_knockout_matches resolved
  join public.knockout_matches match on match.code = resolved.match_code;

  return new_submission_id;
exception
  when unique_violation then
    raise exception 'Voce ja enviou seus picks do mata-mata.';
end;
$$;

grant execute on function public.submit_knockout_picks(jsonb, timestamptz, uuid) to service_role;
