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
- [ ] **H** Error normalization — convert HTTP error responses into typed `ApiError` instances
- [ ] **H** Auth token injection — read token from storage and attach as `Authorization: Bearer`
- [ ] **M** Automatic retry with exponential backoff on 429 / 5xx
- [ ] **M** Request cancellation via `AbortController` / `AbortSignal`
- [ ] **M** Multipart / form-data request builder
- [ ] **L** Request deduplication — in-flight cache to prevent duplicate concurrent requests

### `shared/crypto`

- [ ] **H** JWT sign and verify helpers (wrapping `jose` or `jsonwebtoken`)
- [ ] **H** AES-256-GCM encrypt / decrypt for sensitive fields
- [ ] **M** Token revocation / JTI blacklist check
- [ ] **M** PKCE code verifier and challenge generation (for OAuth PKCE flows)
- [ ] **L** Key pair generation helper (RSA / EC)

### `shared/domains/auth`

- [ ] **H** `AuthToken` / `TokenClaims` types (JWT payload shape — `sub`, `iat`, `exp`, `roles`, `scopes`)
- [ ] **H** `Session` and `RefreshToken` types
- [ ] **M** OAuth authorization code flow types (state, PKCE, code, redirect URI)
- [ ] **M** Role and permission types (`Role`, `Permission`, `Scope`)
- [ ] **L** SAML / SSO assertion types

### `shared/domains/payments`

- [ ] **H** `PaymentMethod` type — card, bank account, wallet, buy-now-pay-later
- [ ] **H** `PaymentIntent` and `PaymentResult` types
- [ ] **H** `Refund` type
- [ ] **M** `Subscription` and `BillingCycle` types
- [ ] **M** Webhook event payload types (Stripe, PayPal, etc.)
- [ ] **L** Tax calculation types

### `shared/domains/user`

- [ ] **H** `User` type — id, email, name, status, roles, createdAt
- [ ] **H** `UserProfile` type — display name, avatar, preferences, locale
- [ ] **M** `Address` type — line1, line2, city, state, zip, country
- [ ] **M** `UserPreferences` type — notification settings, theme, locale
- [ ] **L** `UserDevice` type — push token, platform, last seen

### `shared/entitlements`

- [ ] **H** `Entitlement` and `EntitlementCheck` types
- [ ] **H** `hasEntitlement(user, feature)` helper — pure function, no I/O
- [ ] **M** `EntitlementPolicy` type — per-plan feature matrix
- [ ] **L** Entitlement inheritance / delegation types

### `shared/feature-flags`

- [ ] **H** `FeatureFlag` and `FlagVariant` types
- [ ] **H** `isEnabled(flag, context)` helper — evaluates flag given user/environment context
- [ ] **M** `FlagContext` type — userId, environment, percentage rollout seed
- [ ] **L** Remote flag config loader interface (LaunchDarkly, Unleash, etc.)

### `shared/security`

- [ ] **H** Input sanitization helpers — strip HTML, truncate to max length, normalize whitespace
- [ ] **H** `ApiError` / `HttpError` typed class with status code, error code, and message
- [ ] **M** CSP nonce generation
- [ ] **M** CSRF token generation and validation helpers
- [ ] **L** PII detection helpers (detect email, phone, card number patterns)

### `shared/utils`

- [ ] **H** Date/time helpers — ISO 8601 parse/format, UTC conversion, relative time
- [ ] **H** Pagination helpers — cursor-based and offset-based types + builder
- [ ] **M** String helpers — slugify, truncate, capitalize, camelCase ↔ snake_case
- [ ] **M** Object helpers — deep merge, omit, pick, typed `Object.entries`
- [ ] **L** Currency formatting — format cents as display string; multi-currency support

---

## General SDK Health

- [ ] **H** Add a test framework — `vitest` is the correct choice for an ESM-first TypeScript project; add `test` and `test:watch` scripts
- [ ] **H** Add `lint` and `lint:fix` scripts to `package.json` (ESLint config exists but is not wired into any script)
- [ ] **H** CI: add lint and test steps to `build.yml`; build-only CI catches zero runtime bugs
- [ ] **H** Add Zod (or `valibot`) for runtime validation — TypeScript types are erased at runtime; API boundary inputs must be validated
- [ ] **H** Add `coverage` script and enforce a minimum threshold in CI (target 80%)
- [ ] **H** Tighten `[key: string]: any` escape hatches in `MarketingContentData` and `Product.specs` — use `unknown` or a discriminated union
- [ ] **H** Currency — `Order.currency` and `OrderItem.currency` are hardcoded to `'USD'`; define a `Currency` type (ISO 4217 union) used across all monetary types
- [ ] **M** Add `audit` script (`pnpm audit`) and run it in CI
- [ ] **M** Add `tsup` or `unbuild` for dual CJS/ESM output — `tsc` alone only emits ESM; some consumers (Jest, older Node tooling) still need CJS
- [ ] **M** Add `.nvmrc` / `engines` field in `package.json` to pin the minimum Node version
- [ ] **M** Committing `dist/` to git via CI bot is fragile — consider publishing to a private npm registry (GitHub Packages or Artifactory) instead; if keeping `dist/`-in-git, add a CI check that `dist/` is not stale on PRs
- [ ] **M** ESLint config uses `tseslint.configs.recommended` but does not enable type-aware rules (`tseslint.configs.recommendedTypeChecked`) — many important rules are gated behind the parser services
- [ ] **M** Add `strict` lint rules — `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/consistent-type-imports`
- [ ] **M** `shared/types` is exported at both `./shared/types` and `./types` in the export map — consolidate to one canonical path to avoid confusion
- [ ] **L** Add `CHANGELOG.md` and adopt a versioning strategy (Conventional Commits + `changesets`)
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
