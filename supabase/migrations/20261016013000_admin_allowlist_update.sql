insert into public.admin_allowlist (email)
values
  ('674295030@parichat.skru.ac.th'),
  ('seree999@gmail.com')
on conflict (email) do nothing;

update public.profiles
set role = 'admin', updated_at = now()
where lower(email) in ('674295030@parichat.skru.ac.th', 'seree999@gmail.com');
