# Changelog

All notable changes to `@komodo-forge-sdk/typescript` will be documented here.

---

## [0.3.0] — 2026-06-22

### Added
- **AWS CDK Deployment Templates** — Comprehensive CDK modules for infrastructure-as-code deployment:
  - **Compute** — Fargate and Lambda constructs
  - **Config** — Configuration management for CDK stacks
  - **Constructs** — Reusable CDK construct library
  - **Messaging** — SNS and SQS messaging constructs
  - **Networking** — VPC and security group constructs
  - **Observability** — CloudWatch alarms and log management
  - **Security** — IAM, KMS, and Secrets Manager constructs
- **oxlint** — Fast Rust-based linter configuration replacing ESLint
- **CHANGELOG.md** — Added changelog to track project changes
- Package exports for CDK deployment modules (`./cdk/*`)

### Fixed
- **Observability barrel export** — `src/deploy/cdk/observability/index.ts` was empty; now re-exports `alarms` and `logs` modules
- **Missing package exports** — added `./cdk` barrel export and `./cdk/constants` export to package.json

### Changed
- Replaced ESLint with oxlint for faster linting (removed eslint.config.mts and src/shared/eslint/)
- Updated package.json scripts: `lint` and `lint:fix` now use oxlint
- Updated CI workflow to use oxlint instead of ESLint
- `pnpm release` now releases the current `package.json` version when called with no arguments
- Updated dependencies to include aws-cdk-lib and constructs for CDK support

---

## [0.2.1] — 2026-06-06

### Added
- `pnpm fresh` script — wipes `node_modules`, upgrades all deps to latest, and reinstalls from scratch

### Changed
- All dependencies upgraded to latest versions
- pnpm upgraded to 11.5.2 via corepack

---

## [0.2.0] — 2026-06-06

### Added
- **Middleware** — full suite: authentication, CORS, rate limiting, request validation, and error handling
- **Observability** — OpenTelemetry tracing and metrics support
- **HTTP client** — retry logic, request/response interceptors, typed error classes (`src/shared/http/errors/`)
- **WebSocket** — full implementation of the WebSocket handler
- **Security** — new shared security utilities module (`src/shared/security/`)
- **Config** — `constants.ts` module and configurator submodule
- **Release scripts** — `scripts/release.sh` and `scripts/_lib.sh` for automated version bump, build, tag, and push
- `pnpm release` script wired up in `package.json`

### Changed
- AWS module: `dynamo` renamed to `dynamodb`, `rds` renamed to `aurora`
- Health check handler expanded
- `.gitignore` hardened — covers env files, secrets, `.claude/`, OS artifacts

---

## [0.1.0] — 2026-03-24

### Added
- Initial SDK scaffold migrated and adapted from `forge-sdk-ts`
- Top-level directory reorganization: `backend/` → `api/`, `frontend/` → `client/`
- `dist/` exports committed to repo; CI workflow added (`.github/workflows/build.yml`)
- **Logging** — full Komodo logger implementation split across: `base`, `config`, `format`, `handler`, `schema`, `logger`, `worker` (browser + Node)
- **API adapters** — auth, entitlements, events, feature-flags, payments, user (each with adapter, models, index, and test stub)
- **AWS wrappers** — CloudFront, CloudWatch, DynamoDB, Lambda, RDS, S3, Secrets Manager, SES, SNS, SQS
- **Client utilities** — browser helpers, pagination, service stubs
- **Shared modules** — concurrency, crypto, HTTP (client, correlation, utils), redaction, utils (formatting, objects, type-guards, validation)
- **Config** — configurator, types, utils with full test coverage
- **ESLint config** exported from `shared/eslint`
- Test stubs added across all modules (vitest)
