# /api/advisor Reliability Plan

**Status:** Planned — diagnostics first, then fixes #1/#3/#4/#6, #2 pending Redis decision, #5 deferred.
**Date:** 2026-06-10
**Scope:** `src/app/api/advisor/route.ts` and its support modules (`rate-limit.ts`, `tokenBudget.ts`, `responseCache.ts`, `circuitBreaker.ts`, `conversation.ts`).

> Note: the issue numbering below was re-derived from a fresh code audit; the
> constraints are: #1 = timeout, #4 = P2034, #2 = needs Redis decision,
> #1/#3/#4/#6 = small low-risk code changes, #5 = larger deferred change.

---

## The issue list

| # | Issue | Symptom in prod | Fix size |
|---|-------|-----------------|----------|
| 1 | No `maxDuration` on the advisor route; it makes **two sequential OpenAI calls** (main completion + orchestrator dispatch) plus RAG + 3–5 DB round-trips | `FUNCTION_INVOCATION_TIMEOUT` → user sees a dead request / 504 | Small |
| 2 | `advisorCache` (in-memory LRU) and `openaiCircuit` (in-memory singleton) are **per-lambda-instance** — cache rarely hits, circuit breaker never trips coherently across instances | Wasted OpenAI spend, breaker ineffective | Needs Redis decision |
| 3 | **Fire-and-forget DB writes are killed when Vercel freezes the function** after the response returns: `recordTokenUsage()` (tokenBudget.ts:65), rate-limit cleanup `deleteMany` (rate-limit.ts:118), `clearLoginAttempts()` (rate-limit.ts:50) | Token usage under-counted (budget enforcement drifts); stale `RateLimit` rows never purged → table grows → slower counts → worse #1 and #4 | Small |
| 4 | `checkRateLimit()` runs a **`Serializable` interactive transaction** (rate-limit.ts:89–115) with no retry. Two concurrent requests from the same user/IP conflict → Prisma throws **P2034** → unhandled → generic 500 | User gets "Failed to process AI governance request" on a request that should have succeeded | Small |
| 5 | Latency architecture: main completion (up to 4k tokens) **then** `dispatchOrchestrator` (another OpenAI call) run serially in one request | Root cause of #1's pressure; p95 latency | **Deferred** — move artifact generation behind `after()`/background job, or migrate clients to `/api/advisor/stream` |
| 6 | Error handling in the route's catch block: P2034/P2028 (transaction conflicts/timeouts) fall through to a generic 500 that **leaks `details: errorMessage`** to the client; transient DB errors aren't surfaced as retryable | Confusing UX, internal details exposed, clients don't retry | Small |

Interplay worth knowing: #3 makes #4 worse over time (uncleaned `RateLimit` rows slow the serializable transaction, widening the conflict window), and #4 + slow DB makes #1 more likely. Fixing #3 and #4 reduces — but does not eliminate — timeout pressure; #1's `maxDuration` bump is still required.

---

## Phase 0 — Diagnostics: confirm which failure is hitting users

Goal: confirm whether `FUNCTION_INVOCATION_TIMEOUT` (#1) or `P2034` (#4) dominates, and get a baseline to verify the fixes against.

1. **Vercel dashboard (best for history):** Project → **Observability → Logs**, filter:
   - `route: /api/advisor`
   - Search `FUNCTION_INVOCATION_TIMEOUT` — note count over last 7 days and the duration at kill time.
   - Search `P2034` (it appears in the `request.failed` auditLog line as `error: ... P2034 ...`).
   - Also check **Observability → Functions** for `/api/advisor` p50/p95/p99 duration vs. the plan's default limit.
2. **CLI alternative** (requires `vercel login` + `vercel link`; only streams recent/live logs):
   ```bash
   vercel logs <production-deployment-url> --json | grep -E 'FUNCTION_INVOCATION_TIMEOUT|P2034|request.failed'
   ```
3. **Record baseline:** errors/day per type, p95 duration, and `RateLimit` table row count (`SELECT count(*) FROM "RateLimit";`) — fix #3 should freeze that growth.

Decision gate: whichever error dominates gets verified first after deploy, but **all four fixes ship regardless** — both failure modes are real in the code.

---

## Phase 1 — The four small fixes (implement now, one commit each)

### Fix #1 — `maxDuration` on LLM routes

**File:** `src/app/api/advisor/route.ts` (and `src/app/api/advisor/stream/route.ts`, plus any other OpenAI-calling routes found by `grep -rl "chat.completions" src/app/api`).

```ts
export const maxDuration = 60; // seconds; two sequential OpenAI calls + RAG + DB
```

- 60s is safe on all current Vercel plans (Hobby max is 60s; Pro allows more).
- This is a stopgap that buys headroom; #5 is the real latency fix.
- **Risk:** none — config-only.
- **Verify:** `FUNCTION_INVOCATION_TIMEOUT` count drops to ~0 in Observability after deploy.

### Fix #3 — replace fire-and-forget with `after()`

Next 15 provides `after()` from `next/server`: work scheduled inside it runs after the response is sent but **before the function is frozen**.

**Files & changes:**
- `src/lib/tokenBudget.ts` — `recordTokenUsage()`: wrap the `prisma.tokenUsage.create(...)` in `after(async () => { ... })`, keep the `.catch` logging.
- `src/lib/rate-limit.ts:117–120` — wrap the cleanup `deleteMany` in `after()`.
- `src/lib/rate-limit.ts:48–53` — `clearLoginAttempts()`: same treatment (it's called from the auth route handler, so `after()` is valid there too).
- Audit `trackEvent` (`src/lib/analytics.ts`) for the same pattern while in there.

- **Risk:** low. `after()` throws if called outside a request scope — unit tests call these helpers directly, so guard with a try/catch fallback to the current fire-and-forget behavior (or inject the scheduler).
- **Verify:** `TokenUsage` rows appear for every advisor call in prod; `RateLimit` row count stops growing.

### Fix #4 — P2034: retry + de-escalate the rate-limit transaction

**File:** `src/lib/rate-limit.ts`

Two changes, both in `checkRateLimit()`:

1. **Restructure to shrink the conflict surface.** The serializable count-then-insert exists to stop a race where N concurrent requests all pass the count. Invert it to **insert-first, then count (including own row)**:
   ```ts
   // No interactive transaction needed:
   await prisma.rateLimit.create({ data: { userId, endpoint } });
   const count = await prisma.rateLimit.count({ where: { userId, endpoint, createdAt: { gte: windowStart } } });
   if (count > config.maxRequests) {
     return { allowed: false, ... }; // own row stays; over-admission is impossible
   }
   ```
   This is race-safe without `Serializable` (concurrent requests each see their own insert; worst case both are denied at the boundary, never both admitted), eliminating P2034 at the source.
2. **Defense-in-depth retry helper** for any remaining transactional Prisma calls: retry up to 3× on `P2034`/`P2028` with 50–150ms jittered backoff. Place in `src/lib/prismaRetry.ts` so the advisor route and auth path can share it.

- **Risk:** low. Denied requests now leave a row in the window (counts denials toward the limit) — acceptable for abuse-limiting semantics; note it in the function docstring. The `resetAt`/`retryAfter` math is unchanged.
- **Tests:** existing rate-limit unit tests must pass; add a test for the boundary case (count == max) and a concurrency test (Promise.all × (max+2) admits exactly max).
- **Verify:** zero `P2034` in logs after deploy.

### Fix #6 — error mapping & stop leaking internals

**File:** `src/app/api/advisor/route.ts` catch block (lines ~313–339).

- Detect Prisma transient errors (`Prisma.PrismaClientKnownRequestError` with code `P2034`/`P2028`, or connection errors) → return **503 + `Retry-After: 2`** with a user-safe message, so clients/UI can auto-retry instead of showing a hard failure.
- In production, **drop `details: errorMessage`** from the generic 500 (keep it in the auditLog only; include it in the response only when `NODE_ENV !== 'production'`).
- **Risk:** low; response shape for the happy path is untouched. Check `AdvisorError.tsx` handles 503 sanely.

**Order of implementation:** #1 → #4 → #3 → #6 (timeout headroom first, then the conflict source, then durability, then polish). Each is independently revertable.

---

## Phase 2 — #2: Redis decision (blocked on owner)

The in-memory `advisorCache` and `openaiCircuit` are per-instance and effectively decorative under serverless. Options:

| Option | What it gives | Cost/effort |
|--------|---------------|-------------|
| **A. Upstash Redis (Vercel Marketplace) — recommended** | Shared response cache (`@upstash/redis`), shared circuit-breaker state, and optionally move rate limiting to `@upstash/ratelimit` — which would replace the Postgres `RateLimit` mechanism entirely and make fix #4 moot long-term | Free tier 500K commands/mo; ~half a day |
| B. Keep Postgres for rate limiting, add Redis only for cache/breaker | Smaller change, keeps fix #4 load-bearing | Same infra add, less code churn |
| C. Do nothing | Fixes #1/#3/#4/#6 still stand on their own; cache stays per-instance | Zero |

Decision needed: whether to add Upstash, and if so A vs B. Phase 1 does not depend on this.

---

## Phase 3 — #5 (deferred): kill the sequential second LLM call

Captured for later: move `dispatchOrchestrator` behind `after()` with client polling for the artifact, or migrate the UI fully to `/api/advisor/stream`. Revisit once Phase 1 metrics are in.

---

## Verification checklist (post-deploy)

- [ ] `npm run test` (vitest) green, including new rate-limit concurrency tests
- [ ] Observability: `FUNCTION_INVOCATION_TIMEOUT` ≈ 0 over 48h
- [ ] Observability: `P2034` = 0 over 48h
- [ ] `TokenUsage` rows created for 100% of authed advisor calls
- [ ] `RateLimit` table row count stable (cleanup running)
- [ ] No `details:` field in production 500 responses
