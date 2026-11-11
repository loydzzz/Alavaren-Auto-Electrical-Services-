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

## Local checks

```sh
npm ci
npm run build
npm run lint
```
