alter table public.profiles
  add column if not exists phone text;

create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role = old.role;
    new.email = old.email;
    new.avatar_url = old.avatar_url;
  end if;
  return new;
end;
$$;
