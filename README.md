# Sri Lakshmivilas Purathana Lala Sweets frontend

Production-oriented Next.js App Router build for Sri Lakshmivilas Purathana Lala Sweets, Vannarpettai, Tirunelveli, Tamil Nadu.

## AI customer experience

The app preserves the original storefront architecture while the public website is positioned around authentic Tirunelveli ghee halwa, traditional sweets, savouries, legacy content, and enquiry-led conversion.

Useful routes:

- `/`
- `/about`
- `/menu`
- `/category/sweets`
- `/category/savouries`
- `/contact`

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

Verified public products live in `data/lala-sweets-menu.json`. Missing prices are represented as `null`, never zero, and online checkout remains inactive until current price, pack size and fulfilment details are confirmed by the business.
