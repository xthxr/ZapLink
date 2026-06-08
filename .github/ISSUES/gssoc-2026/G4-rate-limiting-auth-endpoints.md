---
name: "[GSSoC] Add rate limiting to all authenticated endpoints"
about: Protect API endpoints from abuse with configurable rate limiting
title: "GSSoC: Add rate limiting to all authenticated API endpoints"
labels: gssoc, intermediate, security, enhancement
assignees: ''

---

## Description

Currently, only the bug-report endpoint has rate limiting (via `bugReportLimiter`). All other authenticated endpoints — link creation, analytics queries, split-test management — have no rate limits, making them vulnerable to:
- Brute-force attacks on short codes
- DoS via rapid-fire API calls
- Analytics data pollution via fake clicks

Add rate limiting using the existing `express-rate-limit` dependency (already installed for bug report).

## Acceptance Criteria

- [ ] Create reusable rate limiter middleware:
  - `apiLimiter`: 100 requests per 15 minutes per IP (general API)
  - `authLimiter`: 20 requests per 15 minutes per user (write operations)
  - `analyticsLimiter`: 30 requests per minute per IP (analytics queries)
- [ ] Apply `apiLimiter` to all `/api/*` routes
- [ ] Apply `authLimiter` specifically to POST/PUT/DELETE operations
- [ ] Apply `analyticsLimiter` to `/api/links/:shortCode/analytics` endpoint
- [ ] Rate-limited requests return HTTP 429 with clear JSON error message
- [ ] Include `Retry-After` header in 429 responses
- [ ] Rate limiters are configurable via environment variables

## Files to Modify

- `server.js` — add rate limiter configurations and apply to routes

## Suggested Error Response

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again in 14 minutes.",
  "retryAfter": 840
}
```

## Why This Matters

Without rate limiting, the API is vulnerable to abuse. This is a security best practice for any public-facing API.
