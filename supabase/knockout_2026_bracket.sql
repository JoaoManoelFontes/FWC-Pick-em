-- Copa do Mundo 2026 - chaveamento do mata-mata.
-- Fontes consultadas em 2026-06-28:
-- - https://apnews.com/article/world-cup-round-of-32-35a72baeef527fc815952f9b5997eb14
-- - https://www.sbnation.com/fifa-world-cup/1120327/2026-world-cup-round-of-32-full-list-of-matches-potential-round-of-16-games
-- - https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
--
-- Como usar no Supabase SQL Editor:
-- 1. Execute este arquivo inteiro depois de popular public.teams.
-- 2. Confirme que as consultas "missing_teams" e "broken_links" retornam zero linhas.
-- 3. Use a ultima consulta para visualizar/exportar a chave na ordem da UI.

begin;

create table if not exists public.knockout_matches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  fifa_match_number int unique,
  round text not null check (
    round in (
      'ROUND_OF_32',
      'ROUND_OF_16',
      'QUARTERFINAL',
      'SEMIFINAL',
      'FINAL'
    )
  ),
  bracket_side text not null check (bracket_side in ('LEFT', 'RIGHT', 'CENTER')),
  display_order int not null,
  home_team_id uuid references public.teams(id) on delete restrict,
  away_team_id uuid references public.teams(id) on delete restrict,
  home_source_match_code text,
  away_source_match_code text,
  next_match_code text,
  next_slot text check (next_slot in ('home', 'away')),
  points int not null check (points > 0),
  starts_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knockout_matches_home_slot_source_check
    check (home_team_id is not null or home_source_match_code is not null or round = 'FINAL'),
  constraint knockout_matches_away_slot_source_check
    check (away_team_id is not null or away_source_match_code is not null or round = 'FINAL')
);

create index if not exists knockout_matches_round_display_idx
  on public.knockout_matches (round, display_order);

create index if not exists knockout_matches_next_match_code_idx
  on public.knockout_matches (next_match_code);

alter table public.knockout_matches enable row level security;

drop policy if exists "knockout_matches_select_public" on public.knockout_matches;
create policy "knockout_matches_select_public" on public.knockout_matches
  for select to anon, authenticated
  using (true);

drop policy if exists "knockout_matches_service_role_all" on public.knockout_matches;
create policy "knockout_matches_service_role_all" on public.knockout_matches
  for all to service_role
  using (true)
  with check (true);

with match_seed (
  code,
  fifa_match_number,
  round,
  bracket_side,
  display_order,
  home_team_code,
  away_team_code,
  home_source_match_code,
  away_source_match_code,
  next_match_code,
  next_slot,
  points,
  starts_at
) as (
  values
    -- 16-avos: lado esquerdo superior.
    ('R32-74', 74, 'ROUND_OF_32', 'LEFT', 1, 'GER', 'PAR', null, null, 'R16-90', 'home', 1, null::timestamptz),
    ('R32-77', 77, 'ROUND_OF_32', 'LEFT', 2, 'FRA', 'SWE', null, null, 'R16-90', 'away', 1, null::timestamptz),
    ('R32-73', 73, 'ROUND_OF_32', 'LEFT', 3, 'RSA', 'CAN', null, null, 'R16-89', 'home', 1, '2026-06-28T19:00:00.000Z'::timestamptz),
    ('R32-75', 75, 'ROUND_OF_32', 'LEFT', 4, 'NED', 'MAR', null, null, 'R16-89', 'away', 1, null::timestamptz),

    -- 16-avos: lado esquerdo inferior.
    ('R32-83', 83, 'ROUND_OF_32', 'LEFT', 5, 'POR', 'CRO', null, null, 'R16-93', 'home', 1, null::timestamptz),
    ('R32-84', 84, 'ROUND_OF_32', 'LEFT', 6, 'ESP', 'AUT', null, null, 'R16-93', 'away', 1, null::timestamptz),
    ('R32-81', 81, 'ROUND_OF_32', 'LEFT', 7, 'USA', 'BIH', null, null, 'R16-94', 'home', 1, null::timestamptz),
    ('R32-82', 82, 'ROUND_OF_32', 'LEFT', 8, 'BEL', 'SEN', null, null, 'R16-94', 'away', 1, null::timestamptz),

    -- 16-avos: lado direito superior.
    ('R32-76', 76, 'ROUND_OF_32', 'RIGHT', 9, 'BRA', 'JPN', null, null, 'R16-91', 'home', 1, null::timestamptz),
    ('R32-78', 78, 'ROUND_OF_32', 'RIGHT', 10, 'CIV', 'NOR', null, null, 'R16-91', 'away', 1, null::timestamptz),
    ('R32-79', 79, 'ROUND_OF_32', 'RIGHT', 11, 'MEX', 'ECU', null, null, 'R16-92', 'home', 1, null::timestamptz),
    ('R32-80', 80, 'ROUND_OF_32', 'RIGHT', 12, 'ENG', 'COD', null, null, 'R16-92', 'away', 1, null::timestamptz),

    -- 16-avos: lado direito inferior.
    ('R32-86', 86, 'ROUND_OF_32', 'RIGHT', 13, 'ARG', 'CPV', null, null, 'R16-95', 'home', 1, null::timestamptz),
    ('R32-88', 88, 'ROUND_OF_32', 'RIGHT', 14, 'AUS', 'EGY', null, null, 'R16-95', 'away', 1, null::timestamptz),
    ('R32-85', 85, 'ROUND_OF_32', 'RIGHT', 15, 'SUI', 'ALG', null, null, 'R16-96', 'home', 1, null::timestamptz),
    ('R32-87', 87, 'ROUND_OF_32', 'RIGHT', 16, 'COL', 'GHA', null, null, 'R16-96', 'away', 1, null::timestamptz),

    -- Oitavas.
    ('R16-90', 90, 'ROUND_OF_16', 'LEFT', 17, null, null, 'R32-74', 'R32-77', 'QF-97', 'home', 2, null::timestamptz),
    ('R16-89', 89, 'ROUND_OF_16', 'LEFT', 18, null, null, 'R32-73', 'R32-75', 'QF-97', 'away', 2, null::timestamptz),
    ('R16-93', 93, 'ROUND_OF_16', 'LEFT', 19, null, null, 'R32-83', 'R32-84', 'QF-98', 'home', 2, null::timestamptz),
    ('R16-94', 94, 'ROUND_OF_16', 'LEFT', 20, null, null, 'R32-81', 'R32-82', 'QF-98', 'away', 2, null::timestamptz),
    ('R16-91', 91, 'ROUND_OF_16', 'RIGHT', 21, null, null, 'R32-76', 'R32-78', 'QF-99', 'home', 2, null::timestamptz),
    ('R16-92', 92, 'ROUND_OF_16', 'RIGHT', 22, null, null, 'R32-79', 'R32-80', 'QF-99', 'away', 2, null::timestamptz),
    ('R16-95', 95, 'ROUND_OF_16', 'RIGHT', 23, null, null, 'R32-86', 'R32-88', 'QF-100', 'home', 2, null::timestamptz),
    ('R16-96', 96, 'ROUND_OF_16', 'RIGHT', 24, null, null, 'R32-85', 'R32-87', 'QF-100', 'away', 2, null::timestamptz),

    -- Quartas.
    ('QF-97', 97, 'QUARTERFINAL', 'LEFT', 25, null, null, 'R16-90', 'R16-89', 'SF-101', 'home', 4, null::timestamptz),
    ('QF-98', 98, 'QUARTERFINAL', 'LEFT', 26, null, null, 'R16-93', 'R16-94', 'SF-101', 'away', 4, null::timestamptz),
    ('QF-99', 99, 'QUARTERFINAL', 'RIGHT', 27, null, null, 'R16-91', 'R16-92', 'SF-102', 'home', 4, null::timestamptz),
    ('QF-100', 100, 'QUARTERFINAL', 'RIGHT', 28, null, null, 'R16-95', 'R16-96', 'SF-102', 'away', 4, null::timestamptz),

    -- Semifinais e final.
    ('SF-101', 101, 'SEMIFINAL', 'CENTER', 29, null, null, 'QF-97', 'QF-98', 'F-104', 'home', 8, null::timestamptz),
    ('SF-102', 102, 'SEMIFINAL', 'CENTER', 30, null, null, 'QF-99', 'QF-100', 'F-104', 'away', 8, null::timestamptz),
    ('F-104', 104, 'FINAL', 'CENTER', 31, null, null, 'SF-101', 'SF-102', null, null, 16, null::timestamptz)
)
insert into public.knockout_matches (
  code,
  fifa_match_number,
  round,
  bracket_side,
  display_order,
  home_team_id,
  away_team_id,
  home_source_match_code,
  away_source_match_code,
  next_match_code,
  next_slot,
  points,
  starts_at,
  updated_at
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

commit;

-- Deve retornar zero linhas.
with required_codes (code) as (
  values
    ('GER'), ('PAR'), ('FRA'), ('SWE'), ('RSA'), ('CAN'),
    ('NED'), ('MAR'), ('POR'), ('CRO'), ('ESP'), ('AUT'),
    ('USA'), ('BIH'), ('BEL'), ('SEN'), ('BRA'), ('JPN'),
    ('CIV'), ('NOR'), ('MEX'), ('ECU'), ('ENG'), ('COD'),
    ('ARG'), ('CPV'), ('AUS'), ('EGY'), ('SUI'), ('ALG'),
    ('COL'), ('GHA')
)
select required_codes.code as missing_teams
from required_codes
left join public.teams on teams.code = required_codes.code
where teams.id is null
order by required_codes.code;

-- Deve retornar zero linhas.
select
  child.code as broken_links,
  child.next_match_code
from public.knockout_matches child
left join public.knockout_matches parent on parent.code = child.next_match_code
where child.next_match_code is not null
  and parent.id is null
union all
select
  match.code as broken_links,
  match.home_source_match_code
from public.knockout_matches match
left join public.knockout_matches source on source.code = match.home_source_match_code
where match.home_source_match_code is not null
  and source.id is null
union all
select
  match.code as broken_links,
  match.away_source_match_code
from public.knockout_matches match
left join public.knockout_matches source on source.code = match.away_source_match_code
where match.away_source_match_code is not null
  and source.id is null;

-- Visualizacao da chave para a UI.
select
  knockout_matches.display_order,
  knockout_matches.code,
  knockout_matches.fifa_match_number,
  knockout_matches.round,
  knockout_matches.bracket_side,
  coalesce(home_team.code, knockout_matches.home_source_match_code) as home_slot,
  coalesce(away_team.code, knockout_matches.away_source_match_code) as away_slot,
  knockout_matches.next_match_code,
  knockout_matches.next_slot,
  knockout_matches.points
from public.knockout_matches
left join public.teams home_team on home_team.id = knockout_matches.home_team_id
left join public.teams away_team on away_team.id = knockout_matches.away_team_id
order by knockout_matches.display_order;
