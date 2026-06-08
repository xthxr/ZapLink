---
name: "[GSSoC] Add IDOR protection — enforce link ownership on all endpoints"
about: Fix insecure direct object references allowing unauthorized access to any link's data
title: "GSSoC: Add IDOR protection — enforce link ownership verification"
labels: gssoc, advanced, security, bug
assignees: ''

---

## Description

The API endpoints for reading link details and analytics do not verify that the requesting user owns the link:

**Vulnerable endpoints:**
- `GET /api/links/:shortCode` — returns link details (long URL, creator UID, timestamps) for ANY short code
- `GET /api/links/:shortCode/analytics` — returns click analytics data for ANY short code
- `GET /api/links/search?q=...` — searches across ALL links, not just the user's
- `DELETE /api/links/:shortCode` — should verify ownership before deletion

An authenticated user can access any other user's links by guessing or enumerating short codes.

## Acceptance Criteria

- [ ] Add `verifyOwnership(req, shortCode)` middleware/helper that checks `link.creator === req.user.uid`
- [ ] Apply ownership check to `GET /api/links/:shortCode`
- [ ] Apply ownership check to `GET /api/links/:shortCode/analytics`
- [ ] Apply ownership check to `DELETE /api/links/:shortCode`
- [ ] Filter `GET /api/links/search` to only return the authenticated user's links
- [ ] Return HTTP 403 with clear error message when ownership check fails
- [ ] Admin users (if any) can bypass ownership checks
- [ ] Existing tests pass (or manual verification if no tests exist)

## Files to Modify

- `server.js` — add ownership verification middleware/helper and apply to routes

## Suggested Implementation

```javascript
async function verifyOwnership(req, shortCode) {
  const linkDoc = await db.collection('links').doc(shortCode).get();
  if (!linkDoc.exists) {
    return { error: 'Link not found', status: 404 };
  }
  const linkData = linkDoc.data();
  if (linkData.creator !== req.user.uid) {
    return { error: 'Forbidden: you do not own this link', status: 403 };
  }
  return { data: linkData, status: 200 };
}

// Usage in route:
app.get('/api/links/:shortCode', verifyToken, async (req, res) => {
  const result = await verifyOwnership(req, req.params.shortCode);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  // Return link data
  res.json(result.data);
});
```

## Why This Matters

IDOR vulnerabilities are the #1 web API security issue (OWASP API Security Top 10). Without ownership checks, any authenticated user can:
- Read another user's link configuration (long URL, metadata)
- View another user's analytics data (click counts, visitor info)
- Build a directory of all short links on the platform by enumeration
