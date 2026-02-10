-- Fix infinite recursion in studio_team_members SELECT policy.
-- The previous policy used EXISTS (SELECT from studio_team_members) which re-triggered RLS.
-- Use a SECURITY DEFINER function so the check runs without RLS.

create or replace function public.user_can_access_studio_team(p_studio_id bigint)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.studios s
    where s.id = p_studio_id and s.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.studio_team_members stm
    where stm.studio_id = p_studio_id and stm.user_id = (select auth.uid())
  );
$$;

comment on function public.user_can_access_studio_team(bigint) is 'Returns true if current user is studio owner or a team member. Used by RLS to avoid recursion.';

drop policy if exists "authenticated select studio_team_members if owner or member" on studio_team_members;

create policy "authenticated select studio_team_members if owner or member"
  on studio_team_members for select to authenticated
  using ( public.user_can_access_studio_team(studio_id) );
