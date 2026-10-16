with demo_rows(marker, email, slug, pickup_date, return_date, branch, status, contact_phone, created_at) as (
  values
    ('DEMO-BOOKING-01', 'days2.two@gmail.com', 'pearl-halter-gown', '2026-10-18'::date, '2026-10-19'::date, 'หาดใหญ่ สงขลา', 'pending', '0810000001', '2026-10-01 09:15:00+07'::timestamptz),
    ('DEMO-BOOKING-02', 'guyttzx@gmail.com', 'midnight-satin-bow', '2026-10-20'::date, '2026-10-22'::date, 'จัดส่งถึงบ้าน', 'pending', '0810000002', '2026-10-02 10:20:00+07'::timestamptz),
    ('DEMO-BOOKING-03', 'days2.two@gmail.com', 'cobalt-one-shoulder', '2026-10-24'::date, '2026-10-25'::date, 'หาดใหญ่ สงขลา', 'pending', '0810000003', '2026-10-03 11:05:00+07'::timestamptz),
    ('DEMO-BOOKING-04', 'guyttzx@gmail.com', 'terracotta-wrap', '2026-10-28'::date, '2026-10-29'::date, 'จัดส่งถึงบ้าน', 'pending', '0810000004', '2026-10-04 13:10:00+07'::timestamptz),
    ('DEMO-BOOKING-05', 'days2.two@gmail.com', 'champagne-feather', '2026-11-01'::date, '2026-11-03'::date, 'หาดใหญ่ สงขลา', 'pending', '0810000005', '2026-10-05 14:30:00+07'::timestamptz),
    ('DEMO-BOOKING-06', 'guyttzx@gmail.com', 'sage-midi', '2026-11-05'::date, '2026-11-06'::date, 'จัดส่งถึงบ้าน', 'pending', '0810000006', '2026-10-06 15:25:00+07'::timestamptz),
    ('DEMO-BOOKING-07', 'days2.two@gmail.com', 'ivory-blazer-dress', '2026-11-08'::date, '2026-11-10'::date, 'หาดใหญ่ สงขลา', 'pending', '0810000007', '2026-10-07 16:40:00+07'::timestamptz),
    ('DEMO-BOOKING-08', 'guyttzx@gmail.com', 'burgundy-pleated', '2026-11-12'::date, '2026-11-13'::date, 'จัดส่งถึงบ้าน', 'pending', '0810000008', '2026-10-08 09:50:00+07'::timestamptz),
    ('DEMO-BOOKING-09', 'days2.two@gmail.com', 'rose-satin-slip', '2026-10-19'::date, '2026-10-20'::date, 'หาดใหญ่ สงขลา', 'confirmed', '0810000009', '2026-10-09 10:15:00+07'::timestamptz),
    ('DEMO-BOOKING-10', 'guyttzx@gmail.com', 'black-sequin-midi', '2026-10-23'::date, '2026-10-25'::date, 'จัดส่งถึงบ้าน', 'confirmed', '0810000010', '2026-10-10 11:20:00+07'::timestamptz),
    ('DEMO-BOOKING-11', 'days2.two@gmail.com', 'lilac-drape', '2026-10-27'::date, '2026-10-28'::date, 'หาดใหญ่ สงขลา', 'confirmed', '0810000011', '2026-10-11 12:05:00+07'::timestamptz),
    ('DEMO-BOOKING-12', 'guyttzx@gmail.com', 'emerald-feather', '2026-11-02'::date, '2026-11-03'::date, 'จัดส่งถึงบ้าน', 'confirmed', '0810000012', '2026-10-12 13:30:00+07'::timestamptz),
    ('DEMO-BOOKING-13', 'days2.two@gmail.com', 'navy-taffeta', '2026-11-07'::date, '2026-11-08'::date, 'หาดใหญ่ สงขลา', 'confirmed', '0810000013', '2026-10-13 14:10:00+07'::timestamptz),
    ('DEMO-BOOKING-14', 'guyttzx@gmail.com', 'coral-bow', '2026-11-15'::date, '2026-11-17'::date, 'จัดส่งถึงบ้าน', 'confirmed', '0810000014', '2026-10-14 15:05:00+07'::timestamptz),
    ('DEMO-BOOKING-15', 'days2.two@gmail.com', 'pearl-lace-midi', '2026-11-20'::date, '2026-11-21'::date, 'หาดใหญ่ สงขลา', 'confirmed', '0810000015', '2026-10-15 16:20:00+07'::timestamptz),
    ('DEMO-BOOKING-16', 'guyttzx@gmail.com', 'mocha-tailored-set', '2026-10-17'::date, '2026-10-18'::date, 'จัดส่งถึงบ้าน', 'ready', '0810000016', '2026-09-25 09:15:00+07'::timestamptz),
    ('DEMO-BOOKING-17', 'days2.two@gmail.com', 'silver-halter', '2026-10-18'::date, '2026-10-19'::date, 'หาดใหญ่ สงขลา', 'ready', '0810000017', '2026-09-26 10:40:00+07'::timestamptz),
    ('DEMO-BOOKING-18', 'guyttzx@gmail.com', 'teal-mermaid', '2026-10-21'::date, '2026-10-22'::date, 'จัดส่งถึงบ้าน', 'ready', '0810000018', '2026-09-27 11:25:00+07'::timestamptz),
    ('DEMO-BOOKING-19', 'days2.two@gmail.com', 'blush-cape', '2026-10-26'::date, '2026-10-28'::date, 'หาดใหญ่ สงขลา', 'ready', '0810000019', '2026-09-28 13:15:00+07'::timestamptz),
    ('DEMO-BOOKING-20', 'guyttzx@gmail.com', 'gold-pleat', '2026-11-03'::date, '2026-11-05'::date, 'จัดส่งถึงบ้าน', 'ready', '0810000020', '2026-09-29 14:05:00+07'::timestamptz),
    ('DEMO-BOOKING-21', 'days2.two@gmail.com', 'moss-satin', '2026-10-01'::date, '2026-10-02'::date, 'หาดใหญ่ สงขลา', 'returned', '0810000021', '2026-09-15 09:35:00+07'::timestamptz),
    ('DEMO-BOOKING-22', 'guyttzx@gmail.com', 'red-velvet-midi', '2026-10-04'::date, '2026-10-05'::date, 'จัดส่งถึงบ้าน', 'returned', '0810000022', '2026-09-16 10:50:00+07'::timestamptz),
    ('DEMO-BOOKING-23', 'days2.two@gmail.com', 'sky-blue-ruffle', '2026-10-07'::date, '2026-10-08'::date, 'หาดใหญ่ สงขลา', 'returned', '0810000023', '2026-09-17 12:20:00+07'::timestamptz),
    ('DEMO-BOOKING-24', 'guyttzx@gmail.com', 'black-corset-gown', '2026-10-10'::date, '2026-10-12'::date, 'จัดส่งถึงบ้าน', 'returned', '0810000024', '2026-09-18 13:45:00+07'::timestamptz),
    ('DEMO-BOOKING-25', 'days2.two@gmail.com', 'floral-chiffon', '2026-10-13'::date, '2026-10-14'::date, 'หาดใหญ่ สงขลา', 'cancelled', '0810000025', '2026-09-19 15:10:00+07'::timestamptz)
)
insert into public.bookings (user_id, dress_id, pickup_date, return_date, branch, contact_phone, note, status, created_at)
select
  p.id,
  d.id,
  r.pickup_date,
  r.return_date,
  r.branch,
  r.contact_phone,
  r.marker,
  r.status::public.booking_status,
  r.created_at
from demo_rows r
join public.profiles p on lower(p.email) = lower(r.email)
join public.dresses d on d.slug = r.slug
where not exists (
  select 1 from public.bookings existing where existing.note = r.marker
);
