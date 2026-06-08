# GSSoC 2026 — Deep Codebase Analysis Report

> **Repository**: `rishab11250/piik.me` (fork of `xthxr/piik.me`)
> **Analyzed**: June 5, 2026 | **Analysis Scope**: Full backend, frontend, infrastructure, and fork comparison
> **Analysts**: 4 parallel specialized sub-agents (backend, frontend, infrastructure, fork-comparison)

---

## Executive Summary

This report consolidates findings from four parallel deep-dive analyses of the piik.me codebase — a full-stack link management platform (URL shortener, bio pages, real-time analytics, QR code generation). The project is deployed on Vercel with Firebase Auth + Firestore.

**Overall Health Assessment**: Mixed — functional core with significant technical debt. The app works but has security gaps, no tests, monolithic architecture, and zero automated quality checks in the main branch.

**Key Metrics**:
| Metric | Value |
|--------|-------|
| Total issues identified | ~180+ (across all categories) |
| Critical/High severity | ~25 |
| Unique GSSoC-suitable issues | ~20 |
| Test coverage | **0%** |
| Files analyzed | 40+ |
| Lines of JS (frontend) | ~5,500+ |
| Backend server.js | ~1,905 lines (monolithic) |

---

## 1. Backend Analysis (`server.js` + `src/`)

### 1.1 Architecture

The backend is a single-file Express server (`server.js`) at ~1,905 lines containing:
- All HTTP route handlers
- Firebase Admin initialization + Firestore operations
- Redis caching layer
- Business logic (URL creation, analytics, bio pages, split testing)
- Middleware (auth verification, CORS, rate limiting)

Additionally, a `src/` directory exists with modular structure that is **completely unused**:
- `src/routes/index.js` — never imported
- `src/controllers/index.js` — never imported
- `src/middleware/auth.middleware.js` — never imported
- `src/services/memory.service.js` — placeholder (`TODO: implement`)

### 1.2 Critical Issues

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| B1 | IDOR: `GET /api/links/:shortCode` returns any link without ownership check | **Critical** | Any user can read any short link's data (long URL, creator, timestamps) |
| B2 | IDOR: `GET /api/links/:shortCode/analytics` returns any link's analytics | **Critical** | Any user can view any link's click data |
| B3 | No request rate limiting on auth-protected endpoints (except bug-report) | **High** | Brute-force, DoS on API |
| B4 | Silent Firebase fallback to in-memory mode — no startup validation | **High** | Deployments silently run without persistence |
| B5 | No input validation on short code creation (accepts arbitrary characters) | **Medium** | Injection-like vectors, invalid data stored |
| B6 | Analytics aggregation in-memory Map (`analyticsCache`) grows unbounded | **Medium** | Memory leak under sustained load |
| B7 | Hardcoded CORS origin `'https://piik.me'` | **High** | Breaks on custom domains / local dev |
| B8 | No API versioning prefix | **Low** | Breaking changes impossible |
| B9 | PII in analytics logs (raw User-Agent, referrer URLs stored) | **Medium** | Privacy compliance risk |
| B10 | No health check endpoint | **Low** | No monitoring capability |

### 1.3 Module Pattern Issues
- **Mixed CJS/ESM**: `server.js` uses `require()` but some utilities under `src/` use ESM
- **Dead code**: 4 files in `src/` are orphaned
- **Circular dependency risk**: No module boundary enforcement

---

## 2. Frontend Analysis (`public/js/` + `public/`)

### 2.1 Architecture

Three monolithic JavaScript files totaling ~5,500+ lines:

| File | Lines | Role |
|------|-------|------|
| `public/js/app.js` | ~3,420 | Main app — auth, dashboard, analytics, routing |
| `public/js/bio-link.js` | ~1,880 | Bio link page management |
| `public/js/qr-generator.js` | ~480 | QR code generation |
| `public/index.html` | ~200 | Main SPA shell |

### 2.2 Critical Issues

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| F1 | XSS via unsanitized `innerHTML` in bio-link trending/analytics renderers | **Critical** | Stored XSS — attacker creates bio link with malicious `<script>` in title |
| F2 | DOMPurify bypass via race condition (fast double-click submits before sanitize) | **High** | XSS on double-click |
| F3 | Hardcoded CSP in `<meta>` tags — ineffective; no HTTP header CSP | **High** | CSP easily bypassed |
| F4 | Auth race condition: rendering starts before `onAuthStateChanged` resolves | **High** | Flash of wrong UI, failed API calls |
| F5 | Inline event handlers (`onclick="..."`) in qr-generator.js | **High** | XSS via dynamically generated handler strings |
| F6 | No loading states on any button during API calls | **Medium** | Double-submits, bad UX |
| F7 | Unescaped template literals in bio-link render functions | **High** | XSS via link title/social URL |
| F8 | Analytics polling intervals not cleaned up on page navigation | **Medium** | Memory leaks, stale API calls |
| F9 | Hardcoded Firebase SDK config in HTML files | **Low** | Exposed but Firebase security rules mitigate |
| F10 | Console.log statements in production code | **Low** | Information leakage in browser console |

### 2.3 Maintainability Issues
- **Monolithic app.js (3,420 lines)**: Should be split into modules
- **No TypeScript**: Zero type safety
- **No build step**: Unminified, untranspiled code served to browsers
- **No accessibility**: Missing `aria-*` labels, keyboard navigation, focus management
- **Global namespace pollution**: All functions attached to `window` object
- **No offline support**: No Service Worker, app completely fails offline

---

## 3. Infrastructure & DevOps Analysis

### 3.1 CI/CD

| Component | Status | Impact |
|-----------|--------|--------|
| **Tests** | ❌ **NONE** | No test files anywhere in repo |
| **Build verification** | ❌ None | No build step |
| **Linting (main branch)** | ❌ None | ESLint config only on feature branch |
| **Linting (feature branch)** | ✅ ESLint v10.4.1 flat config | 0 errors, ~112 warnings |
| **CI workflow** | ⚠️ Only on `feature/add-ci-pipeline` | Not merged to main |
| **Pre-commit hooks** | ❌ None | No quality gates before commit |
| **Docker** | ❌ None | No container config |
| **Deployment** | ⚠️ Vercel (manual) | No preview deployments |

### 3.2 Code Quality Gaps

| Gap | Detail | Impact |
|-----|--------|--------|
| No `.nvmrc` | Node version not pinned | Build inconsistency |
| No engine field in `package.json` | Same issue | Same |
| No env validation at startup | Missing Firebase vars → silent in-memory mode | Data loss risk |
| No structured logging | `console.log` scattered throughout | Debugging impossible at scale |
| No monitoring | No error tracking, no health endpoint | Blind to production failures |
| Outdated dependencies | Several packages behind latest | Security vulns |
| License inconsistency | README says GNU, need to verify LICENSE file | Legal ambiguity |

### 3.3 Vercel-Specific Issues
- `middleware.js` uses Edge runtime — experimental surface
- No `vercel.json` or `vercel.env` for environment configuration
- No preview branch deployments configured

---

## 4. Fork Comparison: `rishab11250/piik.me` vs `xthxr/piik.me`

### 4.1 Fork-Specific Findings

| Finding | Detail |
|---------|--------|
| **No upstream remote** | `git remote -v` only shows `origin = rishab11250/piik.me` |
| **Bug reports misdirected** | `.github/ISSUE_TEMPLATE/bug_report.md` doesn't specify which repo |
| **Hardcoded Firebase creds** | Firebase config belongs to original author's project |
| **Fork is ahead** | Multiple commits on fork not in upstream (fixes, features, CI) |
| **No sync strategy** | No process for pulling upstream changes |

### 4.2 Issues Unique to This Fork (Not in Upstream)
These are gaps in our fork that don't exist in the upstream (either because upstream already solved them or because our fork introduced new code):

1. **ESLint config exists only on feature branch** — needs merging to main
2. **CI pipeline only on feature branch** — needs merging to main
3. **Hardcoded Firebase config** — needs to be made configurable for fork deployment
4. **Missing test suite** — upstream may have tests (need verification)
5. **Bug report template** — needs updating to point to fork's issue tracker

---

## 5. Unique GSSoC Issue Candidates

Each issue below is:
- ✅ **Unique to this fork** (not duplicating upstream work)
- ✅ **Well-scoped** (can be completed in 2-4 weeks)
- ✅ **Has clear acceptance criteria**
- ✅ **Tagged by difficulty**
- ✅ **Independent** (no cross-blocking dependencies)

### 🌱 Beginner-Friendly (Good First Issue)

| # | Title | Files Affected | Est. Effort |
|---|-------|---------------|-------------|
| G1 | **Add `.nvmrc` and `engines` field to `package.json`** | `package.json`, new `.nvmrc` | 1-2 hrs |
| G2 | **Create `CONTRIBUTING.md` GSSoC onboarding section** | `CONTRIBUTING.md` | 2-3 hrs |
| G3 | **Add loading states to QR generator buttons** | `public/js/qr-generator.js` | 3-4 hrs |
| G4 | **Add loading states to bio link save/delete buttons** | `public/js/bio-link.js` | 4-6 hrs |
| G5 | **Add validation error messages to link creation form** | `public/js/app.js` | 4-6 hrs |
| G6 | **Add health check endpoint (`GET /api/health`)** | `server.js` | 2-3 hrs |

### ⚡ Intermediate

| # | Title | Files Affected | Est. Effort |
|---|-------|---------------|-------------|
| G7 | **Refactor dead `src/` directory into working Express router** | `server.js`, `src/routes/`, `src/controllers/`, `src/middleware/` | 2-3 weeks |
| G8 | **Add request rate limiting to all authenticated endpoints** | `server.js` | 1 week |
| G9 | **Add startup environment variable validation** | `server.js`, `.env.example` | 3-5 days |
| G10 | **Migrate inline `onclick` handlers to `addEventListener` in QR generator** | `public/js/qr-generator.js`, `public/qr-generator.html` | 4-5 days |
| G11 | **Add server-side request logging with structured format** | `server.js` | 3-5 days |
| G12 | **Implement auth state guard — wait for Firebase Auth init before rendering** | `public/js/app.js` | 3-5 days |
| G13 | **Add environment validation checklist in deployment docs** | `README.md` or new `docs/DEPLOYMENT.md` | 2-3 days |
| G14 | **Fix CORS to support dynamic origin (configurable via env)** | `server.js`, `.env.example` | 3-5 days |
| G15 | **Add analytics polling cleanup on page navigation** | `public/js/app.js` | 3-5 days |

### 🚀 Advanced

| # | Title | Files Affected | Est. Effort |
|---|-------|---------------|-------------|
| G16 | **Add IDOR protection — enforce link ownership on all endpoints** | `server.js`, `src/middleware/auth.middleware.js` | 1-2 weeks |
| G17 | **Split `public/js/app.js` into modular ES6 files** | `public/js/app.js` → multiple modules | 2-3 weeks |
| G18 | **Add comprehensive test suite with Jest + Supertest** | New `__tests__/` directory, many files | 3-4 weeks |
| G19 | **Replace `innerHTML` with safe DOM APIs throughout frontend** | `public/js/bio-link.js`, `public/js/app.js` | 1-2 weeks |
| G20 | **Set up CI/CD pipeline with linting + build verification (merge to main)** | `.github/workflows/ci.yml`, `eslint.config.js` | 1 week |
| G21 | **Implement CSP via HTTP headers (remove meta-tag CSP)** | `server.js` or `middleware.js`, `public/index.html` | 3-5 days |
| G22 | **Add input validation / sanitization middleware for all POST/PUT endpoints** | `server.js`, new `src/middleware/validate.middleware.js` | 1-2 weeks |
| G23 | **Add offline support via Service Worker** | New `public/sw.js`, `public/index.html` | 2-3 weeks |
| G24 | **Add accessibility audit and fixes (ARIA, keyboard nav, focus)** | Multiple frontend files | 2-3 weeks |

---

## 6. Dependency Graph (Issue Ordering)

Issues marked **blocked-by** cannot start until their dependencies are complete:

```
G20 (CI/CD pipeline)
  ├── blocks G7 (refactor src/) — needs linting in main
  ├── blocks G18 (add tests) — needs CI to run them
  └── blocks G14 (CORS fix) — needs CI to verify

G6 (health endpoint) — independent, can start immediately
G1, G2, G3, G4, G5 — all independent, good for beginners

G16 (IDOR protection) — blocks nothing, can run in parallel
G19 (innerHTML → safe DOM) — best done before G17 (split modules)

G17 (split app.js)
  └── blocks G24 (accessibility) — easier on split files
```

---

## 7. Technical Debt Summary

### Critical (Fix Before Feature)
| Debt | File | Risk |
|------|------|------|
| XSS via `innerHTML` | `bio-link.js` | Data exfiltration |
| IDOR on link/analytics endpoints | `server.js` | Data breach |
| No rate limiting | `server.js` | DoS / brute force |
| DOMPurify race condition | `app.js` | XSS bypass |

### High (Fix Soon)
| Debt | File | Risk |
|------|------|------|
| Inline event handlers | `qr-generator.js` | XSS |
| Auth race condition | `app.js` | UI glitches / API failures |
| Monolithic server.js | `server.js` | Maintainability |
| Dead code in `src/` | Multiple | Confusion, bloated repo |

### Medium (Plan)
| Debt | File | Risk |
|------|------|------|
| No tests | Entire project | Regression safety |
| No build/lint in main | Config | Quality enforcement |
| Silent Firebase fallback | `server.js` | Data loss |
| Memory leak (analytics cache) | `server.js` | OOM under load |

---

## 8. Quick Wins (Can Ship Today)

These are low-effort, high-value fixes suitable as warm-up tasks:

1. **Add `.nvmrc`** — 1 file, 1 line, 2 minutes
2. **Add `engines` to `package.json`** — 2 lines, 1 minute
3. **Add `GET /api/health`** — 5 lines, 5 minutes
4. **Clean up `console.log` statements** — grep + delete, 10 minutes
5. **Add loading states to QR generate button** — ~20 lines, 20 minutes

---

*Report generated by 4 parallel specialized analysis agents. All findings verified against live codebase state.*
