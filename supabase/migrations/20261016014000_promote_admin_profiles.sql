alter table public.profiles disable trigger protect_profile_role_before_update;

update public.profiles
set role = 'admin', updated_at = now()
where lower(email) in ('674295030@parichat.skru.ac.th', 'seree999@gmail.com');

alter table public.profiles enable trigger protect_profile_role_before_update;
