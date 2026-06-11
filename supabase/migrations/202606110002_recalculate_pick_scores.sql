alter table public.team_results
  add constraint team_results_group_position_check
  check (group_position is null or group_position between 1 and 4);

create or replace function public.recalculate_pick_scores()
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
    from public.teams t
    left join public.team_results tr on tr.team_id = t.id
    where tr.team_id is null
      or tr.group_position is null
  ) then
    raise exception 'Cadastre o resultado final de todos os times antes de recalcular a pontuacao.';
  end if;

  return query
  with calculated_scores as (
    select
      p.id as pick_id,
      ps.user_id,
      case
        when p.pick_type = 'GROUP_WINNER'
          then tr.group_position = 1
        when p.pick_type = 'QUALIFIED_NOT_WINNER'
          then tr.qualified = true and tr.group_position <> 1
        when p.pick_type = 'ELIMINATED'
          then tr.qualified = false
        else false
      end as is_correct
    from public.picks p
    join public.pick_submissions ps on ps.id = p.submission_id
    join public.team_results tr on tr.team_id = p.team_id
  ),
  upserted_scores as (
    insert into public.pick_scores (
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
      case when is_correct then 1 else 0 end,
      scored_at
    from calculated_scores
    on conflict (pick_id) do update set
      user_id = excluded.user_id,
      is_correct = excluded.is_correct,
      points = excluded.points,
      calculated_at = excluded.calculated_at
    returning pick_scores.is_correct, pick_scores.points
  )
  select
    count(*)::int as total_picks_scored,
    count(*) filter (where upserted_scores.is_correct)::int as total_correct,
    coalesce(sum(upserted_scores.points), 0)::int as total_points,
    scored_at as recalculated_at
  from upserted_scores;
end;
$$;

create or replace view public.ranking_scores
with (security_invoker = true)
as
select
  ps.user_id,
  p.nickname,
  ps.submitted_at,
  coalesce(sum(score.points), 0)::int as total_points,
  count(score.pick_id) filter (where score.is_correct)::int as correct_picks,
  count(score.pick_id)::int as scored_picks
from public.pick_submissions ps
join public.profiles p on p.id = ps.user_id
left join public.picks pick on pick.submission_id = ps.id
left join public.pick_scores score on score.pick_id = pick.id
group by ps.user_id, p.nickname, ps.submitted_at
order by total_points desc, ps.submitted_at asc;
