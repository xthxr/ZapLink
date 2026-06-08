---
name: "[GSSoC] Add startup environment variable validation"
about: Prevent silent failures by validating required env vars on server start
title: "GSSoC: Add startup environment variable validation"
labels: gssoc, intermediate, enhancement
assignees: ''

---

## Description

The server silently falls back to an in-memory-only mode if Firebase environment variables are missing. This means:
- A deployment with misconfigured env vars runs **without any persistence** and **no warning**
- The `auth = null` fallback disables all authentication
- The server appears to work until you refresh — then all data is gone

Add startup validation that checks required environment variables and exits with a clear error message if any are missing.

## Acceptance Criteria

- [ ] On startup, validate `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` are set
- [ ] If missing, log a clear error explaining which variables are missing and exit the process
- [ ] Validate `SESSION_SECRET` is set and is at least 32 characters
- [ ] Validate `REDIS_URL` (optional — only warn if missing, mention caching degrades)
- [ ] Print a startup banner with configured services and their status
- [ ] All validation runs before the server starts listening

## Files to Modify

- `server.js` — add validation function called before `app.listen()`
- `.env.example` — ensure all variables documented

## Suggested Approach

```javascript
function validateEnv() {
  const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
  
  if (process.env.SESSION_SECRET.length < 32) {
    console.error('FATAL: SESSION_SECRET must be at least 32 characters');
    process.exit(1);
  }
}
```

## Why This Matters

Silent fallbacks are dangerous. A deployed instance could run for days without persistence before anyone notices. Validate early, fail fast, and log clearly.
