---
name: "[GSSoC] Add structured request logging with Winston or Pino"
about: Replace console.log with structured logging for debugging and monitoring
title: "GSSoC: Add structured server-side request logging"
labels: gssoc, intermediate, enhancement
assignees: ''

---

## Description

The server currently uses `console.log()` scattered throughout for debugging. This is problematic because:
- No log levels (error, warn, info, debug)
- No timestamps by default
- No structured JSON output for log aggregation tools
- No request IDs to correlate logs across a single request lifecycle
- Hard to filter in production

Add structured logging using a library like Winston or Pino (or a lightweight custom logger).

## Acceptance Criteria

- [ ] Add a structured logger (Winston or Pino) with:
  - Log levels: `error`, `warn`, `info`, `debug`
  - Automatic timestamps in ISO 8601 format
  - JSON output format (for log aggregation)
  - Human-readable console output in development
- [ ] Replace all `console.log()` / `console.error()` with logger calls
- [ ] Add HTTP request logging middleware (method, path, status, duration)
- [ ] Add request ID to every log entry (correlate logs for a single request)
- [ ] Logger level configurable via `LOG_LEVEL` environment variable
- [ ] Add to `.env.example`
- [ ] Do NOT log sensitive data (tokens, passwords, Firebase private keys)

## Files to Modify

- `server.js` — add logger initialization and request logging middleware
- `.env.example` — add `LOG_LEVEL` variable

## Suggested Log Format

```json
{
  "level": "info",
  "timestamp": "2026-06-05T10:00:00.000Z",
  "requestId": "req_abc123",
  "method": "POST",
  "path": "/api/links",
  "status": 201,
  "duration": 145,
  "userId": "user_xyz",
  "message": "Link created successfully"
}
```

## Why This Matters

Without structured logging, debugging production issues is nearly impossible. You can't search logs, filter by error level, correlate related events, or integrate with monitoring tools like Datadog, LogDNA, or CloudWatch.
