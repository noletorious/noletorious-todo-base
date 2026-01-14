-- Enable RLS on the Todo table
alter table public."Todo" enable row level security;

-- Policy: Users can view their own todos
create policy "Users can view their own todos"
on public."Todo"
for select
using (auth.uid()::text = "userId");

-- Policy: Users can insert their own todos
create policy "Users can insert their own todos"
on public."Todo"
for insert
with check (auth.uid()::text = "userId");

-- Policy: Users can update their own todos
create policy "Users can update their own todos"
on public."Todo"
for update
using (auth.uid()::text = "userId");

-- Policy: Users can delete their own todos
create policy "Users can delete their own todos"
on public."Todo"
for delete
using (auth.uid()::text = "userId");
