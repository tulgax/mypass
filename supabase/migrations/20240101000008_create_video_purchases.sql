-- migration: create video_purchases table and rls policies
-- purpose: track student entitlements for video classes (time-limited access)
-- notes:
-- - payment integration is not implemented in this repo yet; status transitions are managed by app/server actions

create table if not exists public.video_purchases (
  id bigserial primary key,
  video_class_id bigint not null references public.video_classes(id) on delete cascade,
  student_id uuid not null references public.user_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'refunded', 'failed')),
  amount numeric(10, 2),
  currency text,
  gateway text,
  gateway_transaction_id text,
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (video_class_id, student_id)
);

create index if not exists idx_video_purchases_student_id on public.video_purchases(student_id);
create index if not exists idx_video_purchases_video_class_id on public.video_purchases(video_class_id);
create index if not exists idx_video_purchases_status on public.video_purchases(status);
create index if not exists idx_video_purchases_expires_at on public.video_purchases(expires_at);

comment on table public.video_purchases is 'Student purchases/entitlements for video classes (time-limited access).';

alter table public.video_purchases enable row level security;

-- anon: no access
create policy "anon cannot select video_purchases"
  on public.video_purchases
  for select
  to anon
  using (false);

create policy "anon cannot insert video_purchases"
  on public.video_purchases
  for insert
  to anon
  with check (false);

create policy "anon cannot update video_purchases"
  on public.video_purchases
  for update
  to anon
  using (false)
  with check (false);

create policy "anon cannot delete video_purchases"
  on public.video_purchases
  for delete
  to anon
  using (false);

-- authenticated: students can read their own purchases
create policy "authenticated select own video_purchases"
  on public.video_purchases
  for select
  to authenticated
  using (student_id = (select auth.uid()));

-- authenticated: students can create a pending purchase for themselves
create policy "authenticated insert own video_purchases"
  on public.video_purchases
  for insert
  to authenticated
  with check (student_id = (select auth.uid()));

-- authenticated: prevent students from updating entitlements directly
create policy "authenticated update video_purchases only managers"
  on public.video_purchases
  for update
  to authenticated
  using (
    public.user_can_manage_studio(
      (select vc.studio_id from public.video_classes vc where vc.id = video_purchases.video_class_id)
    )
  )
  with check (
    public.user_can_manage_studio(
      (select vc.studio_id from public.video_classes vc where vc.id = video_purchases.video_class_id)
    )
  );

-- authenticated: managers can delete purchases for their studio (admin cleanup)
create policy "authenticated delete video_purchases only managers"
  on public.video_purchases
  for delete
  to authenticated
  using (
    public.user_can_manage_studio(
      (select vc.studio_id from public.video_classes vc where vc.id = video_purchases.video_class_id)
    )
  );

