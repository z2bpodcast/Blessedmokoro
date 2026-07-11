-- Migration: fournity_pipeline
-- Creates the content library and daily post log for the FOURNITY auto-Reel pipeline.

create table if not exists fournity_content (
  id uuid primary key default gen_random_uuid(),
  chapter_number int not null,
  chapter_title text not null,
  content_type text not null check (content_type in ('illumination', 'light_up_moment', 'declaration', 'dig_deeper', 'pull_quote')),
  scripture_ref text,
  text text not null,
  used_count int not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_fournity_content_rotation
  on fournity_content (used_count asc, last_used_at asc nulls first);

create table if not exists daily_posts (
  id uuid primary key default gen_random_uuid(),
  fournity_content_id uuid not null references fournity_content(id),
  voiceover_script text,
  caption_text text,
  audio_url text,
  video_url text,
  buffer_post_id text,
  platform_status text not null default 'pending' check (platform_status in ('pending', 'posted', 'failed')),
  posted_at timestamptz,
  error_log text,
  created_at timestamptz not null default now()
);

create index if not exists idx_daily_posts_status on daily_posts (platform_status, created_at desc);

-- Storage buckets for generated audio/video (run once; ignore error if bucket already exists)
insert into storage.buckets (id, name, public)
values ('daily-audio', 'daily-audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('daily-video', 'daily-video', true)
on conflict (id) do nothing;
