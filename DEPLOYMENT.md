# Railway deployment

Deploy this repository as a Dockerfile-based Railway service. The root `Dockerfile` builds the Vite app and serves it with Nginx; the Nginx configuration listens on Railway's `PORT` and falls back to `index.html` for client-side routes.

## Variables

Set these as Docker build arguments in Railway so Vite can include them in the static app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Supabase anon key is public and intended for browser use. Never pass a Supabase service-role key or provider secret to this frontend image. Locally, copy `.env.example` to `.env` and set the same two values.

## Supabase setup

Set the Supabase Auth site URL and allowed redirect URLs to the deployed Railway domain. Confirm the database tables, row-level security policies, storage buckets, and realtime publication required by the app are configured in Supabase. Deploying the frontend does not create these backend resources.

### Password reset email

The app requests a recovery email through Supabase Auth and redirects back to `/reset-password` on the current site origin. In the Supabase dashboard, configure:

- **Authentication > URL Configuration:** set the Site URL to `https://www.alavarenautoelectrical.services` and allow `https://www.alavarenautoelectrical.services/reset-password`. Add the exact reset URL for any other hostname users can access, such as the apex domain or Railway domain.
- **Authentication > SMTP Settings:** configure a verified sender and production SMTP provider. Supabase's default email sender is rate-limited and intended for testing; it is not reliable for customer-facing delivery. Complete the provider's domain verification (SPF/DKIM) as required.
- **Authentication > Email Templates > Reset Password:** retain the Supabase confirmation URL (`{{ .ConfirmationURL }}`) in the reset link so the recovery token and redirect are preserved.

Never put SMTP passwords, provider API keys, or Supabase service-role keys in frontend variables or source control. The browser only needs the Supabase URL and anon key.

## Roboflow and SMS integrations

Call Roboflow and SMS providers from an authenticated Supabase Edge Function or another server-side service. Store their credentials as server-side secrets, validate authorization and request input in that service, and return only the result needed by the browser. Do not add provider credentials to `VITE_` variables or frontend source.

### Appointment SMS notifications

The `send-appointment-sms` Supabase Edge Function sends UNI SMS alerts after appointment approval, rejection, service start, service completion, and cancellation. It sends to the customer's appointment/profile phone and to admin users with a phone number in `users.phone`. Philippine phone numbers must be saved in `09...`, `9...`, or `+63...` format.

Deploy the function to the linked Supabase project with `supabase functions deploy send-appointment-sms`. In Supabase **Project Settings > Edge Functions > Secrets**, set `UNISMS_API_KEY` and `UNISMS_SENDER_ID` to your UNI SMS API secret and active sender ID. The standard Supabase function secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must also be available. Never put the UNI SMS key or service-role key in the frontend or Railway build variables.

The function validates the caller, role, and persisted appointment status before sending. Test each event with a real appointment, then review Supabase function logs and UNI SMS message history. Delivery requires sufficient UNI SMS credits, an active sender ID, and valid phone numbers for recipients. A default sender ID may not reach every carrier; use an approved sender ID for full network coverage.

## Local checks

```sh
npm ci
npm run build
npm run lint
```
