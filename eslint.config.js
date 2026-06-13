import js from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Global ignores — skip vendor/minified files
  { ignores: ["node_modules/", "public/js/vendor/"] },

  // Apply ESLint recommended rules as base
  js.configs.recommended,

  // ── Backend: Node.js CommonJS ──────────────────────────────────
  {
    files: [
      "server.js",
      "config/**/*.js",
      "scripts/**/*.js",
      "src/**/*.js",
      "public/api/**/*.js"
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.commonjs },
      ecmaVersion: "latest"
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: ["warn", "always"],
      "no-console": "off",
      "no-empty": "warn",
      "prefer-const": "warn",
      "no-var": "warn"
    }
  },

  // ── Vercel/Next.js middleware (ESM) ───────────────────────────
  {
    files: ["middleware.js"],
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: ["warn", "always"],
      "no-console": "off",
      "no-empty": "warn",
      "prefer-const": "warn",
      "no-var": "warn"
    }
  },

  // ── Frontend: Browser JS ──────────────────────────────────────
  {
    files: ["public/js/**/*.js"],
    ignores: [
      "public/js/vendor/**",
      "public/js/github-stars.js",
      "public/js/globe-worker.js"
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        // CDN / vendor globals
        firebase: "readonly",
        Chart: "readonly",
        QRCode: "readonly",
        Globe: "readonly",
        DomPurify: "readonly",
        io: "readonly",
        QRCodeStyling: "readonly",
        THREE: "readonly",
        d3: "readonly",
        // Cross-file shared globals (declared in other JS files)
        getAuthToken: "readonly",
        showToast: "readonly",
        apiCall: "readonly",
        QRGenerator: "readonly",
        auth: "readonly",
        googleProvider: "readonly",
        showDashboard: "readonly",
        allGeoClicks: "writable",
        currentUser: "writable",
        userLinks: "writable",
        userProfile: "writable",
        userBioSlug: "writable",
        filteredGeoClicks: "writable",
        currentGeoSort: "writable",
        currentGeoFilter: "writable",
        currentTheme: "writable",
        initBioLink: "readonly",
        logoutBtn: "readonly",
        verifyUserBeforeAction: "readonly",
        currentGeoView: "readonly",
        updateGlobeData: "readonly",
        navigateToPage: "readonly",
        escapeHtml: "readonly",
        loadLinks: "readonly",
        loadAnalytics: "readonly",
        loadProfile: "readonly",
        loadDetailedGeographicData: "readonly",
        openCreateLinkModal: "readonly",
        closeCreateLinkModal: "readonly",
        handleCreateLink: "readonly",
        handleLogout: "readonly",
        handleDeleteAccount: "readonly",
        validateUsername: "readonly",
        validateCustomShortCode: "readonly",
        setUsername: "readonly",
        hideUsernameModal: "readonly",
        filterLinks: "readonly",
        sortLinks: "readonly",
        handleGlobalSearch: "readonly",
        loadUserProfile: "readonly",
        debounceAnalyticsUpdate: "readonly",
        calculatePercentageChange: "readonly",
        renderSplitTestAnalytics: "readonly",
        formatDate: "readonly",
        loadLinkAnalytics: "readonly",
        currentPage: "writable",
        // Initialization functions (defined in module files, called from app.js bootstrap)
        initializeTheme: "readonly",
        initializeAuth: "readonly",
        initializeNavigation: "readonly",
        initializeEventListeners: "readonly",
        initializeSplitTestEventListeners: "readonly",
        checkForURLParameter: "readonly",
        showLoginModal: "readonly",
        backendRuntimeStatus: "writable",
        // Analytics functions
        renderClicksChart: "readonly",
        processClicksOverTime: "readonly",
        filterClicksChart: "readonly"
      },
      ecmaVersion: "latest"
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: ["warn", "always"],
      "no-console": "off",
      "no-empty": "warn",
      "prefer-const": "warn",
      "no-var": "warn"
    }
  },

  // ── Web Worker (globe-worker.js) ──────────────────────────────
  {
    files: ["public/js/globe-worker.js"],
    languageOptions: {
      globals: {
        ...globals.worker,
        THREE: "readonly"
      },
      ecmaVersion: "latest"
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: ["warn", "always"],
      "no-console": "off",
      "no-empty": "warn",
      "prefer-const": "warn",
      "no-var": "warn"
    }
  },

  // ── github-stars.js (dual browser + Node) ─────────────────────
  {
    files: ["public/js/github-stars.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: "latest"
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: ["warn", "always"],
      "no-console": "off",
      "no-empty": "warn",
      "prefer-const": "warn",
      "no-var": "warn"
    }
  }
];
