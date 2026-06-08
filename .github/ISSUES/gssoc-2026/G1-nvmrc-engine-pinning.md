---
name: "[GSSoC] Add .nvmrc and engines field to package.json"
about: Improve build consistency by pinning Node.js version
title: "GSSoC: Add .nvmrc and engines field for Node.js version pinning"
labels: gssoc, good-first-issue, beginner, enhancement
assignees: ''

---

## Description

The project currently has no pinned Node.js version. Different contributors may use different Node.js versions, causing subtle compatibility issues. We need to add an `.nvmrc` file and an `engines` field in `package.json`.

## Acceptance Criteria

- [ ] `.nvmrc` file created at project root containing the Node.js version
- [ ] `engines.node` field added to `package.json` matching `.nvmrc`
- [ ] `engines.npm` field added to `package.json` (optional but recommended)
- [ ] Both values match the project's runtime requirements (the app was tested on Node.js 18+)

## Files to Modify

- `package.json` — add `engines` block
- New `.nvmrc` — single line with version

## Suggested Approach

1. Check what Node.js version the CI pipeline uses (Vercel uses Node.js 18.x/20.x)
2. Create `.nvmrc` with `lts/hydrogen` or `18.x` (or verify against `middleware.js` requirements)
3. Add to `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0",
     "npm": ">=8.0.0"
   }
   ```
4. Verify with `node --version` test

## Why This Matters

Node.js version inconsistency is a common source of "works on my machine" bugs. This fix ensures all contributors and deployments use the same runtime.
