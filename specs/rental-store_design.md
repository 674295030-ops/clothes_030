# Thawinee — Technical design

## Product goal

ช่วยให้ลูกค้าหาชุดสำหรับโอกาสสำคัญได้เร็ว เลือกชุดที่พร้อมเช่า ระบุวัน/สาขา และเริ่มจองโดยไม่ต้องคุยกับแอดมินก่อน

## Information architecture

- Public: header, campaign hero, category shortcuts, catalog/filter, booking tray, help/footer
- Authenticated user: profile chip, booking history (future route), chat assistant (Supabase Edge Function)
- Admin: protected operational queue, booking status updates, audit trail (future route)

## Visual direction

Editorial fashion commerce: true white canvas, thin rules, ink-black type, forest-green action color, serif display headline, restrained sans-serif UI. The image should do most of the emotional work; controls stay quiet and close to the catalog.

## Component tree

```txt
App
  Header
  Hero
  CategoryNav
  Catalog
    CatalogToolbar
    FilterRail
    ProductGrid
      ProductCard
    ProductDrawer
  BookingTray
  Footer
```

## Data and security

Browser only holds Supabase URL + publishable key. Roles live in `profiles.role`; user-owned bookings/chat rows use RLS. Booking creation is intended to move through a validated RPC so the server owns availability and overlap rules.

## Acceptance criteria

- Anonymous visitors can browse, filter, select a dress, choose a date and branch, but must sign in with Google before the booking confirmation action is available.
- Auth action is a single Google sign-in button; local demo mode remains usable without env variables.
- Layout works at desktop and mobile widths without horizontal overflow.
- No service-role/provider secrets ship to the browser.
