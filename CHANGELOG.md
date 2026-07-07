# Changelog

All notable changes to `@komodo-forge-sdk/typescript` will be documented here.

---

## [0.6.1] — 2026-07-06

### Changed
- **BREAKING: `aws/constants.ts` sub-namespace re-exports dropped their `Constants` suffix** — `auroraConstants` → `aurora`, `cloudfrontConstants` → `cloudfront`, `cloudwatchConstants` → `cloudwatch`, `dynamodbConstants` → `dynamodb`, `elasticacheConstants` → `elasticache`, `lambdaConstants` → `lambda`, `s3Constants` → `s3`, `secretsManagerConstants` → `secretsManager`, `sesConstants` → `ses`, `snsConstants` → `sns`, `sqsConstants` → `sqs`. Known consumer impact: `komodo-auth-api`'s `deploy/cdk/main.ts` references `awsConstants.dynamodbConstants`, `awsConstants.cloudwatchConstants`, and `awsConstants.elasticacheConstants` directly — those call sites need updating to the new names before that repo can bump past `v0.6.0`.

## [0.6.0] — 2026-07-06

### Added
- **`aws/cdk/constructs` — `RotationFailureAlarm`.** Thin preset over `MetricFilterAlarm` scoped to secret-rotation reload failures (e.g. a signing-key or client-registry hot-reload silently failing). Consuming services instantiate one per rotating secret via a `label` prop instead of hand-writing a CloudWatch Logs Insights filter pattern per secret.

## [0.5.2] — 2026-07-04

### Added
- **`src/constants.ts`** — new Komodo-branding constants (`KOMODO_NAMESPACE`, `KOMODO_NAMESPACE_SHORT`, `KOMODO_NAME_FULL`, `KOMODO_NAME_SHORT`, `KOMODO_LEGAL_TYPE`) and app-default constants (`DEFAULT_HEALTH_CHECK_PATH`, `DEFAULT_EVAL_RULES_PATH`, `DEFAULT_HEALTH_CHECK_COMMAND`, `DEFAULT_APP_VERSION`)
- **`src/aws/constants.ts`** — `DEFAULT_REDIS_PORT`, `WAF_MANAGED_RULE_COMMON`, `WAF_MANAGED_RULE_KNOWN_BAD_INPUTS`, `CLOUDWATCH_NAMESPACE_ALB`, and `METRIC_TARGET_RESPONSE_TIME`

### Changed
- **BREAKING: `aws/constants.ts` region exports renamed** — `AWS_REGIONS` → `REGIONS`, every `AWS_REGION_*` constant → `REGION_*` (e.g. `AWS_REGION_EAST1` → `REGION_EAST1`), and the exported types `AWSRegion`/`AWSRegionKey` → `Region`/`RegionKey`; `aws/cdk/config/index.ts` updated to import `Region` from the renamed module
- **BREAKING: namespace exports renamed** — `src/index.ts`'s `export * as constants` → `export * as globalConstants`, and `src/aws/index.ts`'s `export * as constants` → `export * as awsConstants`

## [0.5.1] — 2026-07-04

### Added
- **`src/constants.ts`** — new top-level module for env (`ENV_LOCAL`/`ENV_DEV`/`ENV_PERF`/`ENV_QA`/`ENV_STAGING`/`ENV_PROD` and their `_FULL` variants), host (`HOST_LOCAL`), and port (`DEFAULT_PORT_LOCAL`/`DEFAULT_PORT_HTTP`/`DEFAULT_PORT_HTTPS`) constants shared across Komodo apps; re-exported from `src/index.ts` as `constants`
- **`src/aws/constants.ts`** — new module with a full AWS region catalog (`AWS_REGIONS`) spanning US, EU, AP, SA, and AF regions, plus per-partition `DEFAULT_REGION_*` helpers and `AWS_REGION_*` account IDs; re-exported from `src/aws/index.ts` as `constants`
- **`src/gcp/constants.ts`** — new module with a GCP region catalog (`GCP_REGIONS`) and `DEFAULT_REGION_*` helpers; re-exported from `src/gcp/index.ts` as `constants`

### Changed
- **`aws/cdk/config`'s region/account/env constants now sourced from the new shared constants modules** — `DEFAULT_REGION_EAST`, `DEFAULT_REGION_WEST`, `DEFAULT_ACCOUNT_NONPROD`, `DEFAULT_ACCOUNT_PROD` now import from `aws/constants.ts`; `ENV_DEV`/`ENV_STAGING`/`ENV_PROD` now import from top-level `constants.ts`; `EnvConfig.env` is typed against those constants instead of `string`
- **`Region` type replaced by `AWSRegion`** (`aws/cdk/config/index.ts`) — now imported from `aws/constants.ts`

## [0.5.0] — 2026-07-03

### Added
- **`FargateService.requireExplicitSecurityGroups`** — constructor now throws when set and either `albSecurityGroup` or `taskSecurityGroup` is omitted, closing a gap where the flag existed on the props type but was never enforced
- **`LambdaFunction` construct** — new `constructs/lambda.ts`, replacing the removed builder-pattern Lambda helper; creates a bounded-retention log group (`RetentionDays.ONE_WEEK`) when `logGroup` isn't supplied, matching the SDK's other log group defaults
- **`resolveDeployColor()`** — reads `DEPLOY_COLOR` from the environment, defaulting to `'blue'`
- **`FargateService.deployColor`** — new prop that drives real blue/green traffic cutover: when `enableBlueGreen` is set, `deployColor` picks which target group receives the ALB listener's default action (all traffic, no header required), while the other color stays reachable only via the `X-Deploy-Color` header for pre-cutover canary verification. Flipping `DEPLOY_COLOR` (via `resolveDeployColor()`, wired into each CDK app entrypoint) and redeploying swaps which color is live — this is the actual cutover mechanism, not the header itself. `FargateService` stays pure: callers resolve the color and pass it in, the construct never reads `process.env` directly
- **`constructs/` gains ten Construct classes**, replacing every remaining builder-pattern helper (`XxxBuilder` + `createXxx(stack, ...)` + `.build()`) with a standard `new Xxx(scope, id, props)` subclass of `Construct`, matching the existing `WafWebAcl` / `MetricFilterAlarm` style:
  - `LogGroup` (`constructs/logGroup.ts`, was `observability/logs.ts`'s `createLogGroup(stack)...build()`)
  - `Alarm` (`constructs/alarm.ts`, was `observability/alarms.ts`'s `createAlarm(stack, metric)...build()`; the old `addAlarmAction(s)` / `addOkAction(s)` / `addInsufficientDataAction(s)` accumulator methods are now plain `alarmActions` / `okActions` / `insufficientDataActions` array props)
  - `SnsTopic` (`constructs/snsTopic.ts`, was `messaging/sns.ts`'s `createSnsTopic(stack)...build()`; `addSubscription()` is now a `subscriptions` array prop)
  - `SqsQueue` (`constructs/sqs.ts`, was `messaging/sqs.ts`'s `createSqsQueue(stack)...build()`; `addSubscription()` is now a `subscriptions` array prop)
  - `Vpc` (`constructs/vpc.ts`, was `networking/vpc.ts`'s `createVpc(stack)...build()`; `addSubnetGroup()` is now a `subnetGroups` array prop)
  - `SecurityGroup` (`constructs/securityGroup.ts`, was `networking/securityGroups.ts`'s `createSecurityGroup(stack, vpc)...build()`; `addIngressRule(s)` / `addEgressRule(s)` are now `ingressRules` / `egressRules` array props)
  - `IamRole` and `attachPermissions` (`constructs/iamRole.ts`, was `security/iam.ts`'s `createIamRole(stack)...build()`; `addInlinePolicy()` / `addManagedPolicy()` are now `inlinePolicies` / `managedPolicies` props)
  - `IamPolicy` (`constructs/iamPolicy.ts`, split out of `security/iam.ts`'s `createIamPolicy(stack)...build()`; `addStatement(s)` / `attachToRole(s)` / `attachToUser(s)` / `attachToGroup(s)` are now `statements` / `roles` / `users` / `groups` array props)
  - `KmsKey` (`constructs/kms.ts`, was `security/kms.ts`'s `createKmsKey(stack)...build()`; `addAdministrator(s)` is now an `administrators` array prop)
  - `Secret` (`constructs/secrets.ts`, was `security/secretsManager.ts`'s `createSecret(stack)...build()`; `addGrantTarget(s)` is now a `grantTargets` array prop)

  All defaulting and conditional-prop logic that used to live in each builder's `.build()` moved into the constructor unchanged; every prop interface dropped its `stack: cdk.Stack` field (the outer `scope` constructor argument replaces it), and `SecurityGroupConfig`/`SecurityGroupProps` folded the old separate `vpc` constructor argument into the props object.
- **`config/index.ts` gains `ENV_DEV`, `ENV_STAGING`, `ENV_PROD`** — moved from the removed `constants.ts` since `config/validators.ts` is now the only other consumer and imports them from `./index.js` directly

### Fixed
- **`FargateService` blue/green target group registration** — the green target group rule was registered with a `priority` but no routing `conditions`, which CDK rejects at synth time; added a header-based condition so `enableBlueGreen: true` synths successfully
- **`Secret` construct's `secretStringValue`** — now built via `cdk.SecretValue.unsafePlainText(...)` instead of casting the raw string to `any`, which failed at synth time with `unsafeUnwrap is not a function` since `secretsmanager.Secret` expects a `cdk.SecretValue` instance, not a plain string
- **`defaultStgConfig()` missing `us-west-2`** — `regions` only listed `us-east-2`, inconsistent with `defaultProdConfig()`'s two-region default and with the `[0.4.0]` entry above stating staging should default `us-west-2` to `enabled: true`; added the `us-west-2` region entry so `defaultStgConfig()` now returns both regions by default, matching prod

### Removed
- **`compute/` module** (`fargate.ts`, `lambda.ts`, `index.ts`, `index.test.ts`) — unused builder-pattern Fargate/Lambda helpers superseded by the `constructs/` Construct classes
- **`messaging/`, `networking/`, `observability/`, `security/` modules** — deleted entirely (implementations, tests, and barrel `index.ts` files); their contents now live flat in `constructs/` as the Construct classes listed above
- **`deploy/cdk/constants.ts`** — deleted; its exports were redistributed:
  - `ENV_DEV`, `ENV_STAGING`, `ENV_PROD` moved into `config/index.ts` (still exported from the `./aws/cdk` and `./aws/cdk/config` subpaths)
  - `DEFAULT_REGION_EAST`, `DEFAULT_REGION_WEST`, `DEFAULT_ACCOUNT_NONPROD`, `DEFAULT_ACCOUNT_PROD` inlined as unexported local constants in `config/index.ts` — they had no consumers outside that file
  - `ENV_LOCAL`, `ENV_DEV_FULL`, `ENV_STAGING_FULL`, `ENV_PROD_FULL`, `US_EAST_1`, `US_EAST_2`, `US_WEST_1`, `US_WEST_2`, `HOST_LOCALHOST`, `DEFAULT_PORT`, `DEFAULT_PORT_HTTPS`, `DEFAULT_PORT_GRPC`, `DEFAULT_HEALTH_CHECK_PATH`, `DEFAULT_HEALTH_CHECK_COMMAND`, `DEFAULT_EVAL_RULES_PATH` deleted outright — dead code, unused anywhere in this SDK or by either downstream consumer
  - the `"./cdk/constants"` subpath export removed from `package.json` — there is no longer a file for it to point to

### Changed
- **AWS code consolidated under `src/aws/`** — `src/deploy/cdk/` moved to `src/aws/cdk/`, and `src/api/aws/*` (`aurora`, `cloudfront`, `cloudwatch`, `dynamodb`, `lambda`, `s3`, `secrets-manager`, `ses`, `sns`, `sqs`) moved up to top-level `src/aws/*`, so all AWS-specific SDK code now lives under one `src/aws/` root; `package.json` exports gained `"./aws"` / `"./aws/*"` and lost `"./cdk"` / `"./cdk/*"`
- **`src/shared/` split up and deleted** — `logging`, `redaction`, `security`, and `utils` moved up to top-level `src/*` roots alongside `api`, `aws`, `gcp`; `package.json` exports gained `"./logging"`, `"./redaction"`, `"./security"`, `"./utils"` and lost `"./shared"` / `"./shared/*"`
- **`http/errors` and `http/handlers/health` moved into `src/api/http/`** — the only consumer of either was `/api`, so they no longer sit in a shared root folder implying reuse that didn't exist; `src/api/index.ts` gained an `http` barrel. Root `src/http/` now holds only the genuinely generic, currently-unused `client` (fetch wrapper) and `websocket`; `package.json` exports kept `"./http"` / `"./http/*"` for those
- **`http/utils`'s `getCorrelationId` moved into `src/logging/common/correlation.ts`** — it had exactly one caller (logging's clickstream/interaction loggers), so logging no longer imports across into a separate root folder for it

### Removed
- **`src/ui/` deleted** — was a stub (empty `services/index.ts`, empty `utils/browser.ts`, only real content was `utils/pagination.ts`, which wasn't even wired into the module's own barrel); `package.json` lost `"./ui"` / `"./ui/*"`, and the root `src/index.ts` no longer re-exports it

---

## [0.4.2] — 2026-10-13

### Fixed
- **Release script** — fixed commit check to skip commit if nothing is staged

---

## [0.4.1] — 2026-06-29

### Removed
- **`FargatePublicService`, `FargatePrivateService`, `FargateServiceBase`** — deleted; each API owns its own CDK Fargate wiring directly

### Changed
- **`DEFAULT_ACCOUNT_DEV` / `DEFAULT_ACCOUNT_STAGING`** — consolidated into `DEFAULT_ACCOUNT_NONPROD` (`122703641091`); both dev and staging default configs now reference it
- **`.gitignore`** — expanded to cover env file patterns, cache dirs (`.cache/`, `.pnpm-store/`), OS artifacts, IDE files (`.idea/`, `.vscode/`), and AI tool files (`AGENTS.md`, `CLAUDE.md`, `.mcp.json`)

---

## [0.4.0] — 2026-06-22

### Added
- **Biome formatter** — tabs, single quotes, trailing commas, 120-char line width, import organization; CI-gated via `format:check`
- **Config validators** — `isValidARN`, `isValidDomain`, `isValidCpu`, `isValidMemory`, `isValidCapacity`, `isValidEnvironment`, `isValidVersion`, `isValidRegion`, `isValidRegionDeploy`, `isValidAccount`, `isValidTags`, `isValidUpstreamDownstreamUrl`, `validateConfig`
- **`env` field on `EnvConfig`** — explicit environment identifier (`dev`/`staging`/`prod`), separate from `name` (service name)
- **`tags` field on `EnvConfig`** — `Record<string, string>` propagated via `cdk.Tags.of(stack).add()`; default configs include `owner`, `managedBy`, `environment`
- **`createRegionDeploy` helper** — factory for `RegionDeploy` objects
- **`release.sh` version-match guard** — release fails if CHANGELOG version doesn't match package.json / target version
- **`Region` type export** — extracted from `RegionDeploy` for reuse

### Changed
- **`EnvConfig.name`** — now represents the service/app name (defaults to `''`); previously carried the environment value
- **Default config tag keys** — standardized to lowercase (`owner`, `managedBy`, `environment`) to match `TagsConfig` interface
- **`TagsConfig`** — expanded with `version`, `tier`, `autoStart`, `dataClassification` fields
- **`createTags`** — defaults `owner` to `'Komodo Future Solutions'` and `managedBy` to `'cdk'` when called without args
- **`defaultTags`** — returns `managedBy: 'cdk'` (was `'Komodo Future Solutions'`)
- **Staging/prod regions** — `us-west-2` now `enabled: true` by default

## [0.3.3] — 2026-06-22

### Changed
- **FargatePublicService / FargatePrivateService** — extracted shared logic (task def, container, secret grant, auto-scaling, CPU/memory alarms) into `buildFargateService` helper to eliminate duplication
- **WafWebAcl** — `scope` is now configurable (`'REGIONAL'` | `'CLOUDFRONT'`), defaults to `'REGIONAL'`
- **MetricFilterAlarm** — `metricValue` and `defaultValue` are now configurable props with existing defaults

## [0.3.2] — 2026-06-22

### Added
- **CDK Constructs** — Higher-level reusable infrastructure constructs:
  - `FargatePublicService` — complete public-facing Fargate service with ALB, SGs, auto-scaling, and standard alarms
  - `FargatePrivateService` — VPC-internal Fargate service with SGs, auto-scaling, and standard alarms
  - `WafWebAcl` — WAF WebACL with managed rule groups, global rate limiting, and path-scoped rate limits
  - `MetricFilterAlarm` — combined CloudWatch Logs metric filter and alarm
- Tests for all new constructs

## [0.3.1] — 2026-06-22

### Fixed
- **Observability barrel export** — `src/deploy/cdk/observability/index.ts` was empty; now re-exports `alarms` and `logs` modules
- **Missing package exports** — added `./cdk` barrel export and `./cdk/constants` export to package.json

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
