# Railway deployment

Deploy this repository as a Dockerfile-based Railway service. The root `Dockerfile` builds the Vite app and serves it with Nginx; the Nginx configuration listens on Railway's `PORT` and falls back to `index.html` for client-side routes.

## Variables

Set these as Docker build arguments in Railway so Vite can include them in the static app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Supabase anon key is public and intended for browser use. Never pass a Supabase service-role key or provider secret to this frontend image. Locally, copy `.env.example` to `.env` and set the same two values.

## Supabase setup

Set the Supabase Auth site URL and allowed redirect URLs to the deployed Railway domain. Confirm the database tables, row-level security policies, storage buckets, and realtime publication required by the app are configured in Supabase. Deploying the frontend does not create these backend resources.

## Roboflow and SMS integrations

Call Roboflow and SMS providers from an authenticated Supabase Edge Function or another server-side service. Store their credentials as server-side secrets, validate authorization and request input in that service, and return only the result needed by the browser. Do not add provider credentials to `VITE_` variables or frontend source.

## Local checks

```sh
npm ci
npm run build
npm run lint
```
