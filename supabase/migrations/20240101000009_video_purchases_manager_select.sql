-- migration: allow studio owner/manager to view video purchases
-- purpose: reporting/admin activation flow requires studio staff to read purchases for their studio

create policy "authenticated select video_purchases for studio managers"
  on public.video_purchases
  for select
  to authenticated
  using (
    public.user_can_manage_studio(
      (select vc.studio_id from public.video_classes vc where vc.id = video_purchases.video_class_id)
    )
  );

