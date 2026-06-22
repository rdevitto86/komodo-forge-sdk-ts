# TODO

A running list of gaps, incomplete work, and planned additions. Each item is labeled **H** (high), **M** (medium), or **L** (low) priority and ordered within each section accordingly.

---

## Stubs to Implement

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
- [ ] **M** DynamoDB Streams consumer — shard management, checkpointing, retry, and a handler callback interface; used by statistics, insights, and search consumers for real-time index sync
- [ ] **L** ElastiCache (Redis) — get/set/del, configurable timeouts, bulk `MGET`/`MSET`
- [ ] **L** SNS — topic publish helper
- [ ] **L** S3 bucket operations (create, delete, list)

#### Bedrock client (`api/aws/bedrock`)
> Thin AWS-native model client. Implements the `ModelClient` interface defined under
> `api/ai` so callers can swap providers without code changes. All cross-cutting
> concerns (prompt templating, injection scanning, tool registry, agent runtime,
> audit logging, spend caps) live in `api/ai` — this folder is **only** the wire
> protocol for Bedrock's `InvokeModel`, `Converse`, and runtime APIs. Reuses
> `api/aws` SigV4 signing and credential chain; reuses `shared/http/client` for
> retry / circuit-breaker / deadline behaviour.

- [ ] **H** `BedrockClient` — implements `ModelClient` (`complete`, `stream`, `embed`, `countTokens`); routes to Bedrock `Converse` / `ConverseStream` for chat models and `InvokeModel` for embeddings
- [ ] **H** SigV4 request signing — shared with the rest of `api/aws`; supports static credentials, env, instance profile, IRSA, and `AssumeRole` chain
- [ ] **H** Cross-region inference + cross-region profile support — accept an explicit `region` per call (overrides client default); honor inference profile ARNs
- [ ] **H** Streaming via `ConverseStream` — parses the AWS event-stream framing (vnd.amazon.eventstream) into the same `AsyncIterable<TextDelta | ToolUse | Usage>` the `api/ai` layer expects; surfaces `metadata` events for usage/cost
- [ ] **H** Tool use via `Converse` `toolConfig` — pass through the `api/ai` tool registry's JSON schemas; do **not** execute tools here (execution happens in the agent runtime so server-side authz runs with the caller's principal, not the SDK service role)
- [ ] **H** Provider error mapping — translate Bedrock errors (`ThrottlingException`, `ModelTimeoutException`, `ModelStreamErrorException`, `ServiceQuotaExceededException`, `ModelErrorException`, `AccessDeniedException`) to the `api/ai` retry-policy taxonomy (transient vs terminal); honor `Retry-After` where present
- [ ] **M** Bedrock prompt caching — surface cache token usage in the `Usage` payload so spend tracking attributes cached tokens correctly
- [ ] **M** Embeddings — `InvokeModel` against Titan Embeddings, Cohere Embed; batch with concurrency cap; expose dimension + normalization
- [ ] **M** Multi-modal input — image + document (PDF) parts via `Converse` content blocks; size limits enforced before send
- [ ] **M** Guardrails for Amazon Bedrock — pass `guardrailIdentifier` + `guardrailVersion` per request; map guardrail intervention responses (`stopReason: 'guardrail_intervened'`) into the `api/ai` safety-flag taxonomy
- [ ] **M** Model listing + metadata helper — `listFoundationModels()` filtered by provider/modality; cached
- [ ] **M** Async batch via Bedrock Batch Inference — submit, poll, retrieve; aligns with the `api/ai` batch API TODO
- [ ] **L** Knowledge Bases for Bedrock — thin wrapper around `RetrieveAndGenerate` / `Retrieve`; treated as a tool in the `api/ai` registry, not a built-in RAG path
- [ ] **L** Bedrock Agents passthrough — `InvokeAgent` for callers who want AWS-managed agents (separate from the in-SDK `api/ai` `Agent` runtime; document the tradeoff)
- [ ] **L** Application Inference Profiles — create/list/delete helpers for tagging-based cost attribution

### `api/gcp`

> GCP counterpart to `api/aws`. Each package targets the same method signature as its AWS sibling where semantics map cleanly; documented divergences (Firestore key model, Pub/Sub vs SNS+SQS split) are called out per-package. Callers swap providers by changing import path. Goal: lift shared `API` interfaces into a provider-neutral package (e.g. `storage`, `queue`, `secrets`) so consumer code depends on the interface, not a concrete cloud package.

- [ ] **H** Cloud Storage (`api/gcp/gcs`) — `getObject`, `getObjectAs`, `putObject`, `deleteObject`; streaming get; parity with `api/aws/s3`
- [ ] **H** Firestore (`api/gcp/firestore`) — `getItem`, `putItem`, `updateItem`, `deleteItem`, `query`, `queryAs`; **divergence:** document IDs replace composite PK/SK — decide on `BuildPath` helper vs synthetic `pk#sk` key before implementing
- [ ] **H** Pub/Sub publisher (`api/gcp/pubsubpub`) — `publish`; parity with `api/aws` SNS
- [ ] **H** Pub/Sub pull subscriber (`api/gcp/pubsubsub`) — `receive`, `ack`, `nack`; parity with SQS; **divergence:** no native FIFO `MessageGroupId` — document the gap
- [ ] **H** Cloud Functions / Cloud Run invoke (`api/gcp/cloudfunctions`) — `invoke`; parity with Lambda; decide sync vs async semantics
- [ ] **H** Secret Manager (`api/gcp/secretmanager`) — `getSecret`, `getSecrets`; distinguish "not found" via typed error; do not repeat the `context.TODO()` bug from AWS
- [ ] **H** Cloud Logging (`api/gcp/cloudlogging`) — `write`, `writeBatch`; parity with CloudWatch Logs
- [ ] **H** Cloud Monitoring (`api/gcp/cloudmonitoring`) — `putMetric`, `putMetrics`; custom metric prefix convention (`custom.googleapis.com/komodo/<name>`)
- [ ] **H** Vertex AI (`api/gcp/vertexai`) — `invoke`, `invokeStream`; implements `ModelClient` interface from `api/ai`; map Gemini model IDs to align with Bedrock selection conventions
- [ ] **H** Cloud SQL (`api/gcp/cloudsql`) — connection pool, `ping`, `close`, transaction support, query helpers; IAM auth flag; parity with `api/db`
- [ ] **H** Memorystore (`api/gcp/memorystore`) — `get`, `set`, `del`, `exists`; configurable timeouts; parity with `api/aws` ElastiCache — do not repeat hardcoded-timeout bug
- [ ] **H** Provider-neutral interfaces — lift shared interfaces (`StorageProvider`, `QueueProvider`, `SecretsProvider`, `DatabaseProvider`) into a top-level `api/cloud` package so consumers depend on the interface, not the concrete AWS or GCP client
- [ ] **H** Shared GCP credential options — centralize `GoogleAuth` option assembly (service account JSON path, impersonation, project ID, emulator endpoint override) to avoid per-package duplication; mirrors the `awsconfig.LoadDefaultConfig` consolidation already TODO'd for AWS
- [ ] **M** Vertex AI Search (`api/gcp/vertexsearch`) — `search`, `index`, `delete`; **divergence:** managed retrieval vs raw inverted index — document what Elasticsearch-style features (aggregations, custom mappings) are not supported
- [ ] **M** Dialogflow CX (`api/gcp/dialogflow`) — `detectIntent`; parity with `api/aws/connect`; **divergence:** flow-builder semantics differ — document
- [ ] **M** Contact Center AI Insights (`api/gcp/ccaiinsights`) — `analyzeConversation`, `getAnalysis`; parity with `api/aws/contactlens`
- [ ] **M** GCP transactional email decision — no native GCP email service; pick one: `connectors/sendgrid` as GCP default, `connectors/mailgun`, or document that email delivery is provider-agnostic and lives outside `api/gcp`
- [ ] **L** GCP README — provider mapping table (AWS↔GCP) and per-package divergences once stubs are filled

### `api/config`
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
- [ ] **M** Idempotency middleware — upgrade to Redis-backed store for distributed deployments

### `api/observability`
- [ ] **H** OpenTelemetry SDK initialization — traces + metrics (spans, exporters)
- [ ] **L** Circuit breaker primitive for outbound calls (use `HttpClient` with `circuitBreaker` option)

### `api/ai`

> New module for LLM/agent integration. Lives under `api/` because all model calls must
> originate server-side: API keys never ship to the client, prompts/responses pass through
> server-side guardrails and audit logging, and tool-execution must run with server trust.
> Provider-agnostic core; thin adapters per provider (Anthropic, OpenAI, Bedrock, Vertex).

#### Provider abstraction & orchestration
- [ ] **H** `ModelClient` interface — provider-agnostic `complete`, `stream`, `embed`, `countTokens`; concrete adapters: `AnthropicClient`, `OpenAIClient`, `BedrockClient`, `VertexClient` (each wraps `HttpClient` for consistent retry/jitter/circuit-breaker/deadline behaviour)
- [ ] **H** Streaming response support — SSE / chunked parsing with backpressure; expose `AsyncIterable<TextDelta | ToolUse | Usage>` so consumers can `for await` without buffering full responses
- [ ] **H** Token + cost accounting — per-call `usage` (input/output/cached tokens, model, $cost) attached to telemetry; budget caps (`maxCostPerRequest`, `maxCostPerSession`) enforced before each call
- [ ] **H** Request-level deadline + cancellation — compose external `AbortSignal` with model timeout; cancel streaming mid-flight without leaking sockets
- [ ] **H** Retry policy specific to model APIs — 429/529 with provider `retry-after` header, distinguishes transient (overload) from terminal (content policy, context length) errors
- [ ] **M** Prompt-cache support (Anthropic `cache_control`, OpenAI prompt-caching) — surface cache hit/miss in telemetry; helper to mark static prefix segments cacheable
- [ ] **M** Multi-provider fallback / shadow — primary + fallback model on transient failure; optional shadow mode that runs N providers in parallel for eval (logs only, returns primary)
- [ ] **M** Embeddings client — `embed(text | text[])` with batch size limits, dimension config, and a pluggable vector-store interface (in-memory, Pinecone, pgvector) — no built-in store; provide the interface
- [ ] **L** Async batch API (Anthropic Message Batches, OpenAI Batch) for bulk eval/backfill workloads
- [ ] **L** Long-context strategies — auto-truncation, sliding window, RAG-first fallback when context exceeds model limit

#### Prompt engineering & template management
- [ ] **H** `PromptTemplate` — typed templates with named slots, schema-validated inputs (Zod), explicit separation of system / user / assistant turns; **no string concatenation of user input into prompts** — slots must be tagged untrusted/trusted
- [ ] **H** Versioned prompt registry — prompts stored as named, semver'd artifacts (file-based or remote); every call logs `prompt_name + prompt_version`, enabling A/B tests and rollback
- [ ] **M** Output schema enforcement — `completeStructured<T>(schema: ZodSchema<T>)` that uses provider tool-use / JSON-mode, validates response, retries with repair prompt on schema failure
- [ ] **M** Few-shot example management — examples bound to a `PromptTemplate`, deduplicated, length-capped to fit within token budget
- [ ] **L** Prompt eval harness — given a template version + dataset, run, score (LLM-as-judge + exact-match), and emit pass/fail vs. baseline

#### Prompt injection & content safety (high priority — security boundary)
> Threat model: **untrusted text** (user input, retrieved RAG documents, tool outputs, web page contents) can contain instructions that hijack the model. Trusted text is operator-authored. The SDK must make this distinction structural, not stylistic.

- [ ] **H** Untrusted-content wrapper — `untrusted(text, source)` returns a tagged value that templates must render inside delimited, neutralized sections (XML tags with closing-tag stripping, or dedicated turn). Direct interpolation of `string` into a system prompt must be a type error.
- [ ] **H** Input scanner — heuristic + classifier-based detection of common injection patterns (`ignore previous instructions`, role-confusion preambles, base64'd instructions, unicode-tag smuggling, indirect-instruction templates). Configurable: log / warn / block.
- [ ] **H** Output scanner — detect prompt leak (model echoing system prompt), data exfiltration (model emitting secrets / PII / credentials present in context), and disallowed content (PII, credentials, internal hostnames). Reuses `shared/redaction` policies.
- [ ] **H** Tool-use allowlist + per-tool auth — every tool the model can invoke is declared up front with a Zod input schema + a server-side authorization check that runs with the **caller's** principal, not the SDK's service token. Models cannot escalate privilege via tool calls.
- [ ] **H** Tool output sanitization — any string returned from a tool is wrapped as `untrusted()` before re-entering the model context (closes the indirect-injection loop where a tool fetches attacker-controlled content)
- [ ] **H** Secret-in-prompt detection — pre-flight scan of outbound prompt for AWS keys, JWTs, private keys, etc.; block + alert (reuses regex set from `shared/redaction`)
- [ ] **M** Jailbreak / safety classifier hook — pluggable interface for Llama Guard, Prompt Guard, Lakera, or a self-hosted classifier; blocks before invoke and after response
- [ ] **M** Confused-deputy guard — when the model requests a tool action, require structural evidence that the request originated from the operator's task, not from untrusted content (e.g. tag the operator's instruction with a nonce; tool calls must reference the nonce)
- [ ] **M** Rate limit + spend cap per principal — separate from HTTP rate limiter; tracks $/tokens by `userId`, not IP; trips circuit breaker on anomalous burn rate
- [ ] **L** Canary tokens in system prompts — unique markers per session that, if observed in output, prove a prompt-leak occurred; auto-rotate

#### Agent & tool orchestration
- [ ] **H** `Agent` runtime — bounded tool-use loop with: max iterations, max wall time, max total tokens, max tool calls, per-tool timeout; emits structured trace events (`tool_call`, `tool_result`, `model_delta`, `terminated`) to telemetry
- [ ] **H** Tool registry — `registerTool({ name, description, inputSchema: ZodSchema, authorize(principal, input), execute(input) })` with strict input validation before `execute` runs; reject unknown tool names from the model
- [ ] **H** Deterministic replay — every agent run persists `{prompt_version, model, seed, tool_calls, tool_results}`; replayable for debugging and regression tests
- [ ] **M** Conversation / memory store interface — short-term (in-conversation) and long-term (per-user) memory abstractions; no built-in store, just the interface (matches `vector-store` pattern)
- [ ] **M** Multi-agent coordination primitives — `subAgent(task, tools, budget)` that runs an isolated agent with its own budget and trust boundary (sub-agent results re-enter parent as `untrusted()`)
- [ ] **M** Human-in-the-loop gate — tool calls marked `requiresApproval: true` pause the agent and surface a structured approval request; SDK provides the protocol, host app provides the UI

#### Observability for AI calls
- [ ] **H** Per-call structured trace — `{request_id, user_id, prompt_name, prompt_version, model, provider, input_tokens, output_tokens, cached_tokens, cost_usd, latency_ms, finish_reason, safety_flags, tool_calls}` — emitted via existing `RuntimeLogger` / OpenTelemetry once that lands
- [ ] **H** Full-prompt audit log — separate stream (not stdout) with the **complete** prompt + response, post-redaction; required for compliance review and prompt-injection post-mortems; retention configurable
- [ ] **M** Eval metrics — pass/fail rate by `prompt_version`, regression alerts when a new version dips below baseline
- [ ] **L** Cost dashboard panel snippets (Grafana / Datadog JSON) — ship alongside the metric names so adopters get dashboards out of the box

#### Provider adapters (under `api/ai/providers/`)
- [ ] **H** **Anthropic** — Messages API, streaming, tool use, prompt caching, vision, PDF input
- [ ] **H** **OpenAI** — Responses API + Chat Completions, streaming, tool use, structured outputs, embeddings
- [ ] **M** **AWS Bedrock** — Anthropic + Titan + Cohere via Bedrock; reuses `api/aws` credentials chain
- [ ] **M** **Google Vertex** — Gemini models + Anthropic-on-Vertex
- [ ] **L** **Local / OpenAI-compatible** — generic adapter for vLLM, Ollama, LM Studio (useful for offline eval)


- [ ] **M** Auth token injection — read token from storage and attach as `Authorization: Bearer`
- [ ] **M** Multipart / form-data request builder
- [ ] **L** Request deduplication — in-flight cache to prevent duplicate concurrent GET requests

### `shared/http/websocket`
- [ ] **L** Room/channel subscription support

### `adapters/base`
- [ ] **L** Request ID forwarding — reads `X-Request-ID` from an incoming request context and passes it to outbound adapter calls for distributed tracing

### `shared/crypto`
- [ ] **M** Token revocation / JTI blacklist check
- [ ] **L** Key pair generation helper (RSA / EC)

### `shared/security/hashing`
- [ ] **H** Password / token hashing — standardize on Argon2id (preferred) or bcrypt; expose `hash(plaintext): Promise<string>` and `verify(plaintext, hash): Promise<boolean>`; used by `komodo-auth-api` and `komodo-user-api` password storage so per-service ad-hoc implementations can be removed

### `shared/security/oauth` — server-side OAuth flows
- [ ] **H** Refresh token flow — `refreshAccessToken(refreshToken)` with rotation and TTL enforcement
- [ ] **H** Authorization code flow — redirect URI construction, code exchange, state / PKCE (`S256`) validation
- [ ] **H** Token endpoint handler — validates grant type, issues access + refresh tokens, enforces scope allowlist
- [ ] **M** Redirect URI validation — reject URIs not on the registered allowlist; reject `localhost` in production
- [ ] **L** Dynamic scope loading — accept scope vocabulary via constructor instead of hardcoded set (aligns with `shared/security` `ALLOWED_SCOPES` bug already tracked)

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
- [ ] **M** Payment plan types — `PaymentPlan`, `Installment`, `PlanStatus`, `PlanSchedule`; add `createPlan`, `getPlan`, `listPlans`, `cancelPlan` to `PaymentsAdapter` once `komodo-payments-api` spec includes the plan endpoints
- [ ] **L** Tax calculation types

#### `adapters/shipping` → source: `komodo-shipping-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-shipping-api` covering: `ShipmentLabel`, `Shipment`, `ShipmentStatus`, `ShipmentDirection`, `CarrierEvent`
- [ ] **M** Run generation — replace `models.ts` stub with generated output once spec exists
- [ ] **M** Implement `adapter.ts` — `ShippingAdapter` class: `createOutboundLabel`, `createInboundLabel`, `getShipment`, `trackShipment`

#### `adapters/user` → source: `komodo-user-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-user-api` covering: `User`, `UserProfile`, `Address`, `UserPreferences`
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `UserAdapter` class: `getUser`, `updateProfile`, `getAddress`
- [ ] **L** `UserDevice` type (push token, platform, last seen) — add to spec when push notifications land

#### `adapters/communications` → source: `komodo-communications-api/openapi.yaml`
- [ ] **H** Add `openapi.yaml` to `komodo-communications-api` covering: send email, send SMS, OTP delivery
- [ ] **H** Run generation — replace `models.ts` stub with generated output
- [ ] **H** Implement `adapter.ts` — `CommsAdapter` class: `sendOTP`, `sendEmail`, `sendSMS`; consumers must not compose `POST /v1/send/email` + template ID manually

#### `adapters/cart` → source: `komodo-cart-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-cart-api` covering: `Cart`, `CartItem`, `CartSummary`
- [ ] **M** Run generation — replace `models.ts` stub with generated output
- [ ] **M** Implement `adapter.ts` — `CartAdapter` class: `getCart`, `addItem`, `removeItem`, `clearCart`

#### `adapters/shop-items` → source: `komodo-shop-items-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-shop-items-api` covering: `ShopItem`, `ItemVariant`, `ItemMedia`
- [ ] **M** Run generation — replace `models.ts` stub with generated output
- [ ] **M** Implement `adapter.ts` — `ShopItemsAdapter` class: `getItem`, `listItems`, `searchItems`

#### `adapters/order` → source: `komodo-order-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-order-api` covering: `Order`, `OrderItem`, `OrderStatus`, `OrderSummary`
- [ ] **M** Run generation — replace `models.ts` stub with generated output
- [ ] **M** Implement `adapter.ts` — `OrderAdapter` class: `createOrder`, `getOrder`, `listOrders`, `cancelOrder`

#### `adapters/order-reservations` → source: `komodo-order-reservations-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-order-reservations-api` covering: `Reservation`, `ReservationStatus`
- [ ] **M** Run generation — replace `models.ts` stub with generated output
- [ ] **M** Implement `adapter.ts` — `OrderReservationsAdapter` class: `createReservation`, `getReservation`, `releaseReservation`

#### `adapters/search` → source: `komodo-search-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-search-api` covering: `SearchRequest`, `SearchResult`, `SearchFacet`
- [ ] **M** Run generation — replace `models.ts` stub with generated output
- [ ] **M** Implement `adapter.ts` — `SearchAdapter` class: `search`, `suggest`

#### `adapters/support` → source: `komodo-support-api/openapi.yaml`
- [ ] **M** Add `openapi.yaml` to `komodo-support-api` covering: `SupportTicket`, `TicketMessage`, `TicketStatus`
- [ ] **M** Run generation — replace `models.ts` stub with generated output
- [ ] **M** Implement `adapter.ts` — `SupportAdapter` class: `createTicket`, `getTicket`, `addMessage`, `closeTicket`

#### `adapters/reviews` → source: `komodo-reviews-api/openapi.yaml`
- [ ] **L** Add `openapi.yaml` to `komodo-reviews-api` covering: `Review`, `ReviewSummary`, `ReviewStatus`
- [ ] **L** Run generation — replace `models.ts` stub with generated output
- [ ] **L** Implement `adapter.ts` — `ReviewsAdapter` class: `createReview`, `getReviews`, `moderateReview`

### `api/server`
- [ ] **M** Opinionated `Server` class wrapping Node's `http.Server` — carries shared deps (logger, metrics, downstream SDK adapter clients, Redis/DB handles); handlers registered as methods access deps via `server.comms.sendOTP(...)` etc.; reduces per-handler constructor boilerplate for services with many shared dependencies. Keep functional-constructor pattern working alongside — document the tradeoff vs per-handler DI in module docs.

### `testing/`

> Test utilities designed to work alongside the SDK. Not exported in production bundles.

#### `testing/mocks`
- [ ] **H** Mock HTTP server — scenario-based request matching (method + path + headers + body conditions); configurable response (status, headers, body); sequential response mode (call 1 → 200, call 2 → 429) for testing retry and circuit-breaker behavior; path-parameter matching (`:id`, `:orderId`)
- [ ] **H** Transport-level mock — custom `fetch` replacement wrapping the mock server so outbound calls (Stripe, PayPal, etc.) can be intercepted without a real network listener
- [ ] **M** Regex and wildcard condition matching — `Authorization: Bearer .*`; match any value for a required key
- [ ] **M** Scenario `not` conditions — negated matching (e.g. header absent, body field is not a given value)
- [ ] **L** Per-scenario response header merging — extend (not replace) global default headers

#### `testing/performance`
- [ ] **H** Latency measurement helpers — `measureLatency(fn, iterations)` returning p50/p95/p99
- [ ] **M** Throughput / RPS measurement
- [ ] **L** Benchmark comparison — compare two implementations and report regression

#### `testing/chaos`
- [ ] **H** Fault injection — configurable error rate on outbound calls; simulates transient upstream failures for retry-path testing
- [ ] **M** Latency injection — add configurable artificial delay per call or per route
- [ ] **L** Dependency blackout simulation — fully block a named upstream so circuit-breaker and fallback paths can be exercised

### `shared/utils`

> Pure, environment-agnostic functions only — no DOM, no Node.js APIs, no framework assumptions.
> Safe to import in a Go-backed API handler, a Node.js service, or a browser context equally.

#### Validation
- [ ] **M** `isValidPostalCode(value, countryCode)` — US ZIP + international
- [ ] **L** `isValidCreditCardFormat(value)` — Luhn check only; no processing — useful for client-side pre-validation before hitting `adapters/payments`

#### Formatting
- [ ] **M** `formatPhone(value, countryCode?)` — raw digits → `(555) 123-4567` or E.164

#### Data Helpers
- [ ] **H** Pagination — `buildCursorPage`, `buildOffsetPage`; `PaginatedResponse<T>` type; `parsePaginationQuery` for incoming query params

#### Domain Helpers
> Pure functions — no I/O.
- [ ] **M** `isInStock(stockCode)` / `getStockLabel(stockCode)` — helpers over the `StockCode` union
- [ ] **M** `isActiveProduct(product)` / `isActiveService(service)` — status checks used in both API filtering and client display
- [ ] **M** `isRepairService(item)` — returns `true` when `item.service_type === 'repair'`; type narrows to a `RepairService` subtype with `accepted_device_types`, `estimated_turnaround_days`, `warranty_on_repair` fields
- [ ] **M** `formatRepairStatus(status)` — human-readable label for repair booking state machine values (`intake_pending` → `"Awaiting Intake"`, `shipped_back` → `"Shipped Back to You"`, etc.)
- [ ] **M** `isInboundShipment(shipment)` / `isOutboundShipment(shipment)` — type guards over a `ShipmentDirection` union (`'inbound' | 'outbound'`); used in shipping status displays and label flows
- [ ] **L** `formatOrderStatus(status)` — human-readable order status label

#### Safety / Defensive helpers
- [ ] **M** `safeLookup(obj, path, fallback?)` — try/catch wrapper for deep property/path access; accepts an anonymous resolver function or dotted-path string. Returns `fallback` (or `undefined`) on any throw. Eliminates repetitive `?.` chains and rescues from runtime shape mismatches at API boundaries.
- [ ] **M** Input allowlist / blocklist filter helpers — `allow(value, predicate | regex | enum[])` and `block(value, predicate | regex | enum[])` returning typed `Result<T, ValidationError>`; usable for free-text inputs, file-upload type/extension checks, and query-param scrubbing before validation.
- [ ] **M** `canonicalize(text, opts?)` — Unicode NFKC normalization + zero-width / bidi-control stripping + whitespace collapse; required before any equality compare on user-supplied identifiers (emails, usernames, SKUs) to defeat homoglyph + invisible-char attacks.

### `shared/browser`
> Browser-only utilities. Tree-shakeable; never imported from server-side code paths.

- [ ] **M** Clipboard service — `copy(text)`, `paste()`, `onCopy/onPaste/onDrop` Svelte actions / framework-agnostic event helpers; validates input against an optional schema before write; honors `navigator.clipboard` permission state with execCommand fallback.
- [ ] **M** Session timeout manager — idle detection (mouse/keyboard/touch/visibilitychange), configurable warning + logout thresholds; emits `idle`, `warn`, `expired` events; integrates with auth client to call `/oauth/revoke` on expire.
- [ ] **M** HapticTouch / pointer controller — normalized event layer over click, touch, drag/drop, long-press, swipe; resolves the pointer-events-vs-touch-events split and exposes a single `usePointer(node, opts)` action with typed callbacks.

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

- [ ] **H** Add health check tests — WebSocket connection health, ping/pong heartbeat verification, connection state monitoring tests
- [ ] **H** Add `lint` and `lint:fix` scripts to `package.json` (ESLint config exists but is not wired into any script)
- [ ] **H** CI: add lint and test steps to `build.yml`; build-only CI catches zero runtime bugs
- [ ] **H** Add Zod (or `valibot`) for runtime validation — TypeScript types are erased at runtime; API boundary inputs must be validated
- [ ] **H** Add `coverage` script and enforce a minimum threshold in CI (target 80%)
- [ ] **H** Currency — `Order.currency` and `OrderItem.currency` are hardcoded to `'USD'`; define a `Currency` type (ISO 4217 union) used across all monetary types
- [ ] **M** Add `audit` script (`pnpm audit`) and run it in CI
- [ ] **M** Add versioned barrel exports to `dist/` — `dist/index.ts` re-exports from the current stable version (e.g. `v1`) as the default import path; older/newer versions remain importable via `dist/v1`, `dist/v2`, etc.; forces a clear default while preserving backward and forward compatibility across consumers
- [ ] **M** Add `tsup` or `unbuild` for dual CJS/ESM output — `tsc` alone only emits ESM; some consumers (Jest, older Node tooling) still need CJS
- [ ] **M** Add `.nvmrc` / `engines` field in `package.json` to pin the minimum Node version
- [ ] **M** Committing `dist/` to git via CI bot is fragile — consider publishing to a private npm registry (GitHub Packages or Artifactory) instead; if keeping `dist/`-in-git, add a CI check that `dist/` is not stale on PRs
- [ ] **M** Create a GitHub org named `komodo-forge-sdk`, transfer the repo under it, and publish `@komodo-forge-sdk/typescript` to GitHub Packages — the package scope must match the GitHub org for `npm.pkg.github.com` to accept the publish
- [ ] **M** ESLint config uses `tseslint.configs.recommended` but does not enable type-aware rules (`tseslint.configs.recommendedTypeChecked`) — many important rules are gated behind the parser services
- [ ] **M** Add `strict` lint rules — `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/consistent-type-imports`
- [ ] **M** Error code range registration — define a `ranges.ts` constant map and register range allocations for new services as they come online (e.g. `RangePromotions = 62` for `komodo-shop-promotions-api`, `RangeWishlist = 32` for `komodo-user-wishlist-api`); prevents range collisions across the service mesh
- [ ] **L** Add `CHANGELOG.md` and adopt a versioning strategy (Conventional Commits + `changesets`)
- [ ] **L** `release` script — already exists at `scripts/release.sh`; wire `CHANGELOG.md` update into it once the changelog strategy is settled
- [ ] **L** Add `'use strict'` directive to all CommonJS-output files and any non-ESM entry points where it is not implied by the module system
- [ ] **L** Add `prepublishOnly` check that types compile clean with `tsc --noEmit` before `tsc` generates output
- [ ] **L** Add `size-limit` or `bundlesize` check in CI to catch accidental bundle bloat

---

## Planned: GCP Service Connectors

> Stubs for each are already scaffolded in `api/gcp/` (see "GCP Service Stubs" above). This section tracks additional GCP services that don't yet have a stub — analogous to the AWS planned connectors list.

- [ ] **M** **BigQuery** — query execution, dataset/table management, streaming inserts; common analytics destination, no direct AWS equivalent (Redshift/Athena were never added)
- [ ] **M** **Eventarc** — event routing from GCP services into Pub/Sub / Cloud Run / Cloud Functions; parallel to AWS EventBridge entry
- [ ] **M** **Cloud Tasks** — durable task queue with scheduled execution; no direct AWS equivalent (closest: SQS delay queues)
- [ ] **M** **Cloud Scheduler** — cron-as-a-service for HTTP / Pub/Sub targets; parallel to AWS EventBridge Scheduler
- [ ] **L** **Cloud KMS** — envelope encryption, key rotation; pairs with `shared/security/hashing` and `shared/crypto`
- [ ] **L** **Cloud CDN / Cloud Armor** — signed URL generation, WAF rule management; parallel to planned AWS CloudFront entry
- [ ] **L** **Cloud Translation / Speech-to-Text / Text-to-Speech** — defer until downstream consumers (`komodo-support-api`, `komodo-communications-api`) confirm need

---

## Planned: Payment Processor Connectors

> These belong in `src/api/` (server-side) — payment processing must never happen in the browser.

- [ ] **H** **Stripe** — payment intents, subscriptions, refunds, webhooks, idempotency key support
- [ ] **M** **Stripe — payment plans / installments** — installment schedule creation, per-installment charge execution, plan cancellation, and webhook event types (`payment_plan.created`, `installment.paid`, `installment.failed`)
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

### Shipping & Logistics
- [ ] **M** **EasyPost** — label generation (inbound + outbound), shipment creation, tracking events, carrier-agnostic wrapper; primary candidate for `komodo-shipping-api` backend
- [ ] **L** **ShipStation** — order import, label generation, shipment status; alternative aggregator if EasyPost is not selected

### Search & Data
- [ ] **H** **Persona** — identity verification (KYC)
- [ ] **L** **Google Maps / Places** — geocoding, address validation

---

## Bugs / Correctness (audit 2026-05-13)

> Findings from a hardening pass over core SDK code. These are observed defects or
> anti-patterns in current source, distinct from feature gaps tracked above.

### `api/middleware` — sanitization (high severity, security + correctness)
- [ ] **H** `sanitizationMiddleware` `SQL_INJECTION` regex strips substrings (`select`, `drop`, `update`, etc.) from arbitrary string values — will silently mangle legitimate user input (emails, names, free-text fields containing those tokens). SQL injection is not prevented at the HTTP layer; remove the regex strip and instead enforce parameterized queries at the DB layer (`api/db`) + output encoding. Keep null-byte and path-traversal strips.
- [ ] **H** `sanitizationMiddleware` parses and re-serializes the JSON body — this changes byte representation and `Content-Length`, breaking downstream HMAC/webhook signature verification. Must skip sanitization for routes that require body-byte fidelity, or move sanitization to per-handler schema validation (Zod).
- [ ] **H** `sanitizationMiddleware` and `normalizationMiddleware` construct a new `Request` — this orphans any context set on the previous `Request` (WeakMap key changes). Any middleware ordering with these before `requestIdMiddleware` / `clientSourceMiddleware` / `authMiddleware` silently loses context. Either: (a) document mandatory ordering in code + tests, (b) carry ctx forward when rebuilding the Request, or (c) move sanitization into per-handler validation and remove from the chain.

### `api/middleware` — CSRF (high severity, security)
- [ ] **H** `csrfMiddleware` only checks for header presence; it does not compare the header value against the CSRF cookie. The "double-submit cookie" pattern requires both values match. Current implementation accepts any non-empty `x-csrf-token` header — trivially bypassable.

### `api/middleware` — CORS (medium-high severity, security)
- [ ] **H** `corsMiddleware` allows `origins: ['*']` together with `allowCredentials: true`. Browsers reject this combination, but the SDK accepts it and emits `Access-Control-Allow-Origin: <echoed origin>` + `Access-Control-Allow-Credentials: true`, which is a real misconfiguration that bypasses the wildcard restriction. Validate at construction time and throw if both are set.
- [ ] **M** Preflight does not validate the requested method (`Access-Control-Request-Method`) or headers (`Access-Control-Request-Headers`) against the allowlist before responding 204 — every OPTIONS gets the same canned response.

### `api/middleware` — rate limiter
- [ ] **H** Trusts `x-forwarded-for` first hop unconditionally. In any deployment without a trusted proxy stripping/setting this header, clients can spoof their identity and evade limits. Add a `trustedProxyHops` option and read the (N+1)th-from-right entry.
- [ ] **M** Token-bucket `Map<string, TokenBucket>` grows without bound — every unique key (IP, user) is retained forever. Add LRU eviction or periodic GC by `lastMs`.
- [ ] **M** `failOpen: true` is the default — under limiter error, requests pass through. For abuse-prevention semantics this should default to fail-closed; document the tradeoff explicitly.

### `api/middleware` — idempotency
- [ ] **H** `idempotencyStore` is process-local. In any multi-instance deployment, the same `Idempotency-Key` will succeed once per instance — defeating the purpose. The high-pri Redis-backed store TODO already exists; reclassify the in-memory store as **dev/test only** and refuse to start in production unless an external store is configured.
- [ ] **M** On duplicate, returns 409 Conflict. RFC draft + industry convention (Stripe, AWS) is to **replay the original response**, not error. Refactor to store `{status, headers, body}` keyed by `Idempotency-Key + request hash`.
- [ ] **M** `cleanIdempotencyStore()` runs on every state-changing request and scans the whole map — O(n) per request. Replace with a TTL heap or schedule the sweep.

### `api/middleware` — auth
- [ ] **M** `authMiddleware` overrides `CLIENT_TYPE` based on `isAdmin || scopes.length === 0`, contradicting `clientSourceMiddleware`'s earlier decision. The intent is unclear and the two middlewares are now coupled by ordering. Pick one source of truth.

### `shared/http/client` — HttpClient
- [ ] **H** Retry backoff has no jitter (`2 ** attempt * 100`) — thundering-herd risk when many clients retry against the same upstream after a transient failure. Add full-jitter or decorrelated-jitter.
- [ ] **H** `timeout` is per-attempt but retries multiply total wall time. Add an overall `deadline` option (absolute time budget) that the retry loop respects.
- [ ] **H** `getJSON` / `postJSON` always call `await resp.json()` before checking `resp.ok`, including on 5xx. Non-JSON error bodies throw before `HTTPError` is constructed, masking the real status and aborting retries. Use `resp.text()` then attempt `JSON.parse`.
- [ ] **M** `postJSON` only treats 204 as empty; a 200/202 with empty body throws on `resp.json()`. Check `Content-Length: 0` / empty body in addition to status.
- [ ] **M** No `Retry-After` honoring on 429. The breaker fires after threshold but per-request retry should respect server-supplied delay.
- [ ] **M** `deleteJSON` / `methodJSON` do not retry, but `getJSON` / `postJSON` do — inconsistent retry semantics across methods. Consolidate into a single internal `_request` that all verbs share (mirror `BaseAdapter.request`).
- [ ] **M** Header merge casts `init?.headers as Record<string, string>` — silently drops `Headers` / array-of-tuples forms; replace with `new Headers(...)` and `.forEach(set)`.
- [ ] **M** No way to inject a custom `fetch` (testability + instrumentation). Accept `fetch?: typeof fetch` in `HttpClientOptions`.
- [ ] **M** External `AbortSignal` from `init.signal` is dropped — internal controller fully replaces it. Compose both signals (`AbortSignal.any([userSignal, timeoutController.signal])`).
- [ ] **L** Circuit breaker host map is per-instance; multiple `HttpClient` instances pointing at the same upstream don't share state. Optionally allow injecting a shared registry.

### `api/adapters/base` — BaseAdapter
- [ ] **H** Duplicates retry/timeout/abort logic from `HttpClient` instead of composing it. Refactor `BaseAdapter` to wrap an `HttpClient` instance — single source of truth for retry, jitter, circuit breaker, deadline.
- [ ] **M** No request-ID / correlation-ID forwarding. Already noted as L under `adapters/base`; bump to M — this is essential for distributed tracing across the Go ↔ TS service mesh.
- [ ] **M** `serviceToken` is captured in the constructor; no rotation hook. Accept a `tokenProvider: () => Promise<string>` for refresh on 401.
- [ ] **L** Same no-jitter retry issue as `HttpClient` — fix together.

### `shared/http/websocket` — WebSocketClient
- [ ] **H** `messageQueue` is unbounded — a long disconnect can OOM the process. Add `maxQueueSize` with drop-oldest / drop-newest policy.
- [ ] **H** Heartbeat sends `{type:'ping'}` but never tracks pong responses or a missed-heartbeat counter — cannot detect zombie / half-open connections. Track last-pong timestamp; force-close after N missed.
- [ ] **M** Reconnect backoff has no jitter — synchronized reconnect storms after a server restart.
- [ ] **M** First `connect()` promise rejects on `onerror`, but later reconnect failures bubble through `onError` handlers only — the caller can't `await` for "connection finally lost". Add a `closed` event or a `terminated` promise.
- [ ] **L** No `AbortSignal` support — consumer can't cancel a pending reconnect except by calling `close()`.

### `shared/security` — crypto + JWT
- [ ] **H** JWT signing/verification is HS256-only and uses a shared secret. Production deployments with multiple services need asymmetric verification (RS256/ES256) and key rotation via JWKS. Add `signJWT_RS256(payload, privateKey)`, `verifyJWT_RS256(token, jwksURL)` using `jose`'s `createRemoteJWKSet` with cache + cooldown.
- [ ] **H** `authMiddleware` accepts only `secret: string` — extend to accept `{ secret } | { jwksUri } | { keyResolver }` and route to the appropriate verifier.
- [ ] **M** `encryptAES256GCM` takes no Additional Authenticated Data (AAD). For envelope encryption / tamper detection on context (e.g. user ID bound to ciphertext) add an optional `aad` parameter to both encrypt and decrypt.
- [ ] **M** No key-version prefix in the encrypted output (`iv:ct:tag`). Adding a version byte / `v1:` prefix now enables zero-downtime key rotation later.
- [ ] **M** No constant-time string compare helper (`timingSafeEqual` wrapper). Comparisons of HMAC signatures, API keys, CSRF tokens must use constant-time compare; export one.
- [ ] **M** `ALLOWED_SCOPES` is hard-coded in the SDK. Each service has its own scope vocabulary; accept the allowlist via construction (`createScopeValidator(scopes)`).
- [ ] **L** `ipInCIDR` in middleware is IPv4-only and undefined for `/0`; refactor to use a vetted CIDR library or add IPv6 support.
- [ ] **L** `signJWT` re-encodes `secret` to bytes on every call. Cache a `Uint8Array` form or accept `CryptoKey` / `Uint8Array` directly.

### `shared/redaction` — redact paths
- [ ] **M** Hard-coded path list. Different log streams need different redaction (e.g. an audit log must retain `email` to be useful). Export a `createRedactor(opts)` factory and let each logger pick its policy.
- [ ] **L** Wildcards only cover one level (`*.password`). For nested DTOs (`order.customer.email`) the current pattern set won't catch deep PII. Add explicit deep paths used by adapter models.

### `api/observability` — metrics + shutdown
- [ ] **H** Histogram stores every observation in `values: number[]` but never reads them — unbounded memory leak under load. Either drop the array (only `count` + `sum`) or replace with a bucketed/HDR histogram and compute percentiles on snapshot.
- [ ] **M** No label / tag support — every metric is a flat name. Real-world dashboards need `http_requests_total{method,route,status}`. Either bake in label support or pivot to OpenTelemetry from the start (already TODO'd; treat the homebrew metric as scaffolding, not the destination).
- [ ] **M** `prometheusText()` is not fully compliant — missing `# HELP` lines, no labels, summary type emitted without quantiles. Either fix or remove (consumers who hit `/metrics` expecting Prometheus will silently get bad data).
- [ ] **M** `onShutdown` calls `process.exit` immediately after `cleanup()` resolves — does not drain in-flight HTTP requests. Accept the HTTP server / Bun server handle and call its native graceful-stop.

### `shared/http/handlers/health`
- [ ] **M** Redesign readiness handler to align with forge-sdk-go `api/handlers/health` — replace `readinessHandler(checks: Record<string, boolean>)` with `newReadyHandler(checkers: Checker[], options?: { ttlMs?: number }): Handler`; `Checker` type is `{ name: string; check: (signal?: AbortSignal) => Promise<void> }` (throws on failure, error message passed through in 503 body as `[{ dep: name, error: message }]`); results cached in-process in a `Map<string, { error: unknown; expiresAt: number }>` protected by TTL check on read — no Redis, no external infra, resets on process restart (intentional: cold start forces a real dep check before traffic is routed); TTL defaults to 10s via `options.ttlMs` and should be ≤ ALB `HealthCheckIntervalSeconds`; the existing static `livenessHandler` is preserved and stays `GET /health`; `newReadyHandler` registers at `GET /health/ready`
- [ ] **M** Ship built-in `Checker` factories to mirror Go SDK: `dynamoDBChecker(name, client, tableName)` — `DescribeTable`; `redisChecker(name, client)` — `PING`; `s3Checker(name, client, bucket)` — `HeadBucket`; `httpChecker(name, url, timeoutMs?)` — GET with 2s default, 2xx required; export `checkerFn(name: string, fn: (signal?: AbortSignal) => Promise<void>): Checker` adaptor for custom checks; services wire readiness in 2–3 lines with no custom check code
- [ ] **L** Document that liveness (`GET /health`) covers startup for ECS Fargate — the container is not routed traffic until `/health/ready` passes, which is the correct startup gate; only add a separate startup probe if a service has a known long init phase (e.g. large model loading)

### `shared/http/errors`
- [ ] **M** `buildErrorResponse` accepts a free-form `detail` that is sent directly in the response. Several middleware sites pass `err.message` — which on JWT failures includes library internals (`"JWSSignatureVerificationFailed"` etc.). Strip / map errors to a stable catalog before sending.
- [ ] **L** 401 responses don't set `WWW-Authenticate: Bearer realm="..."` — required by RFC 6750 for proper client behavior.

### `shared/logging/loggers/runtime`
- [ ] **M** Singleton via `#instance` silently ignores the second constructor's config — surprising for tests and for any consumer that boots two service contexts in one process. Either throw on re-init with a different config, or remove the singleton and let consumers manage lifetime.
- [ ] **M** No child-logger / bound-fields API (`logger.child({requestId})`). Without it, every call site must thread `requestId` manually through `details`.
- [ ] **L** `redact(event as unknown as Record<string, unknown>)` casts away type safety on every emission. Type the redactor's input as `BaseLogEvent`.

### `api/config/configurator`
- [ ] **H** `Configurator` class is empty — referenced by exports but does nothing. Either implement (per `api/config` TODOs: env loading, multi-profile) or remove from public exports until ready.

---

## Hardening — Audit Additions (2026-05-13)

### Middleware ordering + chain hygiene
- [ ] **M** Document the canonical middleware order (and add an exported `defaultChain()` helper) — current API allows arbitrary ordering, but several middlewares have hard ordering requirements (request ID before telemetry; client source before CSRF/idempotency; auth before scope checks).
- [ ] **M** Per-request context (`WeakMap<Request, ...>`) breaks when any middleware constructs a new `Request`. Replace `WeakMap` with an `AsyncLocalStorage`-backed context (Node ≥18) so context survives request rewrapping.
- [ ] **M** Add a `bodySizeLimitMiddleware(maxBytes)` — currently any handler that reads `req.json()` is vulnerable to memory exhaustion via large bodies.
- [ ] **M** Add a `contentTypeAllowlistMiddleware` — reject unexpected content types before they reach handlers.
- [ ] **L** Add `requestTimeoutMiddleware` — caps total handler wall time independent of upstream timeouts.

### Runtime input validation
- [ ] **H** (Already listed under General SDK Health) Add Zod / valibot. Concrete acceptance criteria: every adapter method validates its response with `schema.parse`; every server handler validates request body + query + path params before invoking business logic; validation failures emit `Global.UnprocessableEntity` with a field-level error array.

### Supply chain & release hygiene (expansion of existing SDK Health)
- [ ] **H** Enforce `pnpm install --frozen-lockfile` in CI; fail PR if `pnpm-lock.yaml` would change.
- [ ] **H** Add `audit-ci` (or `pnpm audit --prod --json | audit-ci`) step to `build.yml` with severity gate at "high".
- [ ] **H** Enable Dependabot or Renovate with grouped weekly PRs (security alerts immediate).
- [ ] **M** Publish with `--provenance` (npm provenance / SLSA-3 attestation) once moving to `npm.pkg.github.com`.
- [ ] **M** Generate CycloneDX SBOM on release (`@cyclonedx/cyclonedx-npm`) and attach to the GitHub release.
- [ ] **M** Add `"sideEffects": false` to `package.json` — enables aggressive tree-shaking in consumer bundles. (Verify no module relies on import-time side effects first — currently the logging singleton initializes only on construction, OK.)
- [ ] **M** Add `engines.node` field (`">=20.18"` for native `fetch`, `AbortSignal.any`, stable Web Crypto).
- [ ] **M** Add `.npmrc` pinning `engine-strict=true` (paired with the existing `.nvmrc` TODO).
- [ ] **M** Expand `prepublishOnly` to run `pnpm run lint && pnpm run test && tsc --noEmit` — current script only rebuilds.
- [ ] **L** Add `@microsoft/api-extractor` to produce a single `.d.ts` rollup and detect accidental public API breaks across releases.
- [ ] **L** Sign tagged releases (Sigstore / `cosign`).
- [ ] **L** Add CODEOWNERS for `src/shared/security` and `src/api/middleware` to require security-team review.

### TypeScript config hardening
- [ ] **M** Audit `tsconfig.json` for: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`, `noPropertyAccessFromIndexSignature: true`. Each catches a category of real bugs visible in current code (e.g. `init?.headers as Record<string, string>` casts).

### Observability roadmap consolidation
- [ ] **M** The TODO file currently has OpenTelemetry items under both `api/logging/telemetry` and `api/observability`. Pick one home (recommend `api/observability`) and consolidate — split telemetry-as-business-events (clickstream / interaction) from telemetry-as-tracing (OTel spans).
