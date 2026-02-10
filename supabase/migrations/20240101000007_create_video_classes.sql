-- migration: create video_classes table and rls policies
-- purpose: allow studios (owner/manager) to create and sell on-demand video classes
-- notes:
-- - playback is gated in app code via purchases + mux signed playback
-- - this table stores mux upload/asset/playback metadata for processing status

-- helper: studio owner or manager (not instructor)
create or replace function public.user_can_manage_studio(p_studio_id bigint)
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
    where stm.studio_id = p_studio_id
      and stm.user_id = (select auth.uid())
      and stm.role = 'manager'
  );
$$;

comment on function public.user_can_manage_studio(bigint) is 'Returns true if current user is studio owner or a manager for the studio.';

create table if not exists public.video_classes (
  id bigserial primary key,
  studio_id bigint not null references public.studios(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'MNT',
  access_duration_days integer not null default 30 check (access_duration_days > 0),
  mux_upload_id text,
  mux_asset_id text,
  mux_playback_id text,
  mux_status text not null default 'draft',
  is_active boolean not null default false,
  created_by uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_video_classes_studio_id on public.video_classes(studio_id);
create index if not exists idx_video_classes_is_active on public.video_classes(is_active);
create index if not exists idx_video_classes_mux_status on public.video_classes(mux_status);

comment on table public.video_classes is 'On-demand video classes sold by studios; mux metadata stored for upload/processing.';

alter table public.video_classes enable row level security;

-- anon: only see active video classes
create policy "anon select active video_classes"
  on public.video_classes
  for select
  to anon
  using (is_active = true);

-- authenticated: can always see active; studio owner/manager can see all for their studio
create policy "authenticated select video_classes if active or studio manager"
  on public.video_classes
  for select
  to authenticated
  using (is_active = true or public.user_can_manage_studio(studio_id));

-- authenticated: studio owner/manager can insert for their studio; must set created_by to self
create policy "authenticated insert video_classes if studio manager"
  on public.video_classes
  for insert
  to authenticated
  with check (
    public.user_can_manage_studio(studio_id)
    and created_by = (select auth.uid())
  );

-- authenticated: studio owner/manager can update rows for their studio
create policy "authenticated update video_classes if studio manager"
  on public.video_classes
  for update
  to authenticated
  using (public.user_can_manage_studio(studio_id))
  with check (public.user_can_manage_studio(studio_id));

-- authenticated: studio owner/manager can delete rows for their studio
create policy "authenticated delete video_classes if studio manager"
  on public.video_classes
  for delete
  to authenticated
  using (public.user_can_manage_studio(studio_id));

