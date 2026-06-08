---
name: "[GSSoC] Replace innerHTML with safe DOM APIs throughout frontend"
about: Eliminate stored XSS vulnerabilities by replacing innerHTML with createElement/textContent
title: "GSSoC: Replace innerHTML with safe DOM APIs to prevent XSS"
labels: gssoc, advanced, security, enhancement
assignees: ''

---

## Description

Multiple frontend files use `innerHTML` with template literals containing user-controlled data:

- **`public/js/bio-link.js`**: Renders bio link items, social links, and trending links using `innerHTML` with values like link titles, URLs, and descriptions
- **`public/js/app.js`**: Analytics dashboard renders click data into the DOM using `innerHTML`
- **`public/js/qr-generator.js`**: Displays download links and share dialogs via `innerHTML`

User-controlled data (link titles, URLs, social handles) can contain malicious `<script>` tags or event handlers, leading to **stored XSS** — an attacker creates a link with a malicious title, and when anyone views that link's analytics or bio page, the script executes in their browser.

## Acceptance Criteria

- [ ] Audit all `innerHTML` usage across `app.js`, `bio-link.js`, `qr-generator.js`
- [ ] Replace each with safe DOM API equivalents:
  - `document.createElement()` + `textContent`/`setAttribute` for complex structures
  - `element.textContent = value` instead of `element.innerHTML = value` for text-only values
  - `insertAdjacentHTML` only if input is sanitized with DOMPurify
- [ ] Keep DOMPurify as defense-in-depth for any unavoidable `innerHTML` use
- [ ] Fix the DOMPurify race condition — sanitize before DOM insertion, not during
- [ ] Submit to existing functionality (rendering, formatting, interactivity preserved)
- [ ] All user-facing text is properly escaped

## Files to Modify

- `public/js/bio-link.js` — render functions (trending links, bio link items, social links)
- `public/js/app.js` — analytics rendering, link list rendering
- `public/js/qr-generator.js` — download/share UI elements

## Example Fix

**Before (unsafe):**
```javascript
element.innerHTML = `
  <div class="link-item">
    <span class="title">${link.title}</span>
    <span class="url">${link.url}</span>
  </div>
`;
```

**After (safe):**
```javascript
const div = document.createElement('div');
div.className = 'link-item';

const titleSpan = document.createElement('span');
titleSpan.className = 'title';
titleSpan.textContent = link.title;

const urlSpan = document.createElement('span');
urlSpan.className = 'url';
urlSpan.textContent = link.url;

div.appendChild(titleSpan);
div.appendChild(urlSpan);
element.appendChild(div);
```

## Why This Matters

Stored XSS is the most critical vulnerability class. An attacker who can inject JavaScript into a bio link or link title gains access to all viewers' sessions — cookies, auth tokens, and Firebase access. This is the highest-priority security fix for the project.
