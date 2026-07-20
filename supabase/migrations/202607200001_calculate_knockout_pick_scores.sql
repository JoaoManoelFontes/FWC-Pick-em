-- Estrutura final para resultados e pontuacao do mata-mata.
-- Pontos separados da fase de grupos: usa public.knockout_pick_scores.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'knockout_match_results_completed_winner_check'
  ) then
    alter table public.knockout_match_results
      add constraint knockout_match_results_completed_winner_check
      check (completed = false or winner_team_id is not null);
  end if;
end;
$$;

create or replace function public.recalculate_knockout_pick_scores()
returns table (
  total_picks_scored int,
  total_correct int,
  total_points int,
  recalculated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  scored_at timestamptz := now();
begin
  if exists (
    select 1
    from public.knockout_matches match
    left join public.knockout_match_results result on result.match_id = match.id
    where result.match_id is null
      or result.completed = false
      or result.winner_team_id is null
  ) then
    raise exception 'Cadastre o vencedor de todos os jogos do mata-mata antes de recalcular a pontuacao.';
  end if;

  return query
  with calculated_scores as (
    select
      pick.id as pick_id,
      submission.user_id,
      pick.picked_team_id = result.winner_team_id as is_correct,
      match.points
    from public.knockout_picks pick
    join public.knockout_submissions submission on submission.id = pick.submission_id
    join public.knockout_matches match on match.id = pick.match_id
    join public.knockout_match_results result on result.match_id = match.id
    where result.completed = true
  ),
  upserted_scores as (
    insert into public.knockout_pick_scores (
      pick_id,
      user_id,
      is_correct,
      points,
      calculated_at
    )
    select
      pick_id,
      user_id,
      is_correct,
      case when is_correct then points else 0 end,
      scored_at
    from calculated_scores
    on conflict (pick_id) do update set
      user_id = excluded.user_id,
      is_correct = excluded.is_correct,
      points = excluded.points,
      calculated_at = excluded.calculated_at
    returning knockout_pick_scores.is_correct, knockout_pick_scores.points
  )
  select
    count(*)::int as total_picks_scored,
    count(*) filter (where upserted_scores.is_correct)::int as total_correct,
    coalesce(sum(upserted_scores.points), 0)::int as total_points,
    scored_at as recalculated_at
  from upserted_scores;
end;
$$;

grant execute on function public.recalculate_knockout_pick_scores() to service_role;

create or replace view public.knockout_ranking_scores
with (security_invoker = true)
as
select
  submission.user_id,
  profile.nickname,
  submission.submitted_at,
  coalesce(sum(score.points), 0)::int as knockout_points,
  count(score.pick_id) filter (where score.is_correct)::int as correct_knockout_picks,
  count(score.pick_id)::int as scored_knockout_picks
from public.knockout_submissions submission
join public.profiles profile on profile.id = submission.user_id
left join public.knockout_picks pick on pick.submission_id = submission.id
left join public.knockout_pick_scores score on score.pick_id = pick.id
group by submission.user_id, profile.nickname, submission.submitted_at
order by knockout_points desc, submission.submitted_at asc;

create or replace view public.combined_ranking_scores
with (security_invoker = true)
as
select
  coalesce(group_scores.user_id, knockout_scores.user_id) as user_id,
  coalesce(group_scores.nickname, knockout_scores.nickname) as nickname,
  coalesce(group_scores.total_points, 0)::int as group_points,
  coalesce(knockout_scores.knockout_points, 0)::int as knockout_points,
  (
    coalesce(group_scores.total_points, 0)
    + coalesce(knockout_scores.knockout_points, 0)
  )::int as total_points,
  coalesce(group_scores.correct_picks, 0)::int as correct_group_picks,
  coalesce(knockout_scores.correct_knockout_picks, 0)::int as correct_knockout_picks,
  coalesce(group_scores.scored_picks, 0)::int as scored_group_picks,
  coalesce(knockout_scores.scored_knockout_picks, 0)::int as scored_knockout_picks,
  group_scores.submitted_at as group_submitted_at,
  knockout_scores.submitted_at as knockout_submitted_at,
  (
    (
      coalesce(group_scores.total_points, 0)
      + coalesce(knockout_scores.knockout_points, 0) * 2
    )::numeric / 3
  )::numeric(8, 2) as weighted_score
from public.ranking_scores group_scores
full join public.knockout_ranking_scores knockout_scores
  on knockout_scores.user_id = group_scores.user_id
order by total_points desc, group_submitted_at asc nulls last, knockout_submitted_at asc nulls last;
