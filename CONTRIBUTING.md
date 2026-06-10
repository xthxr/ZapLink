# Contributing to PIIK.ME

First off, thank you for considering contributing to Zaplink! It's people like you that make PIIK.ME such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Firebase account (for backend features)
- Git

### Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/zaplink.git
   cd zaplink
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

   See [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) for detailed Firebase setup instructions.

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Visit `http://localhost:3000`

## Project Structure

Understanding the project structure will help you navigate and contribute effectively.

### Root Directory

```
zaplink/
├── config/               # Configuration files
│   └── firebase.config.js    # Firebase Admin initialization
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md       # System architecture docs
│   ├── CODE_OF_CONDUCT.md    # Community guidelines
│   ├── FIREBASE_SETUP.md     # Firebase setup guide
│   └── SECURITY.md           # Security policies
├── public/               # Frontend assets (served statically)
│   ├── assets/              # Static assets
│   │   ├── icons/           # Icon files
│   │   └── images/          # Image files
│   ├── css/                 # Stylesheets
│   │   ├── bio-preview.css  # Bio page styles
│   │   ├── landing.css      # Landing page styles
│   │   └── styles.css       # Main application styles
│   ├── js/                  # Client-side JavaScript
│   │   ├── app.js           # Main application logic
│   │   ├── auth.js          # Authentication module
│   │   ├── bio-link.js      # Bio link page functionality
│   │   ├── firebase-config.example.js  # Firebase config template
│   │   ├── firebase-config.js          # Firebase client config
│   │   ├── globe.js         # Globe visualization
│   │   ├── globe-view.js    # Globe view controller
│   │   ├── landing.js       # Landing page scripts
│   │   └── qr-generator.js  # QR code generation
│   ├── bio.html             # Bio link page
│   ├── countries.geojson    # Geographic data
│   ├── index.html           # Main application page
│   └── landing.html         # Landing page
├── scripts/              # Utility scripts
│   ├── README.md            # Scripts documentation
│   └── set-verified-badges.js  # Badge management script
├── src/                  # Server-side source code
│   ├── middleware/          # Express middleware
│   │   └── auth.middleware.js  # Authentication middleware
│   ├── routes/              # API routes (to be added)
│   ├── services/            # Business logic services
│   │   └── memory.service.js   # In-memory storage fallback
│   └── utils/               # Utility functions
│       └── url.utils.js         # URL manipulation utilities
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── CONTRIBUTING.md       # This file
├── LICENSE               # Project license
├── package.json          # Project dependencies
├── README.md             # Project overview
├── server.js             # Express server entry point
└── vercel.json           # Vercel deployment config
```

### Frontend Structure (`public/`)

The `public/` folder contains all client-facing code and assets.

### Backend Structure (`src/`)

The backend is organized into modules for better maintainability:

- **Middleware** (`src/middleware/`): Authentication and request processing
- **Services** (`src/services/`): Business logic and data operations
- **Utils** (`src/utils/`): Helper functions and utilities
- **Routes** (`src/routes/`): API endpoint handlers (to be implemented)

### Configuration (`config/`)

- `firebase.config.js` - Firebase Admin SDK initialization and database access

## Development Workflow

### Branching Strategy

1. **Main Branch**: `main` - Production-ready code
2. **Feature Branches**: `feature/your-feature-name`
3. **Bug Fix Branches**: `fix/bug-description`
4. **Documentation**: `docs/what-you-are-documenting`

### Making Changes

1. **Create a Branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Your Changes** - Follow coding standards below

3. **Lint Your Code**

   ```bash
   npm run lint
   ```
   
   ESLint is configured with flat config (`eslint.config.js`). The CI pipeline runs linting on every push and PR — it will fail on errors. Fix all errors before committing. Warnings are acceptable.

4. **Test Locally**

   ```bash
   npm run dev
   # Test your changes thoroughly
   ```

5. **Commit Your Changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

5. **Push and Create PR**

## Coding Standards

### JavaScript

- Use ES6+ features
- Add JSDoc comments for functions
- Use `camelCase` for variables/functions
- Use `PascalCase` for classes
- Handle errors gracefully

### CSS

- Use BEM naming convention
- Mobile-first approach
- Use CSS custom properties for theming

## Submitting Changes

1. Fill out the PR template completely
2. Link related issues
3. Include screenshots for UI changes
4. Keep PRs focused on one feature/fix
5. Be responsive to review comments
6. Wait for review and address any feedback.

## 📄 License

By contributing, you agree that your contributions will be licensed under the GNU License.
