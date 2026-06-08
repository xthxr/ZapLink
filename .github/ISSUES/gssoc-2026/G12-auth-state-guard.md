---
name: "[GSSoC] Implement auth state guard — wait for Firebase Auth init before rendering"
about: Fix race condition where UI renders before Firebase Auth resolves
title: "GSSoC: Implement auth state guard to wait for Firebase Auth initialization"
labels: gssoc, intermediate, bug, enhancement
assignees: ''

---

## Description

The main `app.js` starts rendering the UI immediately on page load, but Firebase Auth's `onAuthStateChanged` fires asynchronously. This causes:

- **Flash of logged-out UI**: Brief display of the login screen before redirecting
- **Failed API calls**: Requests sent without auth token because `getAuthToken()` returns `null`
- **Race condition on page load**: The app may render the dashboard, then immediately redirect to login when `onAuthStateChanged` fires

Fix by adding an auth initialization guard that blocks rendering until the auth state is resolved.

## Acceptance Criteria

- [ ] Add `authReady` promise that resolves when `onAuthStateChanged` fires for the first time
- [ ] Show a loading spinner or skeleton UI while auth is initializing
- [ ] Only render the dashboard or redirect to login after auth state is known
- [ ] Handle edge case: if the auth state changes after initial load (e.g., token expires mid-session)
- [ ] Verify no API calls happen before auth is ready
- [ ] Ensure `getAuthToken()` never returns `null` when called after auth guard resolves

## Files to Modify

- `public/js/app.js` — add auth initialization guard and loading state

## Suggested Implementation

```javascript
let authInitialized = false;
const authReady = new Promise((resolve) => {
  firebase.auth().onAuthStateChanged((user) => {
    authInitialized = true;
    resolve(user);
  });
});

// App initialization
async function initApp() {
  // Show loading screen
  showLoadingScreen();
  
  // Wait for auth
  const user = await authReady;
  
  if (user) {
    await loadDashboard();
  } else {
    showLoginPage();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
```

## Why This Matters

Race conditions during initialization are a common source of intermittent bugs. Users may see blank screens, wrong pages, or failed API calls depending on timing. A proper auth guard ensures deterministic behavior on every load.
