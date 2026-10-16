# Vela Rental — Complete rental operations

## Requirements

- While a customer is viewing a dress, when they choose pickup and return dates, the system shall validate the date range before allowing a booking request.
- While a customer is authenticated, when they submit a booking, the system shall persist it through a server-side RPC that rejects overlapping active bookings.
- While a customer is authenticated, when they open the account area, the system shall show their bookings and allow cancellation only for pending or confirmed requests.
- While an admin is authenticated, when they open bookings, the system shall support search, status filtering, CSV export, and status updates.
- While an admin edits the catalog, the system shall support toggling a dress as available or unavailable without deleting its history.
- When the chatbot receives a question, it shall use only the Vela catalog and rental information supplied by the server context.

## Architecture

### Frontend

- Keep the existing Vela editorial storefront and componentized Admin surface.
- Add a live catalog loader with mock fallback.
- Replace preset booking strings with ISO date inputs, availability state, phone validation, and a real submit state.
- Add customer bookings section and rental-information section.
- Add Admin booking search/export and catalog availability toggle.

### Backend

- Add a migration with `check_dress_availability` and `create_booking` security-definer RPCs.
- Enforce authenticated ownership through `auth.uid()` and overlap checks for pending/confirmed/ready bookings.
- Keep RLS as the authority for user-owned records and admin updates.
- Pass a bounded catalog context and conversation history to Gemini in the `chat` Edge Function.

### Security

- No service-role key or Gemini key in the browser.
- Validate UUIDs, dates, branch, phone, and message lengths at the server boundary.
- Check authorization inside RPCs and the Edge Function.
- Use parameterized Supabase queries and never trust client-side availability checks.
- Do not expose provider errors or secrets to users; log only safe server diagnostics.

## Implementation plan

- [ ] Add migration and booking RPCs.
- [ ] Add shared catalog/date helpers and live catalog loading.
- [ ] Implement customer booking submit, availability, history, and cancellation.
- [ ] Improve product detail and rental information UI.
- [ ] Improve Admin search, export, and availability controls.
- [ ] Update Gemini context and fallback responses.
- [ ] Run typecheck, build, and Playwright desktop/mobile flows.
