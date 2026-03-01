# Workstream 2: Observability Enhancements

**Summary:** Enhanced version of Workstream 2 from SPRINT4_HARDENING_SPEC.md with production-ready observability patterns.

**Changes from original:**
- Added request ID tracing
- Added sensitive data redaction
- Added API logging wrapper
- Enhanced Sentry configuration with fingerprinting and breadcrumbs  
- Added `/api/health/ready` endpoint for container orchestration
- Added optional Prometheus metrics (P2)
- Updated effort estimate: 1 week → 1.5-2 weeks

---

## Enhanced Sections

### 2.1 Structured Logging (Pino) - ENHANCED

**New additions:**

####  Automatic sensitive data redaction

```typescript
const redactKeys = ["password", "apiKey", "token", "secret", "authorization"];

export const logger = pino({
  redact: {
    paths: redactKeys.map(k => `*.${k}`),
    censor: "[REDACTED]"
  },
  // ... rest of config
});
```

#### Request ID tracing

```typescript
export function withRequestId(logger: pino.Logger, requestId?: string) {
  return logger.child({ requestId: requestId || randomUUID() });
}
```

#### API logging wrapper (`src/lib/api-logger.ts`)

```typescript
export async function withLogging(
  req: NextRequest,
  handler: (req: NextRequest, logger: Logger) => Promise<NextResponse>
) {
  const requestId = req.headers.get("x-request-id") || randomUUID();
  const logger = withRequestId(apiLogger, requestId);
  
  const start = Date.now();
  logger.info({ method: req.method, url: req.url }, "Request started");
  
  try {
    const response = await handler(req, logger);
    const duration = Date.now() - start;
    
    logger.info({ method, url, status: response.status, duration }, "Request completed");
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logger.error({ method, url, duration, error }, "Request failed");
    throw error;
  }
}
```

**Usage:**
```typescript
export async function POST(req: NextRequest) {
  return withLogging(req, async (req, logger) => {
    logger.info({ userId: session.user.id }, "User authenticated");
    // ... handler code
  });
}
```

#### Log sampling for high-traffic routes

```typescript
export function shouldLog(sampleRate = 1.0): boolean {
  return Math.random() < sampleRate;
}

// Usage:
if (shouldLog(0.1)) { // 10% sample
  logger.debug({ eventId }, "Event viewed");
}
```

**Enhanced acceptance criteria:**
- [ ] Request IDs propagate through all logs
- [ ] Request IDs returned in response headers (`x-request-id`)
- [ ] Sensitive data automatically redacted
- [ ] API logging wrapper used in all routes
- [ ] Log sampling configured for high-frequency endpoints

---

### 2.2 Error Tracking (Sentry) - ENHANCED

**New additions:**

#### Custom fingerprinting for better error grouping

```typescript
// sentry.server.config.ts
beforeSend(event, hint) {
  // Group Atlas errors by operation type
  if (event.tags?.['atlas.operation']) {
    event.fingerprint = ['atlas', String(event.tags['atlas.operation'])];
  }
  
  // Group MongoDB errors by error code
  if (hint.originalException && 'code' in hint.originalException) {
    event.fingerprint = ['mongodb', String(hint.originalException.code)];
  }
  
  // Group AI errors by provider
  if (event.tags?.['ai.provider']) {
    event.fingerprint = ['ai', String(event.tags['ai.provider'])];
  }
  
  return event;
}
```

#### Breadcrumbs for debugging critical flows

```typescript
// In Atlas provisioning:
Sentry.addBreadcrumb({
  category: 'atlas',
  message: 'Cluster provisioning started',
  data: { teamId, eventId, clusterName },
  level: 'info',
});

// In AI services:
Sentry.addBreadcrumb({
  category: 'ai',
  message: 'AI request started',
  data: { model, provider, promptTokens },
  level: 'info',
});
```

#### Enhanced client config

```typescript
// sentry.client.config.ts
Sentry.init({
  // ... dsn, environment, release
  
  // Session replay - 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore known noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    "ChunkLoadError",
  ],
  
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      return null; // Don't capture in dev
    }
    return event;
  },
});
```

**Enhanced acceptance criteria:**
- [ ] Custom fingerprinting for Atlas, MongoDB, AI errors
- [ ] Breadcrumbs added to critical flows
- [ ] Session replay enabled (10% sample)
- [ ] Ignore list configured for known noise
- [ ] Development errors not sent to Sentry

---

### 2.3 Health Check Endpoints - ENHANCED

**New addition: Readiness endpoint**

#### `/api/health/ready/route.ts` - For Kubernetes/containers

```typescript
async function checkDatabase(): Promise<boolean> {
  try {
    await connectDB();
    await Event.findOne().lean(); // Verify DB works
    return true;
  } catch {
    return false;
  }
}

async function checkRAGIndexes(): Promise<boolean> {
  // Verify vector search indexes exist
  return true;
}

async function checkAIProvider(): Promise<boolean> {
  return !!process.env.OPENAI_API_KEY;
}

export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRAGIndexes(),
    checkAIProvider(),
  ]);
  
  const results = {
    database: checks[0].status === "fulfilled" && checks[0].value,
    ragIndexes: checks[1].status === "fulfilled" && checks[1].value,
    aiProvider: checks[2].status === "fulfilled" && checks[2].value,
  };
  
  const allReady = Object.values(results).every(v => v === true);
  
  return NextResponse.json(
    { ready: allReady, checks: results, timestamp: new Date().toISOString() },
    { status: allReady ? 200 : 503 }
  );
}
```

#### Enhanced `/api/health/route.ts`

```typescript
export async function GET() {
  const checks = {
    app: {
      status: "healthy",
      version: packageJson.version,
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      nodeVersion: process.version,
    },
    database: {
      status: "unknown" as "healthy" | "unhealthy" | "unknown",
      latencyMs: 0,
    },
  };

  try {
    const start = Date.now();
    await connectDB();
    checks.database.latencyMs = Date.now() - start;
    checks.database.status = "healthy";
  } catch {
    checks.database.status = "unhealthy";
  }

  const isHealthy = checks.database.status === "healthy";
  return NextResponse.json(
    { status: isHealthy ? "healthy" : "degraded", timestamp: new Date().toISOString(), checks },
    { status: isHealthy ? 200 : 503 }
  );
}
```

**Enhanced acceptance criteria:**
- [ ] `/api/health/ready` endpoint for container orchestration
- [ ] Ready endpoint checks database, RAG indexes, AI provider
- [ ] Health check includes detailed memory breakdown
- [ ] Health check includes database latency

---

### 2.4 Metrics Collection (Optional - P2) - NEW

**Purpose:** Track API performance, AI usage, Atlas provisioning success rates.

#### `src/lib/metrics.ts`

```typescript
import client from "prom-client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status"],
  buckets: [10, 50, 100, 300, 500, 1000, 3000, 5000],
  registers: [register],
});

export const atlasProvisioningTotal = new client.Counter({
  name: "atlas_provisioning_total",
  help: "Total Atlas cluster provisioning attempts",
  labelNames: ["status"], // "success" | "failed"
  registers: [register],
});

export const aiTokensUsed = new client.Counter({
  name: "ai_tokens_used_total",
  help: "Total AI tokens consumed",
  labelNames: ["provider", "model", "type"], // type: "prompt" | "completion"
  registers: [register],
});
```

#### `/api/metrics/route.ts`

```typescript
import { register } from "@/lib/metrics";

export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: { "Content-Type": register.contentType },
  });
}
```

**Usage:**

```typescript
// In API routes:
import { httpRequestDuration } from "@/lib/metrics";

const timer = httpRequestDuration.startTimer();
try {
  // ... code
  const response = NextResponse.json(data);
  timer({ method: req.method, route: "/api/events", status: 200 });
  return response;
} catch (error) {
  timer({ method: req.method, route: "/api/events", status: 500 });
  throw error;
}

// In AI services:
import { aiTokensUsed } from "@/lib/metrics";

aiTokensUsed.inc({
  provider: "openai",
  model: result.model,
  type: "prompt",
}, result.usage.prompt_tokens);
```

**Acceptance criteria (optional):**
- [ ] `prom-client` installed
- [ ] Prometheus metrics exposed at `/api/metrics`
- [ ] HTTP duration, AI tokens, Atlas provisioning tracked

---

## Updated Effort Estimate

**Original:** 1 week  
**Enhanced:** 1.5-2 weeks

**Breakdown:**
- 2.1 Pino + redaction + API wrapper + migration: **2-3 days**
- 2.2 Sentry + breadcrumbs + fingerprinting: **2-3 days**
- 2.3 Health checks (basic + ready): **1 day**
- 2.4 Metrics (optional): **1-2 days**

**Total:** 6-9 days

---

## Risk Register Updates

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pino overhead in Edge runtime | LOW | Test Edge middleware; may need lightweight alternative |
| Sentry quota (5K errors/month) | MEDIUM | 10% transaction sample, 100% errors, ignore noise |
| Log volume explosion | MEDIUM | Default `info` level, sample debug, rotate logs |
| Health check DB overhead | LOW | Cache health for 5-10s, simple queries |

---

## Integration Notes

**To apply these enhancements:**

1. Review this document
2. Update `SPRINT4_HARDENING_SPEC.md` Workstream 2 section with enhanced content
3. Update the summary table at the top (1 week → 1.5-2 weeks)
4. Ensure all new acceptance criteria are added to checklists

**Files to create (new):**
- `src/lib/api-logger.ts` - API logging wrapper
- `src/app/api/health/ready/route.ts` - Readiness endpoint
- `src/lib/metrics.ts` - Prometheus metrics (optional)
- `src/app/api/metrics/route.ts` - Metrics endpoint (optional)

**Files to enhance (existing spec):**
- `src/lib/logger.ts` - Add redaction + request ID helpers
- `sentry.client.config.ts` - Add session replay + ignore list
- `sentry.server.config.ts` - Add custom fingerprinting
- `src/app/api/health/route.ts` - Add detailed memory stats

---

**Generated:** 2026-03-01 11:00 AM EST  
**For:** MongoHacks Platform Sprint 4 Hardening  
**Status:** Ready for review and integration
