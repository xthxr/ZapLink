<div align="center">

# PIIK.ME

### The open-source link infrastructure for modern businesses.
### Real-time analytics, custom domains, and zero latency redirects.

[![License:  GNU](https://img.shields.io/badge/License-GNU-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-black.svg)](https://socket.io)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

**A professional-grade, open-source platform for creating trackable short links, personalized bio pages, and real-time analytics with instant QR code generation — a better alternative to bitly. com**

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-technology-stack) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

PIIK.ME is a comprehensive link management and analytics platform that empowers marketers, developers, and businesses to create, track, and analyze their URLs with unprecedented insight.  Built with modern web technologies and real-time capabilities, it offers everything from URL shortening to personalized bio link pages. 

### Why PIIK.ME?

- **🚀 Real-Time Analytics** - Watch clicks happen live with WebSocket-powered updates
- **📱 QR Code Generation** - Instantly generate and download customizable QR codes
- **🎯 Campaign Tracking** - Built-in UTM parameter support for marketing attribution
- **👤 Bio Links** - Create stunning personalized bio pages with social links (like Linktree)
- **✅ Verified Badges** - Premium verification system for early adopters
- **🔒 Secure & Private** - Firebase Authentication with security rules
- **💾 Persistent Storage** - All data safely stored in Google Cloud Firestore
- **⚡ Low Latency** - Sub-second analytics updates for immediate insights
- **🌐 Open Source** - Free to use, modify, and deploy for any purpose

---

## ✨ Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **URL Shortening** | Generate short, memorable links with custom codes |
| **Custom Short Codes** | Choose your own vanity URLs with real-time availability checking |
| **Real-Time Analytics Dashboard** | Live tracking of impressions, clicks, and shares |
| **QR Code Generation** | One-click QR code creation with download functionality |
| **UTM Parameter Management** | Add and track campaign parameters (source, medium, campaign, term, content) |
| **Device & Browser Analytics** | Detailed breakdown of mobile vs desktop and browser usage |
| **Referrer Tracking** | Identify traffic sources and referring websites |
| **Click-Through Rate (CTR)** | Automatic calculation and display of conversion metrics |
| **Share Tracking** | Monitor social sharing and link distribution |
| **Click History** | Chronological log of all link interactions with timestamps |

### 👤 Bio Links (New!)

Create personalized bio pages accessible at `piik.me/username`:

- **Custom Profile Pages** - Display name, bio, and profile picture
- **Multiple Link Support** - Add unlimited social links with icons
- **Drag & Drop Ordering** - Easily reorder links with drag-and-drop functionality
- **Live Preview** - See changes in real-time while editing
- **Auto-Save** - Changes save automatically without manual intervention
- **Background Styles** - Multiple animated background options including:
  - Animated radial gradients
  - Mesh gradient effects
  - Glassmorphism overlays
- **Verified Badges** - Blue checkmark verification for early adopters
- **"Under Review" Status** - Unverified profiles display review status
- **Link Previews** - Automatic favicon and URL previews for each link
- **Magnetic Hover Effects** - Interactive hover animations on links

### 🎨 Visual Enhancements

- **Holographic UI Design** - Modern glassmorphism aesthetic
- **3D Parallax Tilt Effects** - Interactive card animations
- **Animated Mesh Gradients** - Dynamic background animations
- **Magnetic Interactions** - Engaging hover states
- **Responsive Design** - Mobile-first UI with modern CSS animations
- **Loading Animations** - Rotating logo on black background

### Technical Features

- **Google Authentication** - Secure OAuth login via Firebase Auth
- **User Dashboard** - Centralized view of all created links with quick stats
- **WebSocket Updates** - Real-time analytics via Socket.IO (no page refresh needed)
- **Firebase Firestore** - NoSQL database for scalable data persistence
- **RESTful API** - Comprehensive API for programmatic access
- **Custom Short Code Validation** - Real-time checking with improved UX (300ms debounce)
- **Firestore Server Timestamps** - Proper sorting and display of creation dates
- **Session Management** - Firebase Auth token-based sessions

---

## 🛠️ Technology Stack

piik.me is built with modern, production-ready technologies:

### Backend

| Technology | Purpose |
|------------|---------|
| **[Node.js](https://nodejs.org)** | JavaScript runtime environment |
| **[Express.js](https://expressjs.com)** | Web application framework |
| **[Socket.IO](https://socket.io)** | Real-time bidirectional event-based communication |
| **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** | Server-side Firebase operations |
| **[nanoid](https://github.com/ai/nanoid)** | Secure, URL-friendly unique ID generator |
| **[Axios](https://axios-http.com)** | HTTP client for API requests |
| **[QRCode](https://github.com/soldair/node-qrcode)** | Server-side QR code generation |

### Frontend

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup |
| **CSS3** | Modern styling with glassmorphism, animations, and transitions |
| **Vanilla JavaScript** | Lightweight, no-framework frontend |
| **[Firebase SDK](https://firebase.google.com/docs/web/setup)** | Client-side authentication |
| **[QRCode.js](https://davidshimjs.github.io/qrcodejs/)** | Client-side QR code generation |
| **[Three.js](https://threejs.org)** | 3D graphics and animations |
| **[Globe.gl](https://globe.gl)** | Interactive 3D globe visualizations |
| **[D3 Scale](https://github.com/d3/d3-scale)** | Data visualization utilities |

### Database & Authentication

| Service | Purpose |
|---------|---------|
| **[Firebase Firestore](https://firebase.google.com/docs/firestore)** | NoSQL cloud database |
| **[Firebase Authentication](https://firebase.google.com/docs/auth)** | OAuth 2.0 provider (Google Sign-In) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **[dotenv](https://github.com/motdotla/dotenv)** | Environment variable management |
| **[cors](https://github.com/expressjs/cors)** | Cross-origin resource sharing |
| **[nodemon](https://nodemon.io)** | Development server with auto-reload |

### Deployment

| Platform | Purpose |
|----------|---------|
| **[Vercel](https://vercel.com)** | Serverless deployment with automatic HTTPS |

### Architecture Highlights

- **RESTful API** - Clean, resource-oriented endpoints
- **WebSocket Communication** - Sub-second analytics updates
- **JWT Token Authentication** - Secure session management
- **Event-Driven Architecture** - Scalable real-time processing
- **NoSQL Database** - Flexible schema for rapid iteration
- **Client-Server Architecture** - Separated concerns with Firebase backend

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "cors": "^2.8.5",
    "d3-scale": "^4.0.2",
    "d3-scale-chromatic": "^3.1.0",
    "dotenv": "^16.3.1",
    "express":  "^4.18.2",
    "firebase": "^12.4.0",
    "firebase-admin": "^13.5.0",
    "globe.gl": "^2.45.0",
    "nanoid": "^3.3.7",
    "qrcode": "^1.5.4",
    "socket.io":  "^4.6.1",
    "three":  "^0.181.2"
  },
  "devDependencies":  {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or higher ([Download](https://nodejs.org))
- **npm** (comes with Node.js)
- **Google Account** (for Firebase setup)
- **Firebase Project** ([Create one free](https://console.firebase.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xthxr/piik.me.git
   cd piik.me
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   
   - Create a Firebase project
   - Enable Google Authentication
   - Create a Firestore database
   - Generate service account credentials
   - Configure Firestore security rules

4. **Configure environment variables**
   
   Create a `.env` file in the root directory (see `.env.example`):
   ```env
   PORT=3000
   BASE_URL=http://localhost:3000

   # Firebase Admin SDK (from service account JSON)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email@your_project. iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

5. **Update Firebase web configuration**
   
   Edit `public/js/firebase-config.js` with your Firebase web app credentials. 

6. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Access the dashboard**
   
   Open your browser and navigate to:  `http://localhost:3000`

---

## 📁 Project Structure

The project follows a clean, modular architecture optimized for maintainability and contributor-friendliness:

```
zaplink/
├── config/               # Configuration files
│   └── firebase.config.js    # Firebase Admin SDK initialization
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── CODE_OF_CONDUCT.md    # Community guidelines
│   ├── FIREBASE_SETUP.md     # Firebase setup guide
│   ├── PROJECT_STRUCTURE.md  # Detailed structure docs
│   └── SECURITY.md           # Security policies
├── public/               # Frontend assets (served statically)
│   ├── assets/              # Icons and images
│   ├── css/                 # Stylesheets
│   ├── js/                  # Client-side JavaScript modules
│   │   ├── app.js           # Main application logic
│   │   ├── auth.js          # Authentication module
│   │   ├── bio-link.js      # Bio link functionality
│   │   ├── qr-generator.js  # QR code generation
│   │   └── firebase-config.js # Firebase client config
│   ├── index.html           # Main dashboard
│   ├── bio.html             # Bio link page
│   └── landing.html         # Landing page
├── scripts/              # Utility scripts
│   └── set-verified-badges.js # Badge management
├── src/                  # Server-side source code
│   ├── middleware/          # Express middleware
│   │   └── auth.middleware.js # Token verification
│   ├── routes/              # API routes (modular)
│   ├── services/            # Business logic
│   │   └── memory.service.js # In-memory storage
│   └── utils/               # Helper functions
│       └── url.utils.js     # URL utilities
├── .env.example          # Environment template
├── CONTRIBUTING.md       # Contribution guide
├── LICENSE               # MIT License
├── package.json          # Dependencies
├── README.md             # This file
├── server.js             # Express server entry point
└── vercel.json           # Deployment config
```

**📖 For detailed information about the project structure, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**

---

## 🗄️ Data Architecture

piik.me uses Firebase Firestore for scalable, persistent data storage. 

### Database Collections

#### `links` Collection
```javascript
{
  originalUrl: string,      // Full destination URL
  shortCode: string,        // Unique identifier (e.g., "abc123")
  shortUrl: string,         // Complete short URL
  userId: string,           // Firebase Auth user ID
  userEmail: string,        // User's email address
  createdAt: timestamp,     // Server timestamp for proper sorting
  utmParams: {
    source:  string,
    medium: string,
    campaign: string,
    term: string,
    content: string
  }
}
```

#### `analytics` Collection
```javascript
{
  impressions: number,
  clicks: number,
  shares: number,
  clickHistory: [{
    timestamp: timestamp,
    device: string,       // "mobile" or "desktop"
    browser: string,
    referrer: string
  }],
  devices: { mobile: number, desktop: number },
  browsers: { chrome, firefox, safari, edge, other },
  referrers: { "example.com": number, "direct":  number }
}
```

#### `bioLinks` Collection
```javascript
{
  username: string,         // Unique username/slug
  displayName: string,      // Display name
  bio: string,              // Profile bio
  profilePicture: string,   // Profile image URL
  links: [{
    title: string,
    url: string,
    order: number
  }],
  backgroundStyle: string,  // Background theme
  verified: boolean,        // Verification status
  userId: string,
  createdAt: timestamp
}
```

---

## 🔌 API Reference

All JSON API routes accept and return `application/json` unless noted otherwise. Replace `$BASE_URL` with your deployment origin (for example, `http://localhost:3000` in development or `https://piik.me` in production).

### Authentication

Protected endpoints require a valid Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

Obtain the token from the Firebase client SDK (for example, `await firebase.auth().currentUser.getIdToken()`).

| Status | Response body | When |
|--------|---------------|------|
| `401` | `{ "error": "Unauthorized" }` | Missing or non-Bearer `Authorization` header |
| `401` | `{ "error": "Invalid token" }` | Token verification failed |
| `503` | `{ "error": "Authentication service unavailable. Please configure Firebase." }` | Firebase Admin is not configured |

### Rate Limiting

All `/api/*` routes pass through a global rate limiter (default: **100 requests per 15 minutes** per IP). The bug-report endpoint has an additional limit of **5 requests per hour** per IP.

When limited, the API responds with `429 Too Many Requests`:

```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

### Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/system/status` | ❌ | Firebase connectivity status |
| `POST` | `/api/shorten` | ✅ | Create a short link |
| `GET` | `/api/user/links` | ✅ | List the authenticated user's links |
| `GET` | `/api/user/analytics` | ✅ | Aggregated analytics for all user links |
| `GET` | `/api/analytics/:shortCode` | ✅ | Analytics for one link |
| `GET` | `/api/check-username/:username` | ✅ | Check username availability |
| `GET` | `/api/check-shortcode/:shortCode` | ✅ | Check short-code availability |
| `GET` | `/api/user/profile` | ✅ | Get or create user profile |
| `POST` | `/api/user/username` | ✅ | Set or update username |
| `GET` | `/api/user/bio-slug` | ✅ | Get bio slug (deprecated) |
| `GET` | `/api/bio-links` | ✅ | List bio links |
| `POST` | `/api/bio-links` | ✅ | Create a bio link |
| `PUT` | `/api/bio-links/:id` | ✅ | Update a bio link |
| `DELETE` | `/api/bio-links/:id` | ✅ | Delete a bio link |
| `GET` | `/api/bio-links/check-slug/:slug` | ✅ | Check bio slug availability |
| `DELETE` | `/api/user` | ✅ | Permanently delete account |
| `PUT` | `/api/links/:shortCode/deactivate` | ✅ | Soft-deactivate a link |
| `PUT` | `/api/links/:shortCode/reactivate` | ✅ | Reactivate a deactivated link |
| `DELETE` | `/api/links/inactive` | ✅ | Permanently delete inactive links |
| `DELETE` | `/api/links/:shortCode` | ✅ | Permanently delete one link |
| `POST` | `/api/links/:shortCode/split-test` | ✅ | Configure A/B split test |
| `DELETE` | `/api/links/:shortCode/split-test` | ✅ | Remove A/B split test |
| `POST` | `/api/track/impression/:shortCode` | ❌ | Track an analytics-page impression |
| `POST` | `/api/track/share/:shortCode` | ❌ | Legacy share endpoint (no-op counter) |
| `POST` | `/api/bug-report` | ✅ | Create a GitHub bug-report issue |
| `POST` | `/api/import-profile` | ❌ | Import Linktree/Bento HTML |
| `POST` | `/api/admin/sync-redis` | ✅ | Sync all links to Redis |
| `GET` | `/:shortCode` | ❌ | Redirect and track click |
| `GET` | `/:username/:slug` | ❌ | Redirect vanity link and track click |
| `HEAD` | `/:shortCode` | ❌ | Track impression without redirect |

> **Note:** `POST /api/github/bug` is **not implemented**. Bug reports are submitted to `POST /api/bug-report`.

> **Internal endpoint (not public API):** `POST /api/track-edge` exists as a Vercel serverless function for edge middleware. It requires `X-Internal-Request: true` and is not intended for external clients.

When a `shortCode` contains a slash (for example, `username/my-link`), URL-encode it in API paths: `username%2Fmy-link`.

---

### System

#### `GET /api/system/status`

Returns whether Firebase Admin is connected and which storage mode the server is using.

**Authentication:** None

**Headers:** None required

**Parameters:** None

**cURL:**

```bash
curl -X GET "$BASE_URL/api/system/status"
```

**JavaScript (`fetch`):**

```javascript
const response = await fetch(`${BASE_URL}/api/system/status`);
const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "firebase": {
    "enabled": true,
    "mode": "firestore",
    "reason": "Firebase connected successfully"
  }
}
```

**Errors:** None defined beyond standard HTTP failures.

---

### Link Management

#### `POST /api/shorten`

Creates a new short link for the authenticated user. Only `http://` and `https://` destination URLs are accepted.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | Destination URL to shorten |
| `customShortCode` | string | ❌ | Vanity code (3–50 chars; letters, numbers, `-`, `_`) |
| `username` | string | ❌ | Prefix for vanity or random codes (`username/code`) |
| `utmParams` | object | ❌ | `{ source, medium, campaign, term, content }` appended to the URL |
| `notes` | string | ❌ | User notes stored on the link |
| `tags` | string[] | ❌ | Tags stored on the link |
| `expiresAt` | string | ❌ | ISO date string for link expiry |
| `maxClicks` | number | ❌ | Maximum clicks before auto-deactivation |

**cURL:**

```bash
curl -X POST "$BASE_URL/api/shorten" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page",
    "customShortCode": "my-link",
    "utmParams": {
      "source": "newsletter",
      "medium": "email",
      "campaign": "launch"
    },
    "notes": "Campaign landing page",
    "tags": ["marketing", "launch"]
  }'
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/shorten`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com/page',
    customShortCode: 'my-link',
    utmParams: {
      source: 'newsletter',
      medium: 'email',
      campaign: 'launch'
    }
  })
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "shortUrl": "https://piik.me/my-link",
  "shortCode": "my-link",
  "originalUrl": "https://example.com/page?utm_source=newsletter&utm_medium=email&utm_campaign=launch",
  "isCustom": true
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "URL is required" }` | Missing `url` |
| `400` | `{ "error": "Invalid URL" }` | Malformed URL |
| `400` | `{ "error": "Only http and https URLs are allowed" }` | Blocked URL scheme |
| `400` | `{ "error": "Custom short code must be at least 3 characters" }` | Vanity code too short |
| `409` | `{ "error": "This custom short code is already taken" }` | Duplicate vanity code |
| `401` / `503` | See [Authentication](#authentication) | Invalid or unavailable auth |

---

#### `GET /api/user/links`

Returns all links owned by the authenticated user, including aggregated analytics for each link. Expired or scheduled-for-deletion inactive links may be removed automatically during this request.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**Parameters:** None

**cURL:**

```bash
curl -X GET "$BASE_URL/api/user/links" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/user/links`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "links": [
    {
      "originalUrl": "https://example.com",
      "shortCode": "abc1234",
      "shortUrl": "https://piik.me/abc1234",
      "userId": "firebase-uid",
      "userEmail": "user@example.com",
      "isActive": true,
      "clicks": 42,
      "analytics": {
        "impressions": 100,
        "clicks": 42,
        "shares": 5,
        "devices": { "Mobile": 30, "Desktop": 12 },
        "browsers": { "Chrome": 25 },
        "referrers": { "Google": 10 },
        "countries": { "United States": 20 },
        "locations": { "New York, New York": 8 }
      },
      "id": "abc1234"
    }
  ]
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `500` | `{ "error": "Failed to fetch links", "details": "..." }` | Firestore query failure |
| `401` / `503` | See [Authentication](#authentication) | Invalid or unavailable auth |

---

#### `GET /api/check-shortcode/:shortCode`

Checks whether a short code is available before creating a link.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `shortCode` — the code to check (URL-encode slashes)

**cURL:**

```bash
curl -X GET "$BASE_URL/api/check-shortcode/my-link" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/check-shortcode/${shortCode}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{ "available": true }
```

**Errors:** On lookup failure, the handler returns `{ "available": true }` with status `200`.

---

#### `PUT /api/links/:shortCode/deactivate`

Soft-deactivates a link. The link is scheduled for permanent deletion after 15 days.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**URL parameters:** `shortCode` (URL-encoded if it contains `/`)

**Request body:** None

**cURL:**

```bash
curl -X PUT "$BASE_URL/api/links/my-link/deactivate" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/links/${shortCode}/deactivate`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Link deactivated. Will be permanently deleted in 15 days."
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `404` | `{ "error": "Link not found" }` | Unknown short code |
| `403` | `{ "error": "You do not have permission to deactivate this link" }` | Not the link owner |
| `500` | `{ "error": "Failed to deactivate link" }` | Server error |

---

#### `PUT /api/links/:shortCode/reactivate`

Reactivates a previously deactivated link.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `shortCode` (URL-encoded if it contains `/`)

**cURL:**

```bash
curl -X PUT "$BASE_URL/api/links/my-link/reactivate" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/links/${shortCode}/reactivate`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Link reactivated successfully"
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `404` | `{ "error": "Link not found" }` | Unknown short code |
| `403` | `{ "error": "You do not have permission to reactivate this link" }` | Not the link owner |
| `500` | `{ "error": "Failed to reactivate link" }` | Server error |

---

#### `DELETE /api/links/:shortCode`

Permanently deletes a single link and its analytics data.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `shortCode` (URL-encoded if it contains `/`)

**cURL:**

```bash
curl -X DELETE "$BASE_URL/api/links/my-link" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/links/${shortCode}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Link deleted successfully"
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `404` | `{ "error": "Link not found" }` | Unknown short code |
| `403` | `{ "error": "You do not have permission to delete this link" }` | Not the link owner |
| `500` | `{ "error": "Failed to delete link", "details": "..." }` | Server error |

---

#### `DELETE /api/links/inactive`

Permanently deletes all inactive links belonging to the authenticated user.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**cURL:**

```bash
curl -X DELETE "$BASE_URL/api/links/inactive" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/links/inactive`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Successfully deleted 2 inactive links",
  "count": 2
}
```

When there is nothing to delete:

```json
{
  "success": true,
  "message": "No inactive links to delete",
  "count": 0
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `500` | `{ "error": "Failed to delete inactive links" }` | Server error |

---

#### `POST /api/links/:shortCode/split-test`

Configures an A/B split test on a link. Variants must include unique labels, valid URLs, integer weights from 0–100, and weights that sum to exactly 100.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**Request body:**

```json
{
  "variants": [
    { "label": "A", "url": "https://example.com/a", "weight": 50 },
    { "label": "B", "url": "https://example.com/b", "weight": 50 }
  ]
}
```

**cURL:**

```bash
curl -X POST "$BASE_URL/api/links/my-link/split-test" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variants": [
      { "label": "A", "url": "https://example.com/a", "weight": 50 },
      { "label": "B", "url": "https://example.com/b", "weight": 50 }
    ]
  }'
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/links/${shortCode}/split-test`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    variants: [
      { label: 'A', url: 'https://example.com/a', weight: 50 },
      { label: 'B', url: 'https://example.com/b', weight: 50 }
    ]
  })
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Split test configured successfully"
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "A split test requires at least 2 variants." }` | Invalid `variants` array |
| `400` | `{ "error": "All variant weights must sum to 100. Current total: 90." }` | Weights do not sum to 100 |
| `404` | `{ "error": "Link not found" }` | Unknown short code |
| `403` | `{ "error": "You do not have permission to modify this link" }` | Not the link owner |
| `500` | `{ "error": "Failed to configure split test", "details": "..." }` | Server error |

---

#### `DELETE /api/links/:shortCode/split-test`

Removes split-test configuration from a link.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**cURL:**

```bash
curl -X DELETE "$BASE_URL/api/links/my-link/split-test" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/links/${shortCode}/split-test`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Split test removed successfully"
}
```

**Errors:** Same ownership and not-found patterns as the split-test `POST` endpoint.

---

### Analytics

#### `GET /api/analytics/:shortCode`

Returns link metadata and aggregated analytics for a single short code. Only the link owner may access the data.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `shortCode` (URL-encoded if it contains `/`)

**cURL:**

```bash
curl -X GET "$BASE_URL/api/analytics/my-link" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/analytics/${shortCode}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "link": {
    "originalUrl": "https://example.com",
    "shortCode": "my-link",
    "shortUrl": "https://piik.me/my-link",
    "userId": "firebase-uid",
    "isActive": true
  },
  "analytics": {
    "impressions": 120,
    "clicks": 45,
    "shares": 3,
    "devices": { "Mobile": 30, "Desktop": 15 },
    "browsers": { "Chrome": 28 },
    "referrers": { "Google": 12 },
    "countries": { "United States": 20 },
    "locations": { "San Francisco, California": 6 }
  }
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `404` | `{ "error": "Link not found" }` | Unknown short code |
| `403` | `{ "error": "Forbidden" }` | Authenticated user is not the owner |
| `401` / `503` | See [Authentication](#authentication) | Invalid or unavailable auth |

---

#### `GET /api/user/analytics`

Returns analytics for every link owned by the authenticated user.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**cURL:**

```bash
curl -X GET "$BASE_URL/api/user/analytics" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/user/analytics`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "data": [
    {
      "shortCode": "my-link",
      "linkData": {
        "originalUrl": "https://example.com",
        "shortCode": "my-link",
        "userId": "firebase-uid"
      },
      "analytics": {
        "impressions": 120,
        "clicks": 45,
        "shares": 3
      }
    }
  ]
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `503` | `{ "error": "Firestore not available" }` | Firebase not configured |
| `500` | `{ "error": "Failed to fetch analytics" }` | Server error |

---

#### `POST /api/track/impression/:shortCode`

Increments the impression counter when an analytics view is opened. Does not require authentication.

**Authentication:** None

**Headers:** None required

**URL parameters:** `shortCode` (URL-encoded if it contains `/`)

**Request body:** None

**cURL:**

```bash
curl -X POST "$BASE_URL/api/track/impression/my-link"
```

**JavaScript (`fetch`):**

```javascript
const shortCode = encodeURIComponent('my-link');

const response = await fetch(`${BASE_URL}/api/track/impression/${shortCode}`, {
  method: 'POST'
});

const data = await response.json();
```

**Success (`200`):**

```json
{ "success": true }
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `404` | `{ "error": "Link not found" }` | No analytics record for the short code |

---

#### `POST /api/track/share/:shortCode`

Legacy compatibility endpoint. Share counts are tracked automatically when links with `utm_source` are clicked; this route does not increment share counters.

**Authentication:** None

**Headers:** None required

**URL parameters:** `shortCode`

**Request body:** None

**cURL:**

```bash
curl -X POST "$BASE_URL/api/track/share/my-link"
```

**JavaScript (`fetch`):**

```javascript
const response = await fetch(`${BASE_URL}/api/track/share/my-link`, {
  method: 'POST'
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Shares tracked via UTM parameters"
}
```

**Errors:** None defined; always returns `200`.

---

### User Profile

#### `GET /api/user/profile`

Fetches the authenticated user's profile, creating a default profile document if one does not exist.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**cURL:**

```bash
curl -X GET "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/user/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "profile": {
    "userId": "firebase-uid",
    "email": "user@example.com",
    "username": null,
    "usernameChangedAt": null,
    "canChangeUsername": true
  }
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `500` | `{ "error": "Failed to fetch profile" }` | Server error |

---

#### `POST /api/user/username`

Sets or updates the authenticated user's username. A username can only be changed once after it has been set.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**Request body:**

```json
{ "username": "myusername" }
```

**cURL:**

```bash
curl -X POST "$BASE_URL/api/user/username" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "username": "myusername" }'
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/user/username`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ username: 'myusername' })
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "username": "myusername",
  "canChangeUsername": false
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "Username is required" }` | Missing `username` |
| `400` | `{ "error": "Username must be 3-20 characters" }` | Invalid length |
| `403` | `{ "error": "Username can only be changed once" }` | Username already changed |
| `409` | `{ "error": "Username is already taken" }` | Duplicate username |
| `500` | `{ "error": "Failed to update username" }` | Server error |

---

#### `GET /api/check-username/:username`

Checks whether a username is available and valid.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `username`

**cURL:**

```bash
curl -X GET "$BASE_URL/api/check-username/myusername" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/check-username/myusername`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{ "available": true }
```

Validation failures also return `200`:

```json
{ "available": false, "error": "Username must be 3-20 characters" }
```

---

#### `GET /api/user/bio-slug`

**Deprecated** — returns the user's bio slug from their profile or legacy bio-link record.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**cURL:**

```bash
curl -X GET "$BASE_URL/api/user/bio-slug" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/user/bio-slug`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{ "slug": "myusername" }
```

If no slug exists: `{ "slug": null }`

---

#### `DELETE /api/user`

Permanently deletes the authenticated user's account, all of their links, analytics records, and Firebase Auth user.

**Authentication:** Firebase Bearer token (required)

**cURL:**

```bash
curl -X DELETE "$BASE_URL/api/user" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/user`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Account permanently deleted"
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `500` | `{ "error": "Failed to delete account" }` | Server error |

---

### Bio Links

#### `GET /api/bio-links`

Lists all bio links owned by the authenticated user.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**cURL:**

```bash
curl -X GET "$BASE_URL/api/bio-links" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/bio-links`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "bioLinks": [
    {
      "id": "firestore-doc-id",
      "userId": "firebase-uid",
      "name": "Jane Doe",
      "slug": "janedoe",
      "description": "Creator & developer",
      "profilePicture": "",
      "themeColor": "#06b6d4",
      "backgroundStyle": "gradient",
      "links": [],
      "social": {},
      "views": 0,
      "clicks": 0,
      "verified": false
    }
  ]
}
```

**Errors:** `500` — `{ "error": "Failed to fetch bio links" }`

---

#### `POST /api/bio-links`

Creates a bio link. Each user may only have one bio link.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Display name |
| `slug` | string | ✅ | URL slug (`a-z`, `A-Z`, `0-9`, `-`, `_`) |
| `description` | string | ❌ | Bio text |
| `profilePicture` | string | ❌ | Image URL |
| `themeColor` | string | ❌ | Hex color (default `#06b6d4`) |
| `backgroundStyle` | string | ❌ | Background theme (default `gradient`) |
| `links` | array | ❌ | Link objects for the bio page |
| `social` | object | ❌ | Social profile URLs |

**cURL:**

```bash
curl -X POST "$BASE_URL/api/bio-links" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "slug": "janedoe",
    "description": "Creator & developer",
    "links": [{ "title": "Website", "url": "https://example.com", "order": 0 }]
  }'
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/bio-links`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    slug: 'janedoe',
    description: 'Creator & developer',
    links: [{ title: 'Website', url: 'https://example.com', order: 0 }]
  })
});

const data = await response.json();
```

**Success (`201`):**

```json
{
  "success": true,
  "id": "firestore-doc-id",
  "message": "Bio link created successfully"
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "Name is required" }` | Missing name |
| `400` | `{ "error": "Invalid slug format" }` | Invalid slug |
| `409` | `{ "error": "This URL slug is already taken" }` | Duplicate slug |
| `409` | `{ "error": "You can only create one bio link. Please edit your existing one." }` | User already has a bio link |

---

#### `PUT /api/bio-links/:id`

Updates an existing bio link owned by the authenticated user. Accepts the same body fields as `POST /api/bio-links`.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**URL parameters:** `id` — Firestore document ID of the bio link

**cURL:**

```bash
curl -X PUT "$BASE_URL/api/bio-links/BIO_LINK_DOC_ID" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Doe", "slug": "janedoe", "description": "Updated bio" }'
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/bio-links/BIO_LINK_DOC_ID`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    slug: 'janedoe',
    description: 'Updated bio'
  })
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Bio link updated successfully"
}
```

**Errors:** `404`, `403`, `409`, and `500` with the same error messages as create.

---

#### `DELETE /api/bio-links/:id`

Deletes a bio link owned by the authenticated user.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `id` — Firestore document ID of the bio link

**cURL:**

```bash
curl -X DELETE "$BASE_URL/api/bio-links/BIO_LINK_DOC_ID" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/bio-links/BIO_LINK_DOC_ID`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Bio link deleted successfully"
}
```

---

#### `GET /api/bio-links/check-slug/:slug`

Checks whether a bio-link slug is available.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
```

**URL parameters:** `slug`

**cURL:**

```bash
curl -X GET "$BASE_URL/api/bio-links/check-slug/janedoe" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/bio-links/check-slug/janedoe`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{ "available": true }
```

**Errors:** `500` — `{ "error": "Failed to check slug availability" }`

---

### Bug Reports

#### `POST /api/bug-report`

Creates a GitHub issue in the configured repository using the server's `GITHUB_TOKEN`. Requires authentication and is rate-limited to 5 submissions per hour per IP.

**Authentication:** Firebase Bearer token (required)

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Bug title |
| `description` | string | ✅ | Bug description |
| `steps` | string | ❌ | Steps to reproduce |
| `email` | string | ❌ | Reporter email |
| `userId` | string | ❌ | Reporter Firebase UID |
| `userEmail` | string | ❌ | Reporter account email |

**cURL:**

```bash
curl -X POST "$BASE_URL/api/bug-report" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dashboard fails to load links",
    "description": "The links list stays empty after login.",
    "steps": "1. Sign in\n2. Open dashboard",
    "email": "reporter@example.com"
  }'
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/bug-report`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Dashboard fails to load links',
    description: 'The links list stays empty after login.',
    steps: '1. Sign in\n2. Open dashboard',
    email: 'reporter@example.com',
    userId: firebase.auth().currentUser.uid,
    userEmail: firebase.auth().currentUser.email
  })
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "issueNumber": 42,
  "issueUrl": "https://github.com/xthxr/Link360/issues/42"
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "Title and description are required" }` | Missing required fields |
| `429` | `{ "success": false, "error": "Too many bug reports submitted. Please wait before trying again." }` | Hourly rate limit exceeded |
| `500` | `{ "error": "Failed to create bug report", "details": "..." }` | GitHub API or server failure |
| `401` / `503` | See [Authentication](#authentication) | Invalid or unavailable auth |

---

### Profile Import

#### `POST /api/import-profile`

Fetches HTML from an allowed Linktree or Bento profile URL. Used by the bio-link importer.

**Authentication:** None

**Headers:**

```http
Content-Type: application/json
```

**Request body:**

```json
{ "url": "https://linktr.ee/example" }
```

Allowed URL prefixes: `https://linktr.ee/` and `https://bento.me/`

**cURL:**

```bash
curl -X POST "$BASE_URL/api/import-profile" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://linktr.ee/example" }'
```

**JavaScript (`fetch`):**

```javascript
const response = await fetch(`${BASE_URL}/api/import-profile`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://linktr.ee/example' })
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "html": "<!DOCTYPE html>..."
}
```

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "URL is required" }` | Missing `url` |
| `403` | `{ "error": "Invalid URL", "message": "Only Linktree (linktr.ee) and Bento (bento.me) profiles can be imported" }` | URL not on allow-list |
| `500` | `{ "error": "Failed to import profile", "details": "..." }` | Fetch failure |

---

### Admin

#### `POST /api/admin/sync-redis`

Syncs all Firestore links to Redis for edge redirects.

**Authentication:** Firebase Bearer token (required). No additional admin-role check is enforced in the current implementation.

**Headers:**

```http
Authorization: Bearer {firebase-auth-token}
Content-Type: application/json
```

**Request body:** None

**cURL:**

```bash
curl -X POST "$BASE_URL/api/admin/sync-redis" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**JavaScript (`fetch`):**

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${BASE_URL}/api/admin/sync-redis`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
```

**Success (`200`):**

```json
{
  "success": true,
  "message": "Synced 150 links to Redis",
  "errors": 0
}
```

**Errors:** `500` — `{ "error": "Failed to sync to Redis", "details": "..." }`

---

### Redirects

These routes are not JSON APIs but are part of the public link infrastructure.

#### `GET /:shortCode`

Resolves a short link or bio-link slug. Bio links serve `bio.html`; regular links redirect to the destination and track a click asynchronously.

**Authentication:** None

**cURL:**

```bash
curl -L "$BASE_URL/my-link"
```

**JavaScript (`fetch`):**

```javascript
// fetch follows redirects by default; disable with redirect: 'manual' to inspect the Location header
const response = await fetch(`${BASE_URL}/my-link`);
```

**Success:** `302` redirect to destination URL, or `200` HTML for bio links

**Errors:** `404` plain text — `Link not found`

#### `GET /:username/:slug`

Resolves vanity links in `username/slug` format. Redirects to the destination and tracks a click.

**Authentication:** None

**cURL:**

```bash
curl -L "$BASE_URL/myusername/my-link"
```

**JavaScript (`fetch`):**

```javascript
const response = await fetch(`${BASE_URL}/myusername/my-link`);
```

**Success:** `302` redirect

**Errors:** `404` plain text — `Link not found`

#### `HEAD /:shortCode`

Tracks an impression without performing a redirect. Used for link previews.

**Authentication:** None

**cURL:**

```bash
curl -I "$BASE_URL/my-link"
```

**JavaScript (`fetch`):**

```javascript
const response = await fetch(`${BASE_URL}/my-link`, { method: 'HEAD' });
```

**Success:** `200` with empty body

---

### WebSocket Events (Socket.IO)

Connect to the same origin as the app. Clients can subscribe to a short code room:

```javascript
socket.emit('subscribe', 'my-link');

socket.on('analyticsUpdate', (data) => {
  // { shortCode, click: { timestamp, device, browser, referrer, ... } }
});

socket.on('analytics:my-link', (payload) => {
  // { type: 'click' | 'impression', data: { ... increments } }
});

socket.on('splitTestUpdate', (payload) => {
  // { shortCode, variantLabel, click: { ... } }
});
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: 
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

The repository includes `vercel.json` for zero-config deployment.

### Production Checklist

- [ ] Update Firestore security rules
- [ ] Add production domain to Firebase authorized domains
- [ ] Configure all Firebase credentials as env variables
- [ ] Set `BASE_URL` to production domain
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Set up error logging (Sentry)
- [ ] Configure CDN for static assets

---

## 🔒 Security

### Implemented Features

- ✅ OAuth 2.0 via Google (Firebase Authentication)
- ✅ Server-side token verification
- ✅ User-specific data isolation
- ✅ Firestore security rules
- ✅ HTTPS enforcement (production)

### Recommended Additions

```javascript
// Rate Limiting
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Security Headers
const helmet = require('helmet');
app.use(helmet());
```

---

## 🤝 Contributing

We welcome contributions!  See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch:  `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌍 Internationalization (i18n)

---

## 💖 Contributors

Thanks to all the amazing people who contribute to **piik.me** 🚀

<p align="center">
  <a href="https://github.com/xthxr/piik.me/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=xthxr/piik.me" alt="Contributors"/>
  </a>
</p>

---

## ⭐ Project Support

<p align="center">
  <a href="https://github.com/xthxr/piik.me/stargazers">
    <img src="https://img.shields.io/github/stars/xthxr/piik.me?style=social" alt="Stars">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/xthxr/piik.me/network/members">
    <img src="https://img.shields.io/github/forks/xthxr/piik.me?style=social" alt="Forks">
  </a>
</p>

---

## 📄 License

piik.me is open-source software licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024-2025 piik.me

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software. 
```

---

## 🙏 Acknowledgments

Built with amazing open-source technologies: 

- [Firebase](https://firebase.google.com) - Backend infrastructure
- [Express. js](https://expressjs.com) - Web framework
- [Socket.IO](https://socket.io) - Real-time communication
- [Three.js](https://threejs.org) - 3D graphics
- [Globe.gl](https://globe.gl) - Globe visualizations

---

<div align="center">

**[⭐ Star this repo](https://github.com/xthxr/piik.me)** if you find it useful!

Made with ❤️ by [xthxr](https://github.com/xthxr)

</div>
