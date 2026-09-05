# Project Backlog

## Convention Legend
* **Priority Tagging:** `[C]` Critical | `[H]` High | `[M]` Medium | `[L]` Low
* **Status Indicators:** `[TODO]` | `[IN_PROGRESS]` | `[BLOCKED]` | `[DONE]`
* **Hierarchy ID:** `EPIC-XX` -> `TG-XX.Y` (Task Group) -> `TSK-XX.Y.Z` (Task) -> `SUB-XX.Y.Z.N` (Subtask)

---

## [EPIC-01] Now, V1
*Goal: Close the security gaps and test-coverage blind spots in the HTTP middleware before wider frontend adoption*

### [TG-01.1] Cross-Cutting
* **Target Release:** V1

#### [TSK-01.1.1] Fix vitest test-discovery config to run the full suite, not just `logging/**` and `aws/cdk/**` [P: H] [TODO]
* **SUB-01.1.1.1** `vitest.config.ts`'s `include`/`coverage.include` silently skip 18 of 49 test files, including every security test (`security/index.test.ts`, `http/client/client.test.ts`, `redaction/index.test.ts`) and all `api/adapters/*` tests — `pnpm test` reports green while testing none of them
  * **Done when:** `pnpm exec vitest list 2>/dev/null | wc -l` reports test counts across all 49 files (not just `logging/**`/`aws/cdk/**`), and `pnpm test` exits 0

#### [TSK-01.1.2] Fix CSRF middleware to actually validate the double-submit cookie [P: H] [TODO] (after: "Fix vitest test-discovery config to run the full suite, not just `logging/**` and `aws/cdk/**`")
* **SUB-01.1.2.1** `csrfMiddleware` (`src/api/middleware/index.ts:244`) only checks that `x-csrf-token` is present and non-empty — it never compares it to the CSRF cookie, so any junk header value passes; the doc comment claims "double-submit cookie" protection it doesn't implement
  * **Done when:** `pnpm exec vitest run src/api/middleware/index.test.ts -t csrf` exits 0, with a case asserting a request where the header value differs from the cookie value is rejected

#### [TSK-01.1.3] Fix rate limiter to stop trusting a raw client-supplied `X-Forwarded-For` and to fail closed by default [P: H] [TODO] (after: "Fix vitest test-discovery config to run the full suite, not just `logging/**` and `aws/cdk/**`")
* **SUB-01.1.3.1** `rateLimiterMiddleware`'s default key function (`src/api/middleware/index.ts:289`) reads `x-forwarded-for`'s first entry with no trusted-proxy validation, and `RATE_LIMIT_FAIL_OPEN` defaults to `true` — an attacker rotates the header per request for unlimited throughput
  * **Done when:** `pnpm exec vitest run src/api/middleware/index.test.ts -t "rate limit"` exits 0, with cases proving a spoofed `X-Forwarded-For` doesn't bypass limiting and the default `failOpen` is `false`

#### [TSK-01.1.4] Replace the denylist-regex "sanitization" with reject-on-boundary validation [P: H] [TODO] (after: "Fix vitest test-discovery config to run the full suite, not just `logging/**` and `aws/cdk/**`")
* **SUB-01.1.4.1** `sanitizeStr` (`src/api/middleware/index.ts:387`) strips SQL/XSS substrings out of headers, query params, and JSON bodies in place — bypassable, and it silently corrupts legitimate input (e.g. a name containing "select" or "drop"); the Go SDK deliberately rejects on null byte/CRLF/path-traversal instead of mutating content
  * **Done when:** `pnpm exec vitest run src/api/middleware/index.test.ts -t sanitization` exits 0, asserting legitimate strings pass through unmodified and null-byte/CRLF/path-traversal input is rejected (400), not silently rewritten

#### [TSK-01.1.5] Require an explicit CORS origin allowlist; never default to `*` when credentials are allowed [P: M] [TODO] (after: "Fix vitest test-discovery config to run the full suite, not just `logging/**` and `aws/cdk/**`")
* **SUB-01.1.5.1** `corsMiddleware` (`src/api/middleware/index.ts:206`) defaults `allowedOrigins` to `['*']` and reflects the caller's `Origin` header; paired with `allowCredentials: true` this is the wildcard-plus-credentials account-takeover pattern
  * **Done when:** `pnpm exec vitest run src/api/middleware/index.test.ts -t cors` exits 0, asserting construction throws (or credentials are dropped) when `allowedOrigins` includes `*` and `allowCredentials` is `true`

#### [TSK-01.1.6] Pin the expected JWT algorithm and verify `iss`/`aud` in `authMiddleware` [P: M] [TODO] (after: "Fix vitest test-discovery config to run the full suite, not just `logging/**` and `aws/cdk/**`")
* **SUB-01.1.6.1** `authMiddleware` (`src/api/middleware/index.ts:130`) calls `verifyJWT(token, secret)` with no `algorithms`/`issuer`/`audience` options, so a token minted for a different service or audience sharing the same secret is accepted
  * **Done when:** `pnpm exec vitest run src/api/middleware/index.test.ts -t auth` exits 0, asserting a token with an unexpected `alg`, wrong `iss`, or wrong `aud` is rejected

#### [TSK-01.1.7] Add jitter to `HttpClient` retry backoff and stop retrying non-idempotent writes without an idempotency key [P: M] [TODO]
* **SUB-01.1.7.1** `getJSON`/`postJSON` (`src/http/client/client.ts:195,233`) retry on 5xx/network error with plain exponential backoff (no jitter) and no idempotency key — a retried POST can double-execute a write
  * **Done when:** `pnpm exec vitest run src/http/client/client.test.ts -t retry` exits 0, asserting jittered backoff timing and that `postJSON` without an idempotency key surfaces the failure instead of silently retrying a write

#### [TSK-01.1.8] Promote a generic in-memory TTL cache to the SDK — currently duplicated independently by two frontend consumers [P: M] [TODO]
* **SUB-01.1.8.1** `komodo-ssr-engine-vue` (`src/cache/index.ts`) hand-rolls a generic `Cache<T>` (TTL + max-size eviction + `lastAccessed`/`etag` tracking) with an open `// TODO - eventually move these to the SDK`; `komodo-ssr-engine-svelte` (`src/lib/server/cache`) maintains its own separate cache implementation solving the same problem; the SDK currently exports only a remote client (`src/aws/elasticache`), no local/in-process cache utility
  * **Done when:** a new cache module (e.g. `src/utils/cache.ts`) ships with `pnpm exec vitest run` passing for get/set/TTL-expiry/max-size-eviction, and is exported via `package.json#exports`

#### [TSK-01.1.9] Stop forcing `Cache-Control: no-store` on every response [P: L] [TODO]
* **SUB-01.1.9.1** `securityHeadersMiddleware` (`src/api/middleware/index.ts:187`) unconditionally overwrites `Cache-Control`, defeating caching on cacheable `GET` responses
  * **Done when:** `pnpm exec vitest run src/api/middleware/index.test.ts -t "security headers"` exits 0, asserting the middleware doesn't override an already-set `Cache-Control` header

#### [TSK-01.1.10] Expose the target group as a readonly field on `FargateService` for the non-blue-green path [P: M] [TODO]
* **SUB-01.1.10.1** `src/aws/cdk/constructs/fargate.ts` exposes `blueTargetGroup`/`greenTargetGroup` when `enableBlueGreen` is set, but the non-blue-green `else` branch (line ~181) attaches via `httpsListener.addTargets('Target', {...})` (line ~256) with no reference kept — a consumer has no target group to point a `TargetGroup UnHealthyHostCount` alarm at. komodo-auth-api's deploy backlog (`TSK-01.6.9`) is blocked on this.
  * **Done when:** `pnpm exec vitest run src/aws/cdk/constructs/fargate.test.ts` exits 0, asserting `FargateService.targetGroup` is set and usable when `enableBlueGreen` is false

---

## Archive
*Note: use this section strictly for abandoned, shelved, or deprecated initiatives — never for finished work, which is swept out on completion, not archived.*
