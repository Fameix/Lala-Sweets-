# Master Bakery frontend

Production-oriented Next.js App Router build for Master Bakery, Sivagangai, Tamil Nadu.

## AI customer experience

The app includes safe fallback implementations for cake serving calculation, Master AI Assistant, custom cake requirement summaries, and Tamil/English voice transcript review.

Useful routes:

- `/cake-serving-calculator`
- `/ai-assistant`
- `/custom-cake`
- `/admin/settings/cake-serving-rules`
- `/admin/ai-settings`

Optional AI provider variables are documented in `.env.example`; the app builds and runs without them.

## Setup

```bash
pnpm install
pnpm dev
```

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Design System

- shadcn preset: `b1iABXArHn`
- style: `base-maia`
- icon library: `lucide`
- component base: `@base-ui/react`
- audit: `docs/DESIGN_SYSTEM_AUDIT.md`

## Environment

Create local variables from `.env.example`. Do not commit real secrets.

Admin routes fail closed unless `ADMIN_PREVIEW_ENABLED=true` is set for local preview.

## Supabase

Initial schema is in `db/migrations/0001_initial_schema.sql`. It includes catalogue, cart, order, payment, custom cake, admin content, and audit-log tables with initial RLS policies.

## Razorpay

Razorpay packages are installed, but payment confirmation is not active until server-side order creation, signature verification, and webhook idempotency are implemented.

## Menu Import

Extracted products live in `data/master-bakery-menu.json`. Missing prices are represented as `null`, never zero, and all extracted items are currently non-orderable.
