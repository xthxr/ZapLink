---
name: "[GSSoC] Refactor dead src/ directory into working Express routers"
about: Migrate monolithic server.js to modular structure using existing src/ files
title: "GSSoC: Refactor server.js into modular Express routers using src/ structure"
labels: gssoc, advanced, enhancement, refactor
assignees: ''

---

## Description

The project has an `src/` directory with a modular structure (routes, controllers, middleware, services) — but **none of these files are actually used**. The entire backend lives in `server.js` (~1,905 lines single file). The `src/` directory contains:

- `src/routes/index.js` — **never imported** by server.js
- `src/controllers/index.js` — **never imported** by server.js
- `src/middleware/auth.middleware.js` — **never imported** by server.js
- `src/services/memory.service.js` — placeholder with `TODO: implement`

Refactor `server.js` to actually use this modular structure, extracting route handlers, controllers, and middleware into their respective files.

## Acceptance Criteria

- [ ] Audit current `src/` files and assess what's salvageable vs needs rewriting
- [ ] Extract route definitions from `server.js` into `src/routes/` (separate files per domain: links, analytics, bio, split-test)
- [ ] Extract business logic into `src/controllers/`
- [ ] Extract auth middleware into `src/middleware/auth.middleware.js`
- [ ] Implement `src/services/memory.service.js` (used for Firebase fallback mode)
- [ ] Update `server.js` to import and use the modular structure
- [ ] Verify all existing endpoints work identically (no behavior changes)
- [ ] Keep `server.js` as the entry point but significantly reduced in size
- [ ] Ensure CJS consistency (all files use `require`/`module.exports`)
- [ ] Update any deployment config if module paths changed

## Expected Outcome

| Before | After |
|--------|-------|
| `server.js`: ~1,905 lines (all-in-one) | `server.js`: ~100 lines (bootstrap + middleware config) |
| `src/routes/`: unused (dead code) | `src/routes/`: active route definitions |
| `src/controllers/`: unused (dead code) | `src/controllers/`: active business logic |
| `src/middleware/`: unused | `src/middleware/`: active auth + validation middleware |
| `src/services/memory.service.js`: TODO | `src/services/memory.service.js`: implemented |

## Why This Matters

A 1,905-line server file is unsustainable. It makes:
- **Testing impossible**: Can't test individual route handlers in isolation
- **Onboarding hard**: New contributors must understand the entire file at once
- **Debugging difficult**: Needle-in-haystack search for bugs
- **Confusing**: The `src/` structure suggests modularity that doesn't exist
