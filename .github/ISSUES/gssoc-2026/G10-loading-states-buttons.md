---
name: "[GSSoC] Add loading states to all action buttons"
about: Prevent double-submits and improve UX with loading indicators on async actions
title: "GSSoC: Add loading states to action buttons during async operations"
labels: gssoc, beginner, good-first-issue, enhancement
assignees: ''

---

## Description

Most action buttons in the app lack loading states during asynchronous operations. This leads to:
- **Double-submits**: User clicks "Create Link" twice → two links created / 409 conflict
- **No feedback**: User doesn't know if the action is processing
- **Poor UX**: No visual indication of progress, especially on slow connections

Add loading state management to all action buttons across the app.

## Acceptance Criteria

- [ ] Add a reusable `setLoading(button, isLoading)` function or use `data-loading` attribute
- [ ] Create a CSS class for loading indicator (spinner or "..." animation)
- [ ] Loading states on:
  - "Create Link" button on dashboard
  - "Save" button on edit link
  - "Delete" button on link items
  - "Generate QR" button on QR page
  - "Download QR" button on QR page
  - Bio link save / delete buttons
- [ ] Buttons are disabled during loading (prevent double-click)
- [ ] Button text changes to indicate loading (e.g., "Saving..." → "Saved!")
- [ ] Loading state resets on success AND error (including network failures)

## Files to Modify

- `public/js/app.js` — link CRUD operations
- `public/js/bio-link.js` — bio link save/delete
- `public/js/qr-generator.js` — QR generation/download
- `public/css/style.css` — loading animation styles

## Suggested Implementation

```javascript
function setLoading(button, isLoading, originalText) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = '⏳ Processing...';
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || originalText || 'Submit';
    button.disabled = false;
  }
}

// Usage:
createBtn.addEventListener('click', async () => {
  setLoading(createBtn, true);
  try {
    await api.createLink(data);
    setLoading(createBtn, false, 'Created!');
  } catch (err) {
    setLoading(createBtn, false);
    showError(err.message);
  }
});
```

## Why This Matters

Loading states are a basic UX best practice. They prevent data corruption from double-submits and give users confidence that their action was registered. This is a great first issue for contributors new to the project.
