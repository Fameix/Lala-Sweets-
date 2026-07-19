# Database

Initial migration: `db/migrations/0001_initial_schema.sql`.

The schema includes profiles, roles, addresses, branches, catalogue, variants, options, inventory, carts, favourites, delivery zones, slots, coupons, orders, payments, refunds, custom cake requests, reviews, banners, announcements, occasions, settings, notification logs, and audit logs.

RLS starts with customer-owned data policies and must be expanded with role-aware admin policies before production.
