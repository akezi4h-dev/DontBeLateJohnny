-- Run this in: Supabase Dashboard → SQL Editor → New query

create table public.shifts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  employer    text not null,
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  notes       text default '',
  created_at  timestamptz default now()
);

create table public.tasks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  shift_id    uuid references public.shifts on delete cascade not null,
  text        text not null,
  completed   boolean default false,
  created_at  timestamptz default now()
);

alter table public.shifts enable row level security;
alter table public.tasks  enable row level security;

create policy "users own their shifts"
  on public.shifts for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users own their tasks"
  on public.tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable realtime for both tables
-- After running the SQL, also go to:
-- Database → Replication → supabase_realtime publication
-- and add both `shifts` and `tasks` tables.
