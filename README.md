# Alavaren Auto Electrical

Alavaren Auto Electrical is a React single-page application built with Vite. It
uses Supabase for authentication, database, storage, and an Edge Function for
vehicle eligibility checks.

## Run locally

1. Install Node.js 22 or newer.
2. Create a `.env` file in the project root with the Supabase project URL and
   public anon key:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

3. Install dependencies and start the development server:

   ```sh
   npm ci
   npm run dev
   ```

The Vite dev server prints the local URL. Never put a Supabase service-role key
in a `VITE_*` variable or in frontend code.

## Deploy the frontend to Railway

The root `Dockerfile` builds the Vite app and serves it with Nginx. Nginx uses
the Railway-provided `PORT` and falls back to `index.html` for React Router
paths, so direct visits to app routes work.

1. Push this project to a Git provider and create a Railway project from that
   repository. Railway should detect the root `Dockerfile`.
2. Add these variables to the Railway service, making them available during
   the Docker build:
   - `VITE_SUPABASE_URL`: the URL of the Supabase project.
   - `VITE_SUPABASE_ANON_KEY`: the public anon/publishable key for that project.
3. Deploy and check the build and deployment logs. The Docker build fails if
   either required frontend variable is missing.
4. In Supabase Dashboard → Authentication → URL Configuration, set the Site URL
   to the deployed site and add the Railway URL and final custom domain as
   allowed redirect URLs. Include the required callback paths used by enabled
   authentication providers.
5. In Railway, add the custom domain to the service. Copy the exact DNS records
   Railway provides into GoDaddy DNS. Do not guess the target or add conflicting
   records; wait for DNS propagation and Railway's TLS certificate status.

Only the Supabase anon/publishable key belongs in the frontend. Supabase
authorization policies (RLS) must protect exposed tables and storage; a
frontend key is not a substitute for access control.

## Deploy the vehicle-check Edge Function

The app invokes the `roboflow-vehicle-check` Supabase Edge Function. Deploy it
to the same Supabase project separately from Railway, using the Supabase CLI:

```sh
supabase functions deploy roboflow-vehicle-check --project-ref YOUR_PROJECT_REF
supabase secrets set ROBOFLOW_API_KEY=YOUR_ROBOFLOW_API_KEY --project-ref YOUR_PROJECT_REF
```

Keep the Roboflow API key and Supabase service-role key in Supabase's secret
store, not in Railway frontend variables, `.env` files committed to source
control, or browser code. Configure and test the function's required Supabase
secrets in the Supabase project before relying on vehicle checks.

## Build locally

```sh
npm run build
npm run preview
```
