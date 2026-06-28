-- Copa do Mundo 2026 - resultados finais da fase de grupos.
-- Fontes consultadas em 2026-06-28:
-- - https://www.sbnation.com/soccer/1117905/world-cup-standings-updated-full-list-of-teams
-- - https://www.sbnation.com/fifa-world-cup/1117914/world-cup-2026-third-place-standings
--
-- Como usar no Supabase SQL Editor:
-- 1. Execute este arquivo inteiro.
-- 2. Confirme que a consulta "missing_results" retorna zero linhas.
-- 3. Use a ultima consulta para visualizar/exportar o ranking.

begin;

with final_results (code, group_position, qualified) as (
  values
    -- Grupo A
    ('MEX', 1, true),
    ('RSA', 2, true),
    ('KOR', 3, false),
    ('CZE', 4, false),

    -- Grupo B
    ('SUI', 1, true),
    ('CAN', 2, true),
    ('BIH', 3, true),
    ('QAT', 4, false),

    -- Grupo C
    ('BRA', 1, true),
    ('MAR', 2, true),
    ('SCO', 3, false),
    ('HAI', 4, false),

    -- Grupo D
    ('USA', 1, true),
    ('AUS', 2, true),
    ('PAR', 3, true),
    ('TUR', 4, false),

    -- Grupo E
    ('GER', 1, true),
    ('CIV', 2, true),
    ('ECU', 3, true),
    ('CUW', 4, false),

    -- Grupo F
    ('NED', 1, true),
    ('JPN', 2, true),
    ('SWE', 3, true),
    ('TUN', 4, false),

    -- Grupo G
    ('BEL', 1, true),
    ('EGY', 2, true),
    ('IRN', 3, false),
    ('NZL', 4, false),

    -- Grupo H
    ('ESP', 1, true),
    ('CPV', 2, true),
    ('URU', 3, false),
    ('KSA', 4, false),

    -- Grupo I
    ('FRA', 1, true),
    ('NOR', 2, true),
    ('SEN', 3, true),
    ('IRQ', 4, false),

    -- Grupo J
    ('ARG', 1, true),
    ('AUT', 2, true),
    ('ALG', 3, true),
    ('JOR', 4, false),

    -- Grupo K
    ('COL', 1, true),
    ('POR', 2, true),
    ('COD', 3, true),
    ('UZB', 4, false),

    -- Grupo L
    ('ENG', 1, true),
    ('CRO', 2, true),
    ('GHA', 3, true),
    ('PAN', 4, false)
)
insert into public.team_results (team_id, group_position, qualified, updated_at)
select
  teams.id,
  final_results.group_position,
  final_results.qualified,
  now()
from final_results
join public.teams on teams.code = final_results.code
on conflict (team_id) do update set
  group_position = excluded.group_position,
  qualified = excluded.qualified,
  updated_at = excluded.updated_at;

commit;

-- Deve retornar zero linhas.
select
  teams.group_name,
  teams.name,
  teams.code,
  team_results.group_position,
  team_results.qualified
from public.teams
left join public.team_results on team_results.team_id = teams.id
where team_results.team_id is null
  or team_results.group_position is null
order by teams.group_name, teams.name;

-- Recalcula pontuacao de todos os picks.
select * from public.recalculate_pick_scores();

-- Ranking final.
select
  row_number() over (
    order by total_points desc, submitted_at asc
  ) as position,
  nickname,
  total_points,
  correct_picks,
  scored_picks,
  submitted_at
from public.ranking_scores
order by total_points desc, submitted_at asc;
