# Deployment

Before deployment:

1. Configure environment variables from `.env.example`.
2. Run Supabase migrations.
3. Configure Razorpay test credentials.
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build`.
5. Keep `ADMIN_PREVIEW_ENABLED` disabled in production unless replaced by Supabase role checks.
