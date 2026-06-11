alter table public.pick_scores drop constraint if exists pick_scores_user_id_fkey;
alter table public.pick_submissions drop constraint if exists pick_submissions_user_id_fkey;
alter table public.profiles drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column id set default gen_random_uuid(),
  alter column email set not null;

create unique index if not exists profiles_email_key on public.profiles (email);

alter table public.pick_submissions
  add constraint pick_submissions_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.pick_scores
  add constraint pick_scores_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "teams_select_authenticated" on public.teams;
drop policy if exists "pick_submissions_select_own" on public.pick_submissions;
drop policy if exists "picks_select_own" on public.picks;
drop policy if exists "profiles_service_role_all" on public.profiles;
drop policy if exists "teams_select_public" on public.teams;
drop policy if exists "pick_submissions_service_role_all" on public.pick_submissions;
drop policy if exists "picks_service_role_all" on public.picks;

create policy "profiles_service_role_all" on public.profiles
  for all to service_role
  using (true)
  with check (true);

create policy "teams_select_public" on public.teams
  for select to anon, authenticated
  using (true);

create policy "pick_submissions_service_role_all" on public.pick_submissions
  for all to service_role
  using (true)
  with check (true);

create policy "picks_service_role_all" on public.picks
  for all to service_role
  using (true)
  with check (true);

drop function if exists public.submit_user_picks(jsonb, timestamptz);

create or replace function public.submit_user_picks(
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
begin
  if profile_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if now() >= locked_at then
    raise exception 'Picks bloqueados. O prazo de envio ja passou.';
  end if;

  if not exists (select 1 from public.profiles where id = profile_id) then
    raise exception 'Crie um nickname antes de enviar seus picks.';
  end if;

  if exists (select 1 from public.pick_submissions where user_id = profile_id) then
    raise exception 'Voce ja enviou seus picks.';
  end if;

  if jsonb_array_length(submitted_picks) <> 22 then
    raise exception 'Voce precisa enviar exatamente 22 picks.';
  end if;

  if (
    select count(distinct item->>'teamId')
    from jsonb_array_elements(submitted_picks) as item
  ) <> 22 then
    raise exception 'Uma selecao nao pode aparecer em mais de uma categoria.';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(submitted_picks) as item
    where item->>'pickType' = 'GROUP_WINNER'
  ) <> 6 then
    raise exception 'Escolha exatamente 6 lideres de grupo.';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(submitted_picks) as item
    where item->>'pickType' = 'QUALIFIED_NOT_WINNER'
  ) <> 10 then
    raise exception 'Escolha exatamente 10 classificados.';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(submitted_picks) as item
    where item->>'pickType' = 'ELIMINATED'
  ) <> 6 then
    raise exception 'Escolha exatamente 6 eliminados.';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(submitted_picks) as item
    left join public.teams t on t.id = (item->>'teamId')::uuid
    where t.id is null
  ) > 0 then
    raise exception 'Existe uma selecao invalida nos picks.';
  end if;

  insert into public.pick_submissions (user_id)
  values (profile_id)
  returning id into new_submission_id;

  insert into public.picks (submission_id, team_id, pick_type)
  select
    new_submission_id,
    (item->>'teamId')::uuid,
    item->>'pickType'
  from jsonb_array_elements(submitted_picks) as item;

  return new_submission_id;
exception
  when unique_violation then
    raise exception 'Voce ja enviou seus picks.';
end;
$$;

grant execute on function public.submit_user_picks(jsonb, timestamptz, uuid) to service_role;
