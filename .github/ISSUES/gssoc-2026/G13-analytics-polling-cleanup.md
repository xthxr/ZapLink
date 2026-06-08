---
name: "[GSSoC] Add analytics polling cleanup on page navigation"
about: Fix stale analytics requests and memory leaks from uncleaned polling intervals
title: "GSSoC: Add analytics polling cleanup on page navigation"
labels: gssoc, intermediate, bug, enhancement
assignees: ''

---

## Description

The analytics dashboard uses `setInterval()` to poll for new analytics data every 5 seconds. However, when the user navigates away from the analytics page, the interval is **not always cleared**, causing:

- **Stale API calls**: Requests continue hitting the server for a page the user isn't viewing
- **Memory leaks**: Each navigation creates a new interval that's never destroyed
- **UI updates on wrong page**: Callbacks try to update DOM elements that no longer exist
- **Unnecessary Firebase reads**: Each polling request reads Firestore documents

Fix by implementing proper interval lifecycle management tied to page navigation.

## Acceptance Criteria

- [ ] Store reference to the analytics polling interval
- [ ] Clear the interval when navigating away from analytics page
- [ ] Clear the interval when the analytics section is hidden/removed
- [ ] Use `clearInterval()` in a cleanup function called on navigation
- [ ] Verify no "Cannot read property of null" errors after navigating away
- [ ] Handle edge case: rapid navigation (clear old interval before starting new one)

## Files to Modify

- `public/js/app.js` — analytics polling lifecycle management

## Suggested Implementation

```javascript
let analyticsPollingInterval = null;

function startAnalyticsPolling(shortCode) {
  // Clear any existing interval first
  stopAnalyticsPolling();
  
  async function poll() {
    try {
      const data = await fetchAnalytics(shortCode);
      updateAnalyticsUI(data);
    } catch (err) {
      console.warn('Analytics poll failed:', err.message);
    }
  }
  
  // Initial fetch
  poll();
  
  // Start interval
  analyticsPollingInterval = setInterval(poll, 5000);
}

function stopAnalyticsPolling() {
  if (analyticsPollingInterval) {
    clearInterval(analyticsPollingInterval);
    analyticsPollingInterval = null;
  }
}

// Called when navigating to a section
function showSection(section) {
  stopAnalyticsPolling(); // Clean up previous section
  
  if (section === 'analytics') {
    startAnalyticsPolling(currentLinkCode);
  }
}
```

## Why This Matters

Orphaned intervals are a known source of memory leaks in single-page applications. Each interval holds references to DOM elements and closures, preventing garbage collection. Over a long session, this can consume significant memory.
