---
name: "[GSSoC] Merge CI pipeline with ESLint into main branch"
about: Bring linting and CI from feature branch into main for project-wide quality enforcement
title: "GSSoC: Merge CI pipeline with ESLint validation into main branch"
labels: gssoc, intermediate, enhancement, infrastructure
assignees: ''

---

## Description

The ESLint configuration (`eslint.config.js`) and CI workflow (`.github/workflows/ci.yml`) currently exist only on the `feature/add-ci-pipeline` branch. The `main` branch has:
- No linting
- No CI
- No automated quality checks

This means every new PR and commit on `main` can introduce code quality issues without any automated feedback.

## Acceptance Criteria

- [ ] Merge (or port) `eslint.config.js` from `feature/add-ci-pipeline` to `main`
- [ ] Verify ESLint runs with 0 errors on all existing `main` files (warnings are acceptable)
- [ ] Merge (or port) `.github/workflows/ci.yml` from `feature/add-ci-pipeline` to `main`
- [ ] CI workflow runs on every push and pull request to `main`
- [ ] CI workflow runs `npm install && npx eslint .` and fails on errors
- [ ] Add a status badge to README showing CI status
- [ ] Document how to run linting locally in CONTRIBUTING.md

## Files to Create/Modify

- `eslint.config.js` — create (port from feature branch, adjust if needed)
- `.github/workflows/ci.yml` — create (port from feature branch)
- `README.md` — add CI status badge
- `CONTRIBUTING.md` — add linting instructions

## ESLint Config Reference

The feature branch uses ESLint v10.4.1 with flat config. The config includes:
- `@eslint/js` recommended rules
- Node.js environment globals
- ES2022 syntax support
- Warnings for: `no-unused-vars`, `no-undef`, `prefer-const`, `no-var`

## Why This Matters

Code quality enforcement cannot live on a feature branch. It must be in `main` to affect all contributions. Without CI in `main`:
- PR reviewers must manually catch every issue
- No automated feedback loop for contributors
- Code quality can degrade with every merge
