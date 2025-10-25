-- Create transcripts table to store user transcriptions
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  language text not null default 'en-US',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.transcripts enable row level security;

-- RLS Policies: Users can only access their own transcripts
create policy "Users can view their own transcripts"
  on public.transcripts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transcripts"
  on public.transcripts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transcripts"
  on public.transcripts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transcripts"
  on public.transcripts for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists transcripts_user_id_idx on public.transcripts(user_id);
create index if not exists transcripts_created_at_idx on public.transcripts(created_at desc);
