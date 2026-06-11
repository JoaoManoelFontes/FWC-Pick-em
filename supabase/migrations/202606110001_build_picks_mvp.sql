create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  group_name text not null,
  flag_emoji text,
  created_at timestamptz not null default now()
);

create table if not exists public.pick_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.picks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.pick_submissions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  pick_type text not null check (
    pick_type in ('GROUP_WINNER', 'QUALIFIED_NOT_WINNER', 'ELIMINATED')
  ),
  created_at timestamptz not null default now(),
  unique(submission_id, team_id)
);

create table if not exists public.team_results (
  team_id uuid primary key references public.teams(id) on delete cascade,
  group_position int,
  qualified boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.pick_scores (
  pick_id uuid primary key references public.picks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_correct boolean not null default false,
  points int not null default 0,
  calculated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.pick_submissions enable row level security;
alter table public.picks enable row level security;
alter table public.team_results enable row level security;
alter table public.pick_scores enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "teams_select_authenticated" on public.teams
  for select to authenticated
  using (true);

create policy "pick_submissions_select_own" on public.pick_submissions
  for select to authenticated
  using (user_id = auth.uid());

create policy "picks_select_own" on public.picks
  for select to authenticated
  using (
    exists (
      select 1
      from public.pick_submissions ps
      where ps.id = picks.submission_id
        and ps.user_id = auth.uid()
    )
  );

create or replace function public.submit_user_picks(
  submitted_picks jsonb,
  locked_at timestamptz
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_submission_id uuid;
begin
  if current_user_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if now() >= locked_at then
    raise exception 'Picks bloqueados. O prazo de envio ja passou.';
  end if;

  if not exists (select 1 from public.profiles where id = current_user_id) then
    raise exception 'Crie um nickname antes de enviar seus picks.';
  end if;

  if exists (select 1 from public.pick_submissions where user_id = current_user_id) then
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
  values (current_user_id)
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

grant execute on function public.submit_user_picks(jsonb, timestamptz) to authenticated;
