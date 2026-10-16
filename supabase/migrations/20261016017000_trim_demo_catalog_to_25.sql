delete from public.dresses
where slug in ('plum-satin-cowl', 'linen-cream-coord', 'sapphire-drape-gown')
  and not exists (
    select 1
    from public.bookings
    where bookings.dress_id = dresses.id
  );
