-- Auth: give each task an owner and lock the table down per-user.
-- Run this in the Supabase SQL Editor (or via apply_migration) once.

-- 1) Ownership column, defaulting to the current authenticated user on insert
alter table public.tasks
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.tasks
  alter column user_id set default auth.uid();

create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- 2) Swap the old public (single-list) policies for per-user policies
drop policy if exists "Public can read tasks"   on public.tasks;
drop policy if exists "Public can insert tasks" on public.tasks;
drop policy if exists "Public can update tasks" on public.tasks;
drop policy if exists "Public can delete tasks" on public.tasks;

create policy "Users read own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users update own tasks" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- NOTE: the existing demo tasks have a NULL user_id and will be hidden under the
-- new policies. To claim them for the first account you create, run (once):
--   update public.tasks set user_id = '<your-user-uuid>' where user_id is null;
-- or delete them:
--   delete from public.tasks where user_id is null;
