---
name: "[GSSoC] Make CORS origin configurable via environment variable"
about: Fix hardcoded CORS origin to support custom domains and local development
title: "GSSoC: Make CORS origin configurable via environment variable"
labels: gssoc, intermediate, bug, enhancement
assignees: ''

---

## Description

The CORS middleware in `server.js` has the origin hardcoded to `'https://piik.me'`:

```javascript
app.use(cors({
  origin: 'https://piik.me',
  credentials: true
}));
```

This means:
- **Local development is broken** — requests from `localhost:3000` or any dev port are blocked by CORS
- **Custom domains don't work** — if deployed on a custom domain, API calls fail
- **Fork deployments can't use their own URL** — every fork user must manually edit server.js

Fix this by reading the allowed origin from an environment variable with a sensible fallback.

## Acceptance Criteria

- [ ] Read `CORS_ORIGIN` from `process.env` (support comma-separated for multiple origins)
- [ ] Default to `'https://piik.me'` if env var not set (backward compatible)
- [ ] Also allow `'http://localhost:*'` in development mode (`NODE_ENV=development`)
- [ ] Update `.env.example` with the new variable
- [ ] Document in README or deployment guide

## Files to Modify

- `server.js` — replace hardcoded CORS origin with dynamic resolution
- `.env.example` — add `CORS_ORIGIN` entry

## Suggested Implementation

```javascript
const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : 'https://piik.me';

if (process.env.NODE_ENV === 'development') {
  if (Array.isArray(corsOrigin)) {
    corsOrigin.push(/^http:\/\/localhost:\d+$/);
  }
}

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
```

## Why This Matters

Hardcoded configuration makes the project unfriendly for local development and fork deployments. This fix enables:
- `npm run dev` with hot reload working out of the box
- Easy deployment of forks with custom domains
- No manual code edits needed for different environments
