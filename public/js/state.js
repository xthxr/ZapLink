// ================================
// SHARED STATE & DOM REFERENCES
// ================================

// State
let currentPage = 'home';
let currentTheme = 'dark';
let userLinks = [];
// currentUser is declared in auth.js
let userProfile = null;
let userBioSlug = null;
let backendRuntimeStatus = null;

// Debounce utility for real-time updates
let analyticsUpdateTimeout = null;
function debounceAnalyticsUpdate(callback, delay = 300) {
    if (analyticsUpdateTimeout) {
        clearTimeout(analyticsUpdateTimeout);
    }
    analyticsUpdateTimeout = setTimeout(callback, delay);
}

// Helper function to convert shortCode to Firestore-safe document ID
function toFirestoreId(shortCode) {
    return shortCode.replace(/\//g, '_');
}

// DOM Elements
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');

// Theme Elements
const themeBtns = document.querySelectorAll('.theme-btn');
const html = document.documentElement;

// User Elements
const sidebarUser = document.getElementById('sidebarUser');
const sidebarUserPhoto = document.getElementById('sidebarUserPhoto');
const sidebarUserName = document.getElementById('sidebarUserName');
const sidebarUserEmail = document.getElementById('sidebarUserEmail');
const topbarUserPhoto = document.getElementById('topbarUserPhoto');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
// logoutBtn is declared in auth.js

// Modal Elements
const createLinkModal = document.getElementById('createLinkModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const createLinkBtn = document.getElementById('createLinkBtn');
const createFirstBtn = document.getElementById('createFirstBtn');
const createLinkSubmit = document.getElementById('createLinkSubmit');
const loginModal = document.getElementById('loginModal');

// Username Modal Elements
const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const usernameError = document.getElementById('usernameError');
const usernameSuccess = document.getElementById('usernameSuccess');
const setUsernameBtn = document.getElementById('setUsernameBtn');
const skipUsernameBtn = document.getElementById('skipUsernameBtn');

// Bug Report Modal Elements
const bugReportModal = document.getElementById('bugReportModal');
const reportBugBtn = document.getElementById('reportBugBtn');
const closeBugReportModal = document.getElementById('closeBugReportModal');
const cancelBugReport = document.getElementById('cancelBugReport');
const bugReportForm = document.getElementById('bugReportForm');

// Home Page Elements
const linksContainer = document.getElementById('linksContainer');
const emptyState = document.getElementById('emptyState');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const searchSuggestions = document.getElementById('searchSuggestions');

// Global search data
let searchableContent = {
    links: [],
    features: [],
    pages: []
};

// Form Elements
const customShortCode = document.getElementById('customShortCode');
const shortCodeCounter = document.getElementById('shortCodeCounter');
const customShortCodeError = document.getElementById('customShortCodeError');
const customShortCodeSuccess = document.getElementById('customShortCodeSuccess');

// Stats Elements
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');
const activeLinksEl = document.getElementById('activeLinks');
const avgClickRateEl = document.getElementById('avgClickRate');

// Form Elements
const destinationUrl = document.getElementById('destinationUrl');
const utmSource = document.getElementById('utmSource');
const utmMedium = document.getElementById('utmMedium');
const utmCampaign = document.getElementById('utmCampaign');
const utmTerm = document.getElementById('utmTerm');
const utmContent = document.getElementById('utmContent');

// Split Test State
let currentSplitTestShortCode = null;
let splitTestChartInstance = null;

// Geo Analytics State
let allGeoClicks = [];
let filteredGeoClicks = [];
let currentGeoFilter = 'all';
let currentGeoSort = 'recent';
