# Thawinee admin dashboard

## Scope

Add a protected `/admin` surface for rental operations without changing the customer catalog flow.

## Frontend

- Desktop sidebar with Overview, Bookings, and Catalog views.
- Summary cards for bookings, pending work, confirmed work, and expected revenue.
- Recent booking table with status filtering and status updates.
- Inventory snapshot using the existing catalog data when the database is not seeded.
- Responsive layout that collapses to a top bar on narrow screens.

## Data and security

- The browser checks the authenticated user's `profiles.role` through Supabase before rendering the dashboard.
- RLS remains the authority for reading and updating bookings; the client never grants itself admin access.
- Local-only `?preview=1` is available during Vite development for visual QA and is disabled in production builds.
- If the schema or seed data is unavailable, the dashboard clearly labels demo data instead of presenting it as live data.

## Dress creation

- Admins can open an add-dress dialog with name, designer, rental price, occasion, sizes, color, image URL, and description.
- Preview mode adds the item in local state; an authenticated Admin inserts it into `public.dresses` through the Supabase client.
- Client validation prevents empty names/designers, non-positive prices, and submissions without a size. Database constraints and RLS remain the server-side authority.
