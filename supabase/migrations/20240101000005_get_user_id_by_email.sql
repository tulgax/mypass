-- Migration: helper to resolve user id by email for team invites
-- Purpose: studio owner can invite by email; auth.users is not directly selectable by RLS

create or replace function public.get_user_id_by_email(user_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = user_email limit 1;
$$;

comment on function public.get_user_id_by_email(text) is 'Returns user id for given email. Used by studio owner when inviting team members.';
