-- Trigger to automatically create a public.User entry when a new auth.users entry is created

-- 1. Create the function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."User" (id, email, "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    now(),
    now()
  );
  return new;
end;
$$;

-- 2. Create the trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
