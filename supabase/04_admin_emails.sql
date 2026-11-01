-- Admin access by email.
-- Anyone signed in with an email listed in admin_emails counts as an admin.
-- Add or remove emails from the Table Editor (or with plain insert / delete statements).

create table public.admin_emails (
  email text primary key check (email = lower(email))
);

-- No policies and no grants for site visitors: the list can only be read by the
-- database owner and by is_admin() below.
alter table public.admin_emails enable row level security;
grant select on public.admin_emails to service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_emails
    where email = lower((select auth.jwt() ->> 'email'))
  );
$$;

-- the old role column is no longer used
alter table public.profiles drop column role;
