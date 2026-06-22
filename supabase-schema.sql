-- ============================================
-- Forex Trading Journal - Supabase Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)

-- 1. Trades table
create table if not exists public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  pair text not null,
  direction text not null check (direction in ('buy', 'sell')),
  entry_price numeric not null,
  exit_price numeric,
  lot_size numeric not null default 0.01,
  pips numeric,
  profit_loss numeric,
  notes text,
  stop_loss numeric,
  take_profit numeric,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz default now()
);

-- 2. Trade images table
create table if not exists public.trade_images (
  id uuid default gen_random_uuid() primary key,
  trade_id uuid references public.trades(id) on delete cascade not null,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- 3. Daily notes table (unique per user + date)
create table if not exists public.daily_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  content text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.trades enable row level security;
alter table public.trade_images enable row level security;
alter table public.daily_notes enable row level security;

-- Trades: users can only access their own trades
create policy "Users can view own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades for update
  using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades for delete
  using (auth.uid() = user_id);

-- Trade images: users can access images for their own trades
create policy "Users can view own trade images"
  on public.trade_images for select
  using (
    exists (
      select 1 from public.trades
      where trades.id = trade_images.trade_id
        and trades.user_id = auth.uid()
    )
  );

create policy "Users can insert own trade images"
  on public.trade_images for insert
  with check (
    exists (
      select 1 from public.trades
      where trades.id = trade_images.trade_id
        and trades.user_id = auth.uid()
    )
  );

create policy "Users can delete own trade images"
  on public.trade_images for delete
  using (
    exists (
      select 1 from public.trades
      where trades.id = trade_images.trade_id
        and trades.user_id = auth.uid()
    )
  );

-- Daily notes: users can only access their own notes
create policy "Users can view own notes"
  on public.daily_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.daily_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.daily_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.daily_notes for delete
  using (auth.uid() = user_id);

-- ============================================
-- Storage Bucket
-- ============================================

insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', false)
on conflict (id) do nothing;

-- Storage policies: users can manage files in their own folder
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'trade-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own files"
  on storage.objects for select
  using (
    bucket_id = 'trade-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'trade-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- User Settings (daily limits)
-- ============================================

create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  max_trades_per_day int default 2,
  daily_loss_limit numeric default 100,
  daily_gain_limit numeric default 200,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- ============================================
-- Note Images
-- ============================================

create table if not exists public.note_images (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.daily_notes(id) on delete cascade not null,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.note_images enable row level security;

create policy "Users can view own note images"
  on public.note_images for select
  using (
    exists (
      select 1 from public.daily_notes
      where daily_notes.id = note_images.note_id
        and daily_notes.user_id = auth.uid()
    )
  );

create policy "Users can insert own note images"
  on public.note_images for insert
  with check (
    exists (
      select 1 from public.daily_notes
      where daily_notes.id = note_images.note_id
        and daily_notes.user_id = auth.uid()
    )
  );

create policy "Users can delete own note images"
  on public.note_images for delete
  using (
    exists (
      select 1 from public.daily_notes
      where daily_notes.id = note_images.note_id
        and daily_notes.user_id = auth.uid()
    )
  );
