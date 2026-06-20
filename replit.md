# ShipFast

A global shipping and logistics platform: a public site for tracking parcels, requesting quotes, and browsing services, plus an operations portal for managing shipments, customers, quotes, invoices, and routes. Customers are notified by email and SMS at every status change.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/shipfast run dev` — run the web app (needs `PORT` and `BASE_PATH`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

### Required environment

- `DATABASE_URL` — Postgres connection string
- Web build/dev: `PORT`, `BASE_PATH` (e.g. `/`)
- Notifications (optional — falls back to console logging if unset):
  - `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM` — email via Resend
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` — SMS via Twilio
  - `PUBLIC_BASE_URL` — used to build tracking links in messages
- Pricing (optional): `FUEL_SURCHARGE_PCT` (default 16)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5; DB: PostgreSQL + Drizzle ORM; Validation: Zod + drizzle-zod
- API codegen: Orval (from OpenAPI spec); API build: esbuild
- Web: React 19 + Vite 7 + Tailwind v4 + shadcn/ui + wouter + TanStack Query

## Where things live

- DB schema (source of truth): `lib/db/src/schema/*`
- API contract: `lib/api-zod/src/generated` (from `lib/api-spec/openapi.yaml`); hand-written request types in `lib/api-zod/src/params.ts`
- Status-change pipeline: `artifacts/api-server/src/services/shipmentStatus.ts`
- Notifications engine: `artifacts/api-server/src/lib/notifications/*`
- Rate engine: `artifacts/api-server/src/services/rateEngine.ts`
- Web theme tokens + fonts: `artifacts/shipfast/src/index.css`, `artifacts/shipfast/index.html`
- Shared status presentation: `artifacts/shipfast/src/lib/status.ts`

## Architecture decisions

- All shipment status transitions go through `applyStatusChange` so notifications fire identically whether triggered by a status PATCH, a tracking event, a cancellation, or shipment creation.
- Notifications never throw — a delivery failure is logged and audited but never rolls back a status update. Every dispatch is recorded in `notification_deliveries`.
- The rate engine is pure/deterministic (dimensional weight, zone multiplier, fuel surcharge) and unit-tested without a database.
- `api-server` declares `zod` directly; request types are hand-written in `api-zod/params.ts` because `z.coerce.*` output types do not materialize across the package boundary.

## Product

- Public: home with live tracking, real-time package tracking, instant quotes, service catalogue.
- Portal: dashboard, shipments (list + detail + create), customers, quotes, invoices, routes, alerts.
- Automatic email + SMS + in-app notifications to sender and recipient on every status change.

## Design system

- Identity: maritime ink navy (`--primary`) + cargo-signal amber (`--accent`) on paper neutrals; sea-green for delivered/positive states.
- Type: Archivo (display), Inter (body), Space Mono (waybill/data codes).
- Signature: "live waybill" treatment — monospace tracking codes, animated origin→destination route line. Headings use Archivo via a base-layer rule.

## Gotchas

- After changing lib types, delete stale `*.tsbuildinfo` and `lib/*/dist` if the typecheck reports phantom errors.
- The web `vite.config.ts` requires `PORT` and `BASE_PATH`; builds fail without them.
