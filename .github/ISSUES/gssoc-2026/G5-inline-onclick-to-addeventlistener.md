---
name: "[GSSoC] Replace inline onclick handlers with addEventListener in QR Generator"
about: Eliminate XSS vector by migrating inline event handlers to proper DOM listeners
title: "GSSoC: Replace inline onclick handlers with addEventListener in QR Generator"
labels: gssoc, intermediate, security, enhancement
assignees: ''

---

## Description

The QR generator page uses inline `onclick="..."` attributes for all button interactions. This is:
1. An **XSS vector** — dynamically generated handler strings can be injected
2. **Poor separation of concerns** — logic mixed with markup
3. **Hard to maintain** — cannot attach multiple listeners, no central event management

Migrate all inline handlers to `addEventListener()` calls in `qr-generator.js`.

## Acceptance Criteria

- [ ] Remove all `onclick` attributes from `public/qr-generator.html`
- [ ] Replace with `addEventListener('click', handler)` in `public/js/qr-generator.js`
- [ ] All existing functionality preserved: generate, download, copy, share
- [ ] Use `data-*` attributes to pass dynamic data instead of string interpolation in handler names
- [ ] Add loading state to buttons during async operations (prevent double-click)
- [ ] Verify no regressions in QR generation flow

## Files to Modify

- `public/qr-generator.html` — remove `onclick` attributes
- `public/js/qr-generator.js` — add `addEventListener` calls

## Example Migration

**Before (HTML):**
```html
<button onclick="generateQR('{{code}}')">Generate</button>
```

**After (HTML):**
```html
<button data-short-code="{{code}}" class="generate-qr-btn">Generate</button>
```

**After (JS):**
```javascript
document.querySelectorAll('.generate-qr-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.dataset.shortCode;
    generateQR(code);
  });
});
```

## Why This Matters

Inline event handlers are a well-known XSS vector. When the handler name contains user-controlled data (e.g., `{{code}}`), an attacker can inject arbitrary JavaScript. `addEventListener` decouples the handler reference from the markup, eliminating this attack surface.
