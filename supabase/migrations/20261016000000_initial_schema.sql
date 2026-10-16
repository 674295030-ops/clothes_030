create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'admin');
create type public.booking_status as enum ('pending', 'confirmed', 'ready', 'returned', 'cancelled');

create table if not exists public.admin_allowlist (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;

insert into public.admin_allowlist(email) values ('seree999@gmail.com') on conflict do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dresses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  designer text not null,
  price_per_day integer not null check (price_per_day > 0),
  occasion text not null,
  sizes text[] not null default '{}',
  color_name text not null,
  color_hex text not null,
  image_url text not null,
  available boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dress_id uuid not null references public.dresses(id),
  pickup_date date not null,
  return_date date not null,
  branch text not null,
  contact_phone text,
  note text,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint bookings_valid_dates check (return_date >= pickup_date)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, role)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case when exists (select 1 from public.admin_allowlist where email = lower(coalesce(new.email, ''))) then 'admin'::public.app_role else 'user'::public.app_role end
  ) on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_before_update on public.profiles;
create trigger protect_profile_role_before_update before update on public.profiles for each row execute procedure public.protect_profile_role();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.dresses enable row level security;
alter table public.bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles are visible to their owner" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles can update their display fields" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "active dresses are public" on public.dresses for select using (available = true or public.is_admin());
create policy "admins manage dresses" on public.dresses for all using (public.is_admin()) with check (public.is_admin());
create policy "owners read bookings" on public.bookings for select using (user_id = auth.uid() or public.is_admin());
create policy "owners create bookings" on public.bookings for insert with check (user_id = auth.uid());
create policy "owners cancel bookings" on public.bookings for update using (user_id = auth.uid() and status in ('pending', 'confirmed')) with check (user_id = auth.uid());
create policy "admins manage bookings" on public.bookings for update using (public.is_admin()) with check (public.is_admin());
create policy "users read notifications" on public.notifications for select using (user_id = auth.uid());
create policy "users update notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read audit logs" on public.admin_audit_logs for select using (public.is_admin());
create policy "owners read conversations" on public.chat_conversations for select using (user_id = auth.uid());
create policy "owners create conversations" on public.chat_conversations for insert with check (user_id = auth.uid());
create policy "owners read messages" on public.chat_messages for select using (user_id = auth.uid());
create policy "owners create messages" on public.chat_messages for insert with check (user_id = auth.uid());

create index if not exists bookings_user_created_idx on public.bookings(user_id, created_at desc);
create index if not exists bookings_dates_status_idx on public.bookings(pickup_date, return_date, status);
create index if not exists messages_conversation_created_idx on public.chat_messages(conversation_id, created_at);
