-- Razhaye Aseman: tables, access rules and storage buckets.
-- Paste the whole file into the Supabase SQL Editor and run it once.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table public.courses (
  id bigint generated always as identity primary key,
  title text not null,
  level text not null,
  price integer not null check (price >= 0), -- toman
  summary text not null,
  features text[] not null default '{}',
  banner_path text,  -- file in the course-public bucket
  teaser_path text,  -- file in the course-public bucket
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  position integer not null default 0,
  chapter text not null default '',
  title text not null,
  description text not null default '',
  minutes integer not null default 0,
  video_path text,  -- files in the course-private bucket: <course id>/<session id>/...
  pdf_path text,
  audio_path text
);
create index sessions_course_idx on public.sessions (course_id, position);

create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id),
  amount integer not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  authority text unique,
  ref_id text,
  coupon_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_user_idx on public.orders (user_id);

create table public.order_items (
  order_id bigint not null references public.orders (id) on delete cascade,
  course_id bigint not null references public.courses (id),
  price integer not null,
  primary key (order_id, course_id)
);

create table public.enrollments (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id bigint not null references public.courses (id) on delete cascade,
  order_id bigint references public.orders (id),
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- a row means the student finished that session
create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id bigint not null references public.sessions (id) on delete cascade,
  primary key (user_id, session_id)
);

create table public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  body text not null check (char_length(body) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);
create index reviews_status_idx on public.reviews (status);

create table public.coupons (
  code text primary key,
  percent integer not null check (percent between 1 and 100),
  active boolean not null default true,
  expires_at timestamptz
);

create table public.subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (email ~* '^\S+@\S+\.\S+$'),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.owns_course(target text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments
    where user_id = (select auth.uid()) and course_id::text = target
  );
$$;

grant execute on function public.is_admin(), public.owns_course(text) to anon, authenticated;

-- every new sign-up gets a profile row
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: own row, admins see everyone. Students can only edit name and phone;
-- the role column can only be changed from the SQL editor.
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create policy "read own profile or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- courses: published ones are public, admins manage everything
grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;

create policy "read published courses" on public.courses
  for select to anon, authenticated
  using (published or (select public.is_admin()));

create policy "admin inserts courses" on public.courses
  for insert to authenticated with check ((select public.is_admin()));

create policy "admin updates courses" on public.courses
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin deletes courses" on public.courses
  for delete to authenticated using ((select public.is_admin()));

-- sessions: visible when their course is
grant select on public.sessions to anon, authenticated;
grant insert, update, delete on public.sessions to authenticated;

create policy "read sessions of visible courses" on public.sessions
  for select to anon, authenticated
  using (exists (
    select 1 from public.courses c
    where c.id = course_id and (c.published or (select public.is_admin()))
  ));

create policy "admin inserts sessions" on public.sessions
  for insert to authenticated with check ((select public.is_admin()));

create policy "admin updates sessions" on public.sessions
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin deletes sessions" on public.sessions
  for delete to authenticated using ((select public.is_admin()));

-- orders, order items and enrollments: read-only for users. Only the server
-- (payment functions using the secret key) creates them.
grant select on public.orders, public.order_items, public.enrollments to authenticated;

create policy "read own orders" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "read own order items" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
  ));

create policy "read own enrollments" on public.enrollments
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- progress: each student manages their own
grant select, insert, delete on public.lesson_progress to authenticated;

create policy "read own progress" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));

create policy "add own progress" on public.lesson_progress
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "remove own progress" on public.lesson_progress
  for delete to authenticated using (user_id = (select auth.uid()));

-- reviews: everyone sees approved ones, students send pending ones, admins approve
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

create policy "read approved reviews" on public.reviews
  for select to anon, authenticated
  using (status = 'approved' or user_id = (select auth.uid()) or (select public.is_admin()));

create policy "send a review" on public.reviews
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

create policy "admin approves reviews" on public.reviews
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin deletes reviews" on public.reviews
  for delete to authenticated using ((select public.is_admin()));

-- coupons: only admins can see or edit them; the server checks them at payment time
grant select, insert, update, delete on public.coupons to authenticated;

create policy "admin manages coupons" on public.coupons
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- newsletter and contact form: anyone can send, only admins can read
grant insert on public.subscribers, public.contact_messages to anon, authenticated;
grant select, delete on public.subscribers, public.contact_messages to authenticated;

create policy "anyone subscribes" on public.subscribers
  for insert to anon, authenticated with check (true);

create policy "admin reads subscribers" on public.subscribers
  for select to authenticated using ((select public.is_admin()));

create policy "admin deletes subscribers" on public.subscribers
  for delete to authenticated using ((select public.is_admin()));

create policy "anyone sends a message" on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy "admin reads messages" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));

create policy "admin deletes messages" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));

-- the server side (secret key) needs explicit grants too
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Storage
-- course-public:  banners and teasers, anyone can view
-- course-private: session videos, PDFs and audio, path = <course id>/<session id>/<file>
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('course-public', 'course-public', true),
       ('course-private', 'course-private', false)
on conflict (id) do nothing;

create policy "anyone views public files" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'course-public');

create policy "admin manages public files" on storage.objects
  for all to authenticated
  using (bucket_id = 'course-public' and (select public.is_admin()))
  with check (bucket_id = 'course-public' and (select public.is_admin()));

create policy "admin manages private files" on storage.objects
  for all to authenticated
  using (bucket_id = 'course-private' and (select public.is_admin()))
  with check (bucket_id = 'course-private' and (select public.is_admin()));

create policy "students read purchased files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'course-private'
    and public.owns_course((storage.foldername(name))[1])
  );
