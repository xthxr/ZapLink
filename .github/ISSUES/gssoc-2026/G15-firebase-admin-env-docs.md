---
name: "[GSSoC] Improve deployment documentation for fork maintainers"
about: Create deployment guide detailing Firebase setup, env vars, and Vercel config
title: "GSSoC: Create deployment guide for fork maintainers"
labels: gssoc, beginner, good-first-issue, documentation
assignees: ''

---

## Description

Currently, there is no documentation on how to deploy a fork of this project. Essential information is missing:
- How to set up a Firebase project for the fork
- Which Firebase services are needed (Auth, Firestore, Admin SDK)
- How to configure environment variables in Vercel
- How to set up a custom domain
- The Firebase Admin SDK credentials needed from Google Cloud Console
- How to handle the hardcoded Firebase config in public HTML files

This makes it very difficult for GSSoC contributors and other fork maintainers to deploy their own instance.

## Acceptance Criteria

- [ ] Create `docs/DEPLOYMENT.md` with step-by-step instructions
- [ ] Create a GitHub issue template for deployment problems (or extend bug report)
- [ ] Update `README.md` with a "Deploy Your Own" badge/link
- [ ] Document all required Firebase services:
  - Firebase Authentication (providers to enable)
  - Cloud Firestore (security rules, indexes)
  - Firebase Admin SDK (service account setup)
- [ ] Document all environment variables with descriptions
- [ ] Document Vercel-specific configuration (domain, env vars, build settings)
- [ ] Include troubleshooting section for common deployment issues
- [ ] Mention how to change the hardcoded Firebase config in public HTML files
- [ ] Add `.env.example` if one doesn't exist, or improve the existing one

## Files to Create/Modify

- New `docs/DEPLOYMENT.md`
- `README.md` — add deployment section / badge
- `.env.example` — ensure all vars documented

## Suggested Structure for DEPLOYMENT.md

```markdown
# Deployment Guide

## Prerequisites
- Node.js 18+
- Firebase account (free tier works)
- Vercel account (free tier works)
- A domain (optional)

## Step 1: Create a Firebase Project
...

## Step 2: Enable Authentication
...

## Step 3: Create Firestore Database
...

## Step 4: Generate Admin SDK Credentials
...

## Step 5: Configure Environment Variables
...

## Step 6: Deploy to Vercel
...

## Step 7: Configure Custom Domain (Optional)
...

## Troubleshooting
...
```

## Why This Matters

Without deployment documentation, fork maintainers are left to reverse-engineer the setup from code. This is a barrier to contribution and adoption. Clear documentation enables the community to deploy, test, and contribute more effectively.
