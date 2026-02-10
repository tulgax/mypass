-- migration: add metadata columns to video_classes
-- purpose: support instructor assignment, categories, difficulty levels,
--          tags, thumbnails, preview clips, featured flag, and sort ordering
-- affected table: video_classes

-- instructor assignment (references user_profiles so rls resolves)
alter table public.video_classes
  add column if not exists instructor_id uuid references public.user_profiles(id) on delete set null;

-- category: free-text for flexible categorization (e.g. Yoga, Pilates, HIIT)
alter table public.video_classes
  add column if not exists category text;

-- difficulty level: constrained to known values
alter table public.video_classes
  add column if not exists difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced'));

-- custom thumbnail url (overrides mux auto-thumbnail when set)
alter table public.video_classes
  add column if not exists thumbnail_url text;

-- tags: postgres text array for flexible tagging / filtering
alter table public.video_classes
  add column if not exists tags text[] default '{}';

-- featured flag for highlighting specific videos
alter table public.video_classes
  add column if not exists is_featured boolean not null default false;

-- sort order for manual display ordering (lower = first)
alter table public.video_classes
  add column if not exists sort_order integer not null default 0;

-- duration in seconds, auto-populated from mux asset metadata when ready
alter table public.video_classes
  add column if not exists duration_seconds integer;

-- preview / trailer clip: separate mux asset with public playback
alter table public.video_classes
  add column if not exists preview_mux_upload_id text;

alter table public.video_classes
  add column if not exists preview_mux_asset_id text;

alter table public.video_classes
  add column if not exists preview_mux_playback_id text;

-- indexes for common query patterns
create index if not exists idx_video_classes_instructor_id on public.video_classes(instructor_id);
create index if not exists idx_video_classes_category on public.video_classes(category);
create index if not exists idx_video_classes_is_featured on public.video_classes(is_featured);
create index if not exists idx_video_classes_sort_order on public.video_classes(sort_order);
