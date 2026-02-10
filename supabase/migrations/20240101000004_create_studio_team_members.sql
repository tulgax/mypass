-- Migration: create studio_team_members table and RLS policies
-- Purpose: store studio team members (manager, instructor); owner remains studios.owner_id
-- Affected: new table studio_team_members; optional FK on class_instances.instructor_id

-- Create studio_team_members table
-- role: 'manager' | 'instructor'; owner is not stored here (studios.owner_id)
create table if not exists studio_team_members (
  id bigserial primary key,
  studio_id bigint not null references studios(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  role text not null check (role in ('manager', 'instructor')),
  invited_at timestamptz not null default now(),
  invited_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, user_id)
);

create index if not exists idx_studio_team_members_studio_id on studio_team_members(studio_id);
create index if not exists idx_studio_team_members_user_id on studio_team_members(user_id);

comment on table studio_team_members is 'Team members of a studio (manager or instructor). Owner is studios.owner_id.';

-- Enable RLS
alter table studio_team_members enable row level security;

-- RLS: anon has no access (no policies granting access = no rows)
-- We create explicit restrictive policies for anon so behavior is documented.
create policy "anon cannot select studio_team_members"
  on studio_team_members for select to anon using ( false );

create policy "anon cannot insert studio_team_members"
  on studio_team_members for insert to anon with check ( false );

create policy "anon cannot update studio_team_members"
  on studio_team_members for update to anon using ( false ) with check ( false );

create policy "anon cannot delete studio_team_members"
  on studio_team_members for delete to anon using ( false );

-- RLS: authenticated - studio owner or team member can select rows for their studio
create policy "authenticated select studio_team_members if owner or member"
  on studio_team_members for select to authenticated
  using (
    exists (
      select 1 from studios s
      where s.id = studio_team_members.studio_id
      and s.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from studio_team_members stm2
      where stm2.studio_id = studio_team_members.studio_id
      and stm2.user_id = (select auth.uid())
    )
  );

-- Only studio owner can insert team members
create policy "authenticated insert studio_team_members if owner"
  on studio_team_members for insert to authenticated
  with check (
    exists (
      select 1 from studios s
      where s.id = studio_team_members.studio_id
      and s.owner_id = (select auth.uid())
    )
  );

-- Only studio owner can update team members (e.g. change role)
create policy "authenticated update studio_team_members if owner"
  on studio_team_members for update to authenticated
  using (
    exists (
      select 1 from studios s
      where s.id = studio_team_members.studio_id
      and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from studios s
      where s.id = studio_team_members.studio_id
      and s.owner_id = (select auth.uid())
    )
  );

-- Only studio owner can delete (remove) team members
create policy "authenticated delete studio_team_members if owner"
  on studio_team_members for delete to authenticated
  using (
    exists (
      select 1 from studios s
      where s.id = studio_team_members.studio_id
      and s.owner_id = (select auth.uid())
    )
  );

-- Optional: FK from class_instances.instructor_id to user_profiles(id)
-- Ensures instructor_id references a valid profile; allows instructor stats by studio
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'class_instances_instructor_id_fkey'
    and table_name = 'class_instances'
  ) then
    alter table class_instances
    add constraint class_instances_instructor_id_fkey
    foreign key (instructor_id) references user_profiles(id) on delete set null;
  end if;
end $$;
