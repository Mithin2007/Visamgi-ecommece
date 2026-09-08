# VISAMGI

Phase 1 foundation for a custom Next.js commerce platform. This repository currently contains the design system, application shell, authentic visual asset organization, and a production-oriented database schema. It deliberately does not claim live catalogue, checkout, payments, authentication, admin, or AI functionality before their backed services are implemented.

## Run locally

1. Copy `.env.example` to `.env.local` and configure a PostgreSQL connection.
2. Run `pnpm install`.
3. Run `pnpm db:generate`.
4. Run `pnpm dev`.

## Phase sequence

1. Foundation and data schema (current)
2. Authentication, admin access, catalogue and category CRUD
3. Storefront catalogue, search, filters, product pages and carts
4. Checkout, Tamil Nadu shipping validation, COD, Razorpay and webhooks
5. AI catalogue assistance, SEO, security hardening, testing and deployment
