---
name: "[GSSoC] Move CSP from meta tags to HTTP headers"
about: Implement effective Content Security Policy via server-sent HTTP headers
title: "GSSoC: Move Content Security Policy from meta tags to HTTP response headers"
labels: gssoc, intermediate, security, enhancement
assignees: ''

---

## Description

The current CSP is defined in `<meta>` tags within HTML files. This approach:
1. **Is trivially bypassable** — an attacker who injects markup can override or remove `<meta>` CSP tags
2. **Cannot protect against certain attacks** — HTTP header CSP is enforced before the page renders
3. **Cannot report violations** — `report-uri`/`report-to` only works with HTTP header CSP

Move CSP enforcement to HTTP response headers set by the server (and Vercel Edge Middleware).

## Acceptance Criteria

- [ ] Add `helmet` package (or manual `Content-Security-Policy` header) to server.js
- [ ] Define a comprehensive CSP policy that:
  - Restricts `script-src` to approved sources
  - Restricts `style-src` to approved sources
  - Allows Firebase SDK connections (`connect-src`)
  - Enables `report-uri` for violation monitoring
- [ ] Apply CSP via HTTP headers for all HTML page responses
- [ ] Also add CSP via Vercel Edge Middleware for the redirect handler
- [ ] Remove CSP `<meta>` tags from `public/index.html` and `public/bio-link.html`
- [ ] Verify no UI functionality breaks (Firebase SDK, analytics, etc.)
- [ ] Document the CSP policy and any exceptions

## Files to Modify

- `server.js` — add CSP header middleware
- `middleware.js` — add CSP header for Edge redirects
- `public/index.html` — remove CSP `<meta>` tags
- `public/bio-link.html` — remove CSP `<meta>` tags

## Why This Matters

HTTP header CSP is the only effective way to enforce Content Security Policy. Meta-tag CSP is easily bypassed by DOM-based attacks and cannot use violation reporting, making it nearly useless as a security control.
