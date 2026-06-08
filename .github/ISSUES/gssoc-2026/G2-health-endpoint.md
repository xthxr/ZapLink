---
name: "[GSSoC] Add GET /api/health endpoint"
about: Add a health check endpoint for monitoring and deployment verification
title: "GSSoC: Add health check endpoint at GET /api/health"
labels: gssoc, good-first-issue, beginner, enhancement
assignees: ''

---

## Description

The server has no health check endpoint. This means:
- Vercel / monitoring services can't verify the app is running
- Contributors can't easily confirm the server started correctly
- No way to check that Firebase, Redis, and other services are connected

Add a `GET /api/health` endpoint that returns the server status.

## Acceptance Criteria

- [ ] `GET /api/health` returns HTTP 200 with JSON body `{ "status": "ok", "timestamp": "..." }`
- [ ] Response includes service connection status (Firebase, Redis if enabled)
- [ ] Response includes uptime and memory usage (optional but useful)
- [ ] Endpoint does NOT require authentication (health checks must be public)
- [ ] Endpoint is placed BEFORE catch-all routes in `server.js`
- [ ] Document in README API reference section

## Files to Modify

- `server.js` — add route handler

## Suggested Response Shape

```json
{
  "status": "ok",
  "timestamp": "2026-06-05T10:00:00.000Z",
  "uptime": 3600,
  "services": {
    "firebase": "connected",
    "redis": "not_configured"
  }
}
```

## Why This Matters

Health endpoints are essential for deployment monitoring, load balancer health checks, and quick verification that the server initialized all required services.
