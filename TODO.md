# TODO

A running list of gaps, incomplete work, and planned additions. Each item is labeled **H** (high), **M** (medium), or **L** (low) priority and ordered within each section accordingly.

---

## Stubs to Implement

Almost every module is an empty file. The sections below list what each stub needs.

### `api/aws`
- [ ] **H** DynamoDB client — `GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Query`, `Scan`
- [ ] **H** DynamoDB batch ops — `BatchGetItem`, `BatchWriteItem` with retry on unprocessed items
- [ ] **H** DynamoDB transactions — `TransactGetItems`, `TransactWriteItems`
- [ ] **H** S3 client — `GetObject`, `PutObject`, `DeleteObject`, streaming get (avoid loading full object into memory)
- [ ] **H** S3 pre-signed URLs — `getSignedUrl` for GET and PUT
- [ ] **H** Secrets Manager — `getSecret`, `getSecrets`; distinguish "not found" from other errors
- [ ] **M** DynamoDB conditional expression helpers beyond raw `ConditionExpression` strings
- [ ] **M** S3 `HeadObject`, `ListObjectsV2`, multipart upload (>5 GB)
- [ ] **M** SQS — send, receive, delete; DLQ support
- [ ] **M** SES — transactional email (templated + raw)
- [ ] **L** ElastiCache (Redis) — get/set/del, configurable timeouts, bulk `MGET`/`MSET`
- [ ] **L** SNS — topic publish helper
- [ ] **L** S3 bucket operations (create, delete, list)

### `api/config`
- [ ] **H** Environment variable loading with typed accessors (string, number, boolean, required vs optional)
- [ ] **H** Required variable validation at startup — fail fast with a clear error listing all missing vars
- [ ] **M** File-based config loading (`.env`, JSON, YAML)
- [ ] **M** Multi-environment profile support (`dev` / `staging` / `prod`)
- [ ] **L** Config change notification / listener hooks

### `api/db`
- [ ] **H** PostgreSQL client wrapper — connection pool, typed query helpers
- [ ] **H** Transaction support
- [ ] **M** Query builder helpers (select, insert, update, delete)
- [ ] **M** Migration runner integration (e.g. `node-pg-migrate` or `drizzle`)
- [ ] **L** Connection health check / readiness probe

### `api/logging/runtime`
> **Next implementation priority** — implement after `shared/utils`, `api/config`, `shared/crypto`, and `adapters/base` are in place.

- [ ] **H** Structured JSON logger — `info`, `warn`, `error`, `debug` with consistent field names
- [ ] **H** Request ID / correlation ID injection into log context
- [ ] **M** Log level configuration via env var (`LOG_LEVEL`)
- [ ] **M** Child logger with bound fields (e.g. per-request logger with `requestId`, `userId`)
- [ ] **L** Log redaction — strip sensitive fields (tokens, passwords, card numbers) before output

### `api/logging/security`
- [ ] **H** Security event logging — auth failures, permission denials, suspicious patterns
- [ ] **M** Structured audit log format (actor, action, resource, outcome, timestamp)
- [ ] **L** SIEM-compatible output format

### `api/logging/telemetry`
- [ ] **H** OpenTelemetry SDK initialization — traces + metrics
- [ ] **H** HTTP request span instrumentation (method, route, status, latency)
- [ ] **M** AWS SDK span instrumentation
- [ ] **M** Custom metric helpers (`counter`, `histogram`, `gauge`)
- [ ] **L** Datadog exporter configuration

### `api/middleware`
- [ ] **H** CORS middleware — configurable allowed origins, methods, headers; preflight (`OPTIONS`) handling
- [ ] **H** CSRF middleware — double-submit cookie pattern; token generation and validation
- [ ] **H** Request ID middleware — generate and attach `X-Request-ID` to each request and response
- [ ] **H** Rate limiting middleware — token bucket or sliding window; configurable per-route
- [ ] **H** Auth/JWT middleware — verify and decode token; attach claims to request context
- [ ] **M** Idempotency middleware — cache response by `Idempotency-Key` header; Redis-backed
- [ ] **M** Body sanitization middleware — strip XSS, validate `Content-Type`, enforce `Content-Length`
- [ ] **M** Request logging middleware — structured log per request (method, path, status, duration)
- [ ] **L** Helmet-style security headers middleware (`X-Frame-Options`, `HSTS`, `CSP`, etc.)

### `api/observability`
- [ ] **H** Health check endpoint handler — liveness (`/health`) and readiness (`/ready`) probes
- [ ] **H** Metrics endpoint — Prometheus-compatible `/metrics` scrape endpoint
- [ ] **M** Graceful shutdown helper — drain in-flight requests before `process.exit`
- [ ] **M** Uptime and memory usage metrics
- [ ] **L** Circuit breaker primitive for outbound calls

### `client/http`
- [ ] **H** Typed `fetch` wrapper — base URL config, default headers, request/response interceptors
- [ ] **H** `ApiError` class — status code, machine-readable error code, human message; thrown by all fetch wrappers so callers have one error type to handle
- [ ] **H** Auth token injection — read token from storage and attach as `Authorization: Bearer`
- [ ] **M** Automatic retry with exponential backoff on 429 / 5xx
- [ ] **M** Request cancellation via `AbortController` / `AbortSignal`
- [ ] **M** Multipart / form-data request builder
- [ ] **L** Request deduplication — in-flight cache to prevent duplicate concurrent GET requests

### `adapters/base`

> A `BaseAdapter` class shared by all six adapters — eliminates duplicated fetch logic across
> `auth`, `entitlements`, `events`, `feature-flags`, `payments`, and `user`.

- [ ] **H** `BaseAdapter` class — constructor takes `{ baseURL, serviceToken? }`; provides `get`, `post`, `put`, `patch`, `delete` methods returning typed responses
- [ ] **H** Service-to-service auth — attaches the caller's own JWT as `Authorization: Bearer` on outbound requests (M2M pattern used across all adapters)
- [ ] **H** Error normalization — converts non-2xx responses into a typed `AdapterError` (status, code, message) consistent across all adapters
- [ ] **M** Automatic retry with exponential backoff on 429 / 503 — configurable max attempts via constructor option
- [ ] **M** Request timeout — configurable via constructor option; defaults to 10s
- [ ] **L** Request ID forwarding — reads `X-Request-ID` from an incoming request context and passes it to outbound adapter calls for distributed tracing

> All six `adapter.ts` files extend or compose `BaseAdapter` — they only define the API-specific
> method signatures and URL paths on top of it.

### `shared/crypto`

- [ ] **H** JWT sign and verify helpers (wrapping `jose` or `jsonwebtoken`)
- [ ] **H** AES-256-GCM encrypt / decrypt for sensitive fields
- [ ] **M** Token revocation / JTI blacklist check
- [ ] **M** PKCE code verifier and challenge generation (for OAuth PKCE flows)
- [ ] **L** Key pair generation helper (RSA / EC)

### `adapters/` — Generated models + hand-authored HTTP clients

> Each adapter folder contains two files: `models.ts` (auto-generated from the API's `openapi.yaml`
> via `openapi-typescript` — do not edit) and `adapter.ts` (hand-authored typed HTTP client that
> imports from its sibling `models.ts`). See the **Cross-Language Type Sharing** section for the
> generation workflow.

#### `adapters/auth` → source: `komodo-auth-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-auth-api` covering: `TokenRequest`, `TokenResponse`, `IntrospectResponse`, `ValidateResponse`, `RevokeRequest`, `JWK`, `JWKS`, `AuthAPIError`
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `AuthAdapter` class: `getToken`, `introspectToken`, `revokeToken`, `validateToken` (mirrors `komodo-auth-api/pkg/v1/client.go`)
- [ ] **M** OAuth authorization code flow types and helpers — add to spec when flow is implemented

#### `adapters/entitlements` → source: `komodo-entitlements-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-entitlements-api` covering: `Entitlement`, `EntitlementCheck`, `EntitlementPolicy`
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `EntitlementsAdapter` class: `checkEntitlement`, `listEntitlements`
- [ ] **M** `hasEntitlement(user, feature)` pure helper (no I/O) alongside the adapter
- [ ] **L** Entitlement inheritance / delegation types — add to spec as feature lands

#### `adapters/events` → source: `komodo-events-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-events-api` covering publish/subscribe shapes
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `EventsAdapter` class: `publish`, `subscribe`; wraps `api/aws` SQS/SNS or HTTP depending on transport
- [ ] **M** DLQ handling and retry policy helpers

#### `adapters/feature-flags` → source: `komodo-feature-flags-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-feature-flags-api` covering: `FeatureFlag`, `FlagVariant`, `FlagContext`
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `FeatureFlagsAdapter` class: `isEnabled`, `getVariant`, `getAllFlags`
- [ ] **M** `isEnabled(flag, context)` pure helper (no I/O, evaluates a pre-fetched flag set locally)
- [ ] **L** Remote flag config loader interface (LaunchDarkly, Unleash drop-in)

#### `adapters/payments` → source: `komodo-payments-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-payments-api` covering: `PaymentMethod`, `PaymentIntent`, `PaymentResult`, `Refund`
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `PaymentsAdapter` class: `createIntent`, `capturePayment`, `refund`
- [ ] **M** `Subscription`, `BillingCycle`, webhook event payload types — add to spec as features land
- [ ] **L** Tax calculation types

#### `adapters/user` → source: `komodo-user-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-user-api` covering: `User`, `UserProfile`, `Address`, `UserPreferences`
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `UserAdapter` class: `getUser`, `updateProfile`, `getAddress`
- [ ] **L** `UserDevice` type (push token, platform, last seen) — add to spec when push notifications land

### `shared/utils`

> Pure, environment-agnostic functions only — no DOM, no Node.js APIs, no framework assumptions.
> Safe to import in a Go-backed API handler, a Node.js service, or a browser context equally.

#### Validation
- [ ] **H** `isValidEmail(value)` — RFC 5322 compliant
- [ ] **H** `isValidPhone(value)` — E.164 format (`+15551234567`)
- [ ] **H** `isValidUUID(value)` / `isValidULID(value)`
- [ ] **M** `isValidURL(value)` — with optional allowed-protocol list
- [ ] **M** `isValidPostalCode(value, countryCode)` — US ZIP + international
- [ ] **M** `isValidPrice(value)` — positive, finite, max two decimal places
- [ ] **L** `isValidCreditCardFormat(value)` — Luhn check only; no processing — useful for client-side pre-validation before hitting `adapters/payments`

#### Formatting
- [ ] **H** `formatCurrency(cents, currency, locale?)` — `1099, 'USD'` → `'$10.99'`
- [ ] **H** `formatDate(isoString, format?)` — ISO 8601 → human-readable; relative (`'2 hours ago'`)
- [ ] **M** `formatPhone(value, countryCode?)` — raw digits → `(555) 123-4567` or E.164

#### Data Helpers
- [ ] **H** `omit<T>(obj, keys)` / `pick<T>(obj, keys)` — typed object slicing
- [ ] **H** `isDefined<T>(value)` / `isNonNullish<T>(value)` — typed guards replacing scattered `!= null` checks
- [ ] **H** `assertNever(value)` — exhaustive switch guard; throws at runtime with the unexpected value
- [ ] **H** Pagination — `buildCursorPage`, `buildOffsetPage`; `PaginatedResponse<T>` type; `parsePaginationQuery` for incoming query params
- [ ] **M** `deepMerge<T>(target, source)` — recursive merge preserving types
- [ ] **M** `groupBy<T>(arr, key)` — typed group-by returning `Record<K, T[]>`

#### Domain Helpers
> Pure functions — no I/O.
- [ ] **M** `isInStock(stockCode)` / `getStockLabel(stockCode)` — helpers over the `StockCode` union
- [ ] **M** `isActiveProduct(product)` / `isActiveService(service)` — status checks used in both API filtering and client display
- [ ] **L** `formatOrderStatus(status)` — human-readable order status label

### `shared/crypto`

- [ ] **H** JWT sign and verify helpers (wrapping `jose`) — used by `api/middleware` auth and `adapters/` token refresh
- [ ] **H** AES-256-GCM encrypt / decrypt for sensitive fields at rest
- [ ] **M** PKCE code verifier and challenge generation — used by `adapters/auth` OAuth flow
- [ ] **L** Key pair generation helper (RSA / EC) — utility for local dev and testing only

---

## Cross-Language Type Sharing (Go APIs → TypeScript)

> **Strategy:** each Go API owns an `openapi.yaml` as the single source of truth for its models.
> `models.ts` in each `src/adapters/<api>/` folder is generated from that spec via `openapi-typescript`
> — never hand-authored. The sibling `adapter.ts` imports from `./models.ts` for full type safety.
> When a Go API changes a model, it updates its spec; CI regenerates the TS types and fails the PR
> if the output is stale. This closes the drift loop without maintaining two hand-written representations.

### Generation Script (`scripts/generate.ts`)

> Must support two modes from day one: targeted (used by CI dispatch) and full (used by schedule).
> ```
> pnpm generate                              # regenerate all APIs
> pnpm generate --api auth --spec <url>      # regenerate one API from a given spec URL
> ```

- [ ] **H** Add `openapi-typescript` and `tsx` as dev dependencies
- [ ] **H** Create `scripts/generate.ts` with the following behaviour:
  - Accepts optional `--api <name>` and `--spec <url>` flags; if omitted, iterates all entries in a `scripts/apis.config.ts` registry
  - Fetches the spec (file path or URL), runs `openapi-typescript`, writes to `src/adapters/<api>/models.ts`
  - Prepends the `// AUTO-GENERATED from <api>/openapi.yaml — do not edit` header (preserving what's already in stubs)
  - Prints a per-API summary: `✓ auth — 12 types, 3 changed` or `✗ auth — fetch failed`
  - Exits non-zero if any API fails
- [ ] **H** Create `scripts/apis.config.ts` — registry mapping each API name to its spec URL (GitHub raw URL); adding a new API = one line in this file
- [ ] **H** Add `generate` script to `package.json`: `tsx scripts/generate.ts`
- [ ] **H** Add drift gate to `build.yml`: run `pnpm generate`, then `git diff --exit-code src/adapters/` — fails PR if generated output is stale
- [ ] **M** Document the generation workflow in `README.md` — running locally, adding a new API to the registry, what to do when a spec fetch fails in CI

### Automatic Model Updates (CI Automation)

> **Recommended rollout:** start with scheduled polling (no changes needed in Go API repos), then
> add `repository_dispatch` to high-churn APIs (auth, payments) once the generation workflow is proven.

#### Phase 1 — Scheduled Polling (start here)
- [ ] **H** Add `.github/workflows/regenerate.yml` to this repo with:
  - `on: schedule: cron: '0 6 * * *'` (daily at 6am UTC) + `workflow_dispatch` for manual runs
  - Runs `pnpm generate` (no args — regenerates all APIs)
  - Uses `peter-evans/create-pull-request` to open a PR if any `src/adapters/*/models.ts` changed
  - PR title: `chore(adapters): regenerate models — <date>`; body lists which APIs changed and links to their latest spec commit
  - PR is opened for review — do not auto-merge; a human verifies the diff before merging

#### Phase 2 — Repository Dispatch (add per high-churn API)
- [ ] **M** Create a `SDK_DISPATCH_TOKEN` GitHub PAT (repo-scoped, write access to this repo) and add it as a secret to each Go API repo
- [ ] **M** Add a post-merge dispatch step to `komodo-auth-api` CI (pilot):
  ```yaml
  - uses: peter-evans/repository-dispatch@v3
    with:
      token: ${{ secrets.SDK_DISPATCH_TOKEN }}
      repository: your-org/komodo-forge-sdk-ts
      event-type: spec-updated
      client-payload: >
        {"api":"auth","spec_url":"https://raw.githubusercontent.com/your-org/komodo-auth-api/main/openapi.yaml","sha":"${{ github.sha }}"}
  ```
- [ ] **M** Add `repository_dispatch` trigger to `regenerate.yml` — reads `api` and `spec_url` from `client_payload`, runs `pnpm generate --api $api --spec $spec_url`, opens a targeted PR: `chore(adapters): regenerate auth models from sha abc1234`
- [ ] **L** Roll `repository_dispatch` out to remaining high-churn APIs: `komodo-payments-api`, `komodo-user-api`, `komodo-events-api`
- [ ] **L** Evaluate auto-merge on dispatch-triggered PRs (lower risk than scheduled — scope is a single API's diff)

### Per-API OpenAPI Specs (roll out alongside Phase 1)
- [ ] **H** `komodo-auth-api` — add `openapi.yaml`; pilot for the full generation + dispatch workflow
- [ ] **H** `komodo-payments-api` — add `openapi.yaml`
- [ ] **H** `komodo-user-api` — add `openapi.yaml`
- [ ] **H** `komodo-entitlements-api` — add `openapi.yaml`
- [ ] **H** `komodo-events-api` — add `openapi.yaml`
- [ ] **H** `komodo-feature-flags-api` — add `openapi.yaml`
- [ ] **M** `komodo-order-api` — add `openapi.yaml`
- [ ] **M** `komodo-cart-api` — add `openapi.yaml`
- [ ] **M** `komodo-inventory-api` — add `openapi.yaml`
- [ ] **L** Evaluate `oapi-codegen` to also generate Go server stubs from the same specs — closes the loop so both sides are derived from the spec, neither is hand-authored

### Per-API `/pkg/v1` (TypeScript APIs)
> TypeScript APIs that call other TypeScript APIs (not Go) should follow the same `/pkg/v1` pattern
> used in the Go APIs — export models + a typed Adapter from each API's own package.
- [ ] **M** Define `/pkg/v1` structure standard for TypeScript APIs: `models.ts`, `errors.ts`, `adapter.ts`, `index.ts`
- [ ] **M** Add `"./pkg/v1"` to the export map of each TypeScript API's `package.json`
- [ ] **L** Create a scaffold script or template for bootstrapping a new `/pkg/v1` in a TypeScript API

---

## General SDK Health

- [ ] **H** Add a test framework — `vitest` is the correct choice for an ESM-first TypeScript project; add `test` and `test:watch` scripts
- [ ] **H** Add `lint` and `lint:fix` scripts to `package.json` (ESLint config exists but is not wired into any script)
- [ ] **H** CI: add lint and test steps to `build.yml`; build-only CI catches zero runtime bugs
- [ ] **H** Add Zod (or `valibot`) for runtime validation — TypeScript types are erased at runtime; API boundary inputs must be validated
- [ ] **H** Add `coverage` script and enforce a minimum threshold in CI (target 80%)
- [ ] **H** Currency — `Order.currency` and `OrderItem.currency` are hardcoded to `'USD'`; define a `Currency` type (ISO 4217 union) used across all monetary types
- [ ] **M** Add `audit` script (`pnpm audit`) and run it in CI
- [ ] **M** Add `tsup` or `unbuild` for dual CJS/ESM output — `tsc` alone only emits ESM; some consumers (Jest, older Node tooling) still need CJS
- [ ] **M** Add `.nvmrc` / `engines` field in `package.json` to pin the minimum Node version
- [ ] **M** Committing `dist/` to git via CI bot is fragile — consider publishing to a private npm registry (GitHub Packages or Artifactory) instead; if keeping `dist/`-in-git, add a CI check that `dist/` is not stale on PRs
- [ ] **M** ESLint config uses `tseslint.configs.recommended` but does not enable type-aware rules (`tseslint.configs.recommendedTypeChecked`) — many important rules are gated behind the parser services
- [ ] **M** Add `strict` lint rules — `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/consistent-type-imports`
- [ ] **L** Add `CHANGELOG.md` and adopt a versioning strategy (Conventional Commits + `changesets`)
- [ ] **L** Add `'use strict'` directive to all CommonJS-output files and any non-ESM entry points where it is not implied by the module system
- [ ] **L** Add `prepublishOnly` check that types compile clean with `tsc --noEmit` before `tsc` generates output
- [ ] **L** Add `size-limit` or `bundlesize` check in CI to catch accidental bundle bloat

---

## Planned: Payment Processor Connectors

> These belong in `src/api/` (server-side) — payment processing must never happen in the browser.

- [ ] **H** **Stripe** — payment intents, subscriptions, refunds, webhooks, idempotency key support
- [ ] **H** **PayPal** — orders, captures, refunds, webhooks
- [ ] **H** **Apple Pay** — session validation, payment token decryption
- [ ] **H** **Google Pay** — payment data decryption, tokenization
- [ ] **H** **Klarna** — session creation, order management, webhooks
- [ ] **M** **Afterpay / Clearpay** — checkout, order capture, refunds
- [ ] **L** **Square** — payments, orders, catalog, webhooks
- [ ] **L** **Braintree** — transactions, vault, webhooks

---

## Planned: Third-Party API Connectors

### Identity & Auth
- [ ] **H** **Auth0** — management API, token exchange, user ops
- [ ] **H** **Twilio Verify** — SMS / TOTP / email OTP

### Communication
- [ ] **H** **Twilio** — SMS, voice, messaging services
- [ ] **M** **Slack** — webhook posting, bot API
- [ ] **M** **PagerDuty** — incident creation, alert routing

### Observability
- [ ] **H** **Datadog** — metrics, logs, traces submission
- [ ] **L** **New Relic** — telemetry ingest

### Search & Data
- [ ] **H** **Persona** — identity verification (KYC)
- [ ] **L** **Google Maps / Places** — geocoding, address validation
