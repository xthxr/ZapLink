# PIIK.ME Roadmap

## Current Status ✅

**Core Features (Working):**
- URL shortening with custom short codes
- Real-time analytics dashboard (WebSocket-powered)
- QR code generation with download
- Bio links pages (`/username`) with drag-and-drop ordering
- UTM parameter support for campaign tracking
- Device & browser analytics
- Referrer tracking
- Firebase Authentication (Google Sign-In)

**Technical Stack:**
- Node.js + Express.js backend
- Firebase Firestore for data persistence
- Socket.IO for real-time updates
- Vercel deployment

---

## Short-term Goals (1-3 months)

Based on open issues and documented improvements:

1. **Testing Infrastructure** - Add Jest/Mocha, write unit and integration tests
2. **Route Refactoring** - Extract `server.js` routes into `src/routes/` modular structure
3. **API Documentation** - Create comprehensive API docs with request/response examples
4. **Rate Limiting** - Already partially implemented; need full configuration
5. **Security Hardening** - Add helmet.js, CSRF protection, input validation middleware

---

## Medium-term Goals (3-6 months)

Features that enhance the URL management platform:

1. **Analytics Export** - CSV/PDF export functionality for analytics data
2. **Custom Date Range Filtering** - Filter analytics by custom date ranges
3. **Dark Mode** - Add theme toggle for dashboard
4. **Link Scheduling** - Schedule links to activate/deactivate at specific times
5. **Bulk Operations** - Bulk delete, export, and manage links
6. **Link Previews** - Enhanced preview cards for shared links

---

## Long-term Vision

1. **Custom Domains** - Allow users to use their own domains for shortened links
2. **Third-party Integrations** - Zapier, Slack, and API integrations
3. **Team Collaboration** - Multi-user accounts and shared workspaces
4. **Mobile App** - Native iOS/Android apps
5. **Documentation Site** - Full docs website with interactive API playground

---

*Last Updated: June 2026*