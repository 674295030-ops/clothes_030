create or replace function public.check_dress_availability(
  p_dress_id uuid,
  p_pickup_date date,
  p_return_date date
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_dress_id is null or p_pickup_date is null or p_return_date is null or p_return_date < p_pickup_date then
    return false;
  end if;

  return exists (
    select 1
    from public.dresses d
    where d.id = p_dress_id
      and d.available = true
  ) and not exists (
    select 1
    from public.bookings b
    where b.dress_id = p_dress_id
      and b.status in ('pending', 'confirmed', 'ready')
      and b.pickup_date <= p_return_date
      and b.return_date >= p_pickup_date
  );
end;
$$;

create or replace function public.create_booking(
  p_dress_id uuid,
  p_pickup_date date,
  p_return_date date,
  p_branch text,
  p_contact_phone text,
  p_note text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.bookings;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_dress_id is null or p_pickup_date is null or p_return_date is null or p_return_date < p_pickup_date then
    raise exception 'INVALID_DATES';
  end if;

  if p_pickup_date < current_date then
    raise exception 'PAST_DATE';
  end if;

  if p_branch is null or p_branch not in ('สาขาหาดใหญ่ จังหวัดสงขลา', 'จัดส่งถึงบ้าน') then
    raise exception 'INVALID_BRANCH';
  end if;

  if p_contact_phone is null or p_contact_phone !~ '^[0-9+() -]{8,20}$' then
    raise exception 'INVALID_PHONE';
  end if;

  if length(coalesce(p_note, '')) > 500 then
    raise exception 'NOTE_TOO_LONG';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_dress_id::text, 0));

  if not public.check_dress_availability(p_dress_id, p_pickup_date, p_return_date) then
    raise exception 'DRESS_UNAVAILABLE';
  end if;

  insert into public.bookings (user_id, dress_id, pickup_date, return_date, branch, contact_phone, note)
  values (auth.uid(), p_dress_id, p_pickup_date, p_return_date, p_branch, trim(p_contact_phone), nullif(trim(p_note), ''))
  returning * into result;

  return result;
end;
$$;

revoke all on function public.check_dress_availability(uuid, date, date) from public;
grant execute on function public.check_dress_availability(uuid, date, date) to authenticated;
revoke all on function public.create_booking(uuid, date, date, text, text, text) from public;
grant execute on function public.create_booking(uuid, date, date, text, text, text) to authenticated;
