-- Copa do Mundo 2026 - resultados finais do mata-mata e calculo de pontos.
-- Fontes consultadas em 2026-07-20:
-- - FIFA fixtures/results:
--   https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
-- - FIFA final Espanha 1-0 Argentina:
--   https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights
-- - FIFA semifinais/quartas:
--   https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/france-spain-match-report-highlights
--   https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/argentina-switzerland-match-report-highlights
--   https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-belgium-match-report-highlights
-- - FIFA tambem confirmou a semifinal Inglaterra 1-2 Argentina na pagina de resultados.
-- - Noruega 1-2 Inglaterra, cruzado por match centres:
--   https://www.englandfootball.com/england/mens-senior-team/fixtures-results/2025-26/World-Cup/norway-england-fifa-world-cup-quarter-final-saturday-11-july-2026-match-centre
--
-- Como usar no Supabase SQL Editor:
-- 1. Execute a migration 202607200001_calculate_knockout_pick_scores.sql se ela ainda nao foi aplicada.
-- 2. Execute este arquivo inteiro.
-- 3. Confira as consultas finais de ranking.

begin;

-- Corrige os slots reais dos jogos derivados para facilitar auditoria visual da chave.
with resolved_matches (code, home_team_code, away_team_code) as (
  values
    ('R16-90', 'PAR', 'FRA'),
    ('R16-89', 'CAN', 'MAR'),
    ('R16-93', 'POR', 'ESP'),
    ('R16-94', 'USA', 'BEL'),
    ('R16-91', 'BRA', 'NOR'),
    ('R16-92', 'MEX', 'ENG'),
    ('R16-95', 'ARG', 'EGY'),
    ('R16-96', 'SUI', 'COL'),
    ('QF-97', 'FRA', 'MAR'),
    ('QF-98', 'ESP', 'BEL'),
    ('QF-99', 'NOR', 'ENG'),
    ('QF-100', 'ARG', 'SUI'),
    ('SF-101', 'FRA', 'ESP'),
    ('SF-102', 'ENG', 'ARG'),
    ('F-104', 'ESP', 'ARG')
)
update public.knockout_matches match
set
  home_team_id = home_team.id,
  away_team_id = away_team.id,
  updated_at = now()
from resolved_matches
join public.teams home_team on home_team.code = resolved_matches.home_team_code
join public.teams away_team on away_team.code = resolved_matches.away_team_code
where match.code = resolved_matches.code;

with final_results (match_code, winner_team_code) as (
  values
    -- Round of 32
    ('R32-73', 'CAN'),
    ('R32-74', 'PAR'),
    ('R32-75', 'MAR'),
    ('R32-76', 'BRA'),
    ('R32-77', 'FRA'),
    ('R32-78', 'NOR'),
    ('R32-79', 'MEX'),
    ('R32-80', 'ENG'),
    ('R32-81', 'USA'),
    ('R32-82', 'BEL'),
    ('R32-83', 'POR'),
    ('R32-84', 'ESP'),
    ('R32-85', 'SUI'),
    ('R32-86', 'ARG'),
    ('R32-87', 'COL'),
    ('R32-88', 'EGY'),

    -- Round of 16
    ('R16-90', 'FRA'),
    ('R16-89', 'MAR'),
    ('R16-93', 'ESP'),
    ('R16-94', 'BEL'),
    ('R16-91', 'NOR'),
    ('R16-92', 'ENG'),
    ('R16-95', 'ARG'),
    ('R16-96', 'SUI'),

    -- Quarter-finals
    ('QF-97', 'FRA'),
    ('QF-98', 'ESP'),
    ('QF-99', 'ENG'),
    ('QF-100', 'ARG'),

    -- Semi-finals and final
    ('SF-101', 'ESP'),
    ('SF-102', 'ARG'),
    ('F-104', 'ESP')
)
insert into public.knockout_match_results (
  match_id,
  winner_team_id,
  completed,
  updated_at
)
select
  match.id,
  winner.id,
  true,
  now()
from final_results
join public.knockout_matches match on match.code = final_results.match_code
join public.teams winner on winner.code = final_results.winner_team_code
on conflict (match_id) do update set
  winner_team_id = excluded.winner_team_id,
  completed = excluded.completed,
  updated_at = excluded.updated_at;

do $$
begin
  if (
    select count(*)
    from public.knockout_match_results result
    join public.knockout_matches match on match.id = result.match_id
    where result.completed = true
      and result.winner_team_id is not null
  ) <> 31 then
    raise exception 'Mata-mata deve ter 31 resultados completos.';
  end if;

  if exists (
    select 1
    from public.knockout_match_results result
    join public.knockout_matches match on match.id = result.match_id
    where result.completed = true
      and result.winner_team_id is distinct from match.home_team_id
      and result.winner_team_id is distinct from match.away_team_id
  ) then
    raise exception 'Existe vencedor fora dos participantes do jogo.';
  end if;
end;
$$;

commit;

-- Deve retornar zero linhas.
select
  match.code as missing_knockout_result
from public.knockout_matches match
left join public.knockout_match_results result on result.match_id = match.id
where result.match_id is null
  or result.completed = false
  or result.winner_team_id is null
order by match.display_order;

-- Recalcula somente os pontos do mata-mata.
select * from public.recalculate_knockout_pick_scores();

-- Ranking do mata-mata, separado da fase de grupos.
select
  row_number() over (
    order by knockout_points desc, submitted_at asc
  ) as position,
  nickname,
  knockout_points,
  correct_knockout_picks,
  scored_knockout_picks,
  submitted_at
from public.knockout_ranking_scores
order by knockout_points desc, submitted_at asc;

-- Ranking combinado, preservando os pontos separados.
select
  row_number() over (
    order by total_points desc, group_submitted_at asc nulls last, knockout_submitted_at asc nulls last
  ) as position,
  nickname,
  group_points,
  knockout_points,
  weighted_score,
  total_points,
  correct_group_picks,
  correct_knockout_picks
from public.combined_ranking_scores
order by total_points desc, group_submitted_at asc nulls last, knockout_submitted_at asc nulls last;
