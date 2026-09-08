# VISAMGI

Phase 2 includes an administrator console, Prisma-backed category/product/inventory operations, server-side authorization, bcrypt password checks, and opaque httpOnly database sessions. No production credentials or business data are included.

## Run locally

1. Copy `.env.example` to `.env.local` and configure a PostgreSQL connection.
2. Set a long `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` for local provisioning (the provisioning command is intentionally not automatic).
3. Run `pnpm install`, `pnpm db:generate`, and `pnpm db:migrate`.
4. Create the first administrator through a controlled local script/service, then run `pnpm dev`.

## Phase sequence

1. Foundation and data schema
2. Authentication, admin access, catalogue and category CRUD (current)
3. Storefront catalogue, search, filters, product pages and carts
4. Checkout, Tamil Nadu shipping validation, COD, Razorpay and webhooks
5. AI catalogue assistance, SEO, security hardening, testing and deployment
