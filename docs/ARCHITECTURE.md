# Architecture

- Next.js App Router with Server Components by default
- shadcn preset `b1iABXArHn` for all UI
- Extracted menu JSON as the temporary catalogue source
- Supabase Postgres target schema in `db/migrations`
- Admin routes are server-gated by `ADMIN_PREVIEW_ENABLED` until Supabase roles are connected
- Money is stored as integer paise
- Missing prices remain `null`
