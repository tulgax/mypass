-- Migration: helper to resolve emails for a list of user IDs
-- Purpose: team page needs to display email addresses; auth.users is not directly selectable via RLS
-- Uses SECURITY DEFINER to access auth.users safely

create or replace function public.get_emails_by_user_ids(user_ids uuid[])
returns table (user_id uuid, email text)
language sql
security definer
set search_path = ''
stable
as $$
  select au.id as user_id, au.email::text as email
  from auth.users au
  where au.id = any(get_emails_by_user_ids.user_ids);
$$;

comment on function public.get_emails_by_user_ids(uuid[]) is
  'Returns user_id and email pairs for the given user IDs. Used by studio team page to display member emails.';
