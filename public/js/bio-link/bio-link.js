// ================================
// BIO LINK MODULE — BOOTSTRAP
// ================================
// Core utilities, shared state, and initialization.
// Load this FIRST — all other bio-link modules depend on it.

// --- DOMPurify for XSS protection ---
let DOMPurify;
(function() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js';
    script.integrity = 'sha384-cwS6YdhLI7XS60eoDiC+egV0qHp8zI+Cms46R0nbn8JrmoAzV9uFL60etMZhAnSu';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
        DOMPurify = window.DOMPurify;
        console.log('✅ DOMPurify loaded for XSS protection');
    };
    script.onerror = () => {
        console.warn('⚠️  DOMPurify failed to load, using fallback sanitization');
        DOMPurify = {
            sanitize: (dirty) => escapeHtml(dirty)
        };
    };
    document.head.appendChild(script);
})();

// --- HTML-encoding helper (shared escape logic) ---
function escapeHtml(dirty) {
    if (typeof dirty !== 'string') return '';
    return dirty.replace(/[&<>"']/g, (char) => {
        const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
        return entities[char];
    });
}

// --- Sanitize helper ---
function sanitizeHTML(dirty) {
    if (!dirty) return '';
    if (!DOMPurify) {
        return escapeHtml(String(dirty));
    }
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
    });
}

// --- Shared global state (used across bio-link modules) ---
let bioLinks = [];
// eslint-disable-next-line no-unused-vars
let currentBioLink = null;
// eslint-disable-next-line no-unused-vars
let bioLinkItems = [];

// --- Authenticated API call helper ---
async function apiCall(url, options = {}) {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('Authentication required');
    }
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }
    if (!response.ok) {
        throw new Error(data.error || data.message || data || 'Request failed');
    }
    return data;
}

// --- Firestore timestamp parser (recursive) ---
function parseTimestamps(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => parseTimestamps(item));
    }
    const result = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object') {
            if ('_seconds' in val && typeof val._seconds === 'number') {
                // Firestore timestamp → Date
                result[key] = new Date(val._seconds * 1000 + (val.nanoseconds || 0) / 1000000);
            } else if (!(val instanceof Date)) {
                // Recurse into nested objects/arrays
                result[key] = parseTimestamps(val);
            } else {
                result[key] = val;
            }
        } else {
            result[key] = val;
        }
    }
    return result;
}

// --- Initialize Bio Link module ---
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 10;

function initBioLink() {
    console.log('Initializing Bio Link module');

    if (typeof firebase === 'undefined') {
        initAttempts++;
        console.error('Firebase not loaded (attempt ' + initAttempts + '/' + MAX_INIT_ATTEMPTS + ')');
        if (initAttempts < MAX_INIT_ATTEMPTS) {
            setTimeout(initBioLink, 500);
        } else {
            console.error('Firebase failed to load after ' + MAX_INIT_ATTEMPTS + ' attempts');
            const container = document.getElementById('bioLinksContainer');
            const emptyState = document.getElementById('bioLinksEmptyState');
            if (container) container.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'flex';
                emptyState.innerHTML = '<div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div><h3>Service unavailable</h3><p>Please try refreshing the page</p>';
            }
        }
        return;
    }

    const user = firebase.auth().currentUser;
    if (user) {
        loadBioLinks();
    } else {
        const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                loadBioLinks();
                unsubscribe();
            } else {
                console.log('User not authenticated for bio links');
                const container = document.getElementById('bioLinksContainer');
                const emptyState = document.getElementById('bioLinksEmptyState');
                if (container) container.style.display = 'none';
                if (emptyState) {
                    emptyState.style.display = 'flex';
                    emptyState.innerHTML = `
                        <div class="empty-state-icon">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h3>Please log in</h3>
                        <p>You need to be logged in to create bio links</p>
                    `;
                }
                unsubscribe();
            }
        });
    }
}

// --- Load all bio links for the current user ---
async function loadBioLinks() {
    try {
        const token = await getAuthToken();
        if (!token) {
            console.error('User not authenticated');
            showToast('Please log in to view bio links', 'error');
            return;
        }

        console.log('Loading bio links');

        const response = await fetch('/api/bio-links', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to load bio links');
        }

        bioLinks = (result.bioLinks || []).map(link => parseTimestamps(link));
        console.log('Loaded', bioLinks.length, 'bio links');

        bioLinks.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.toDate?.()?.getTime() || 0);
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.toDate?.()?.getTime() || 0);
            return dateB - dateA;
        });

        renderBioLinks();
        updateBioLinkStats();

        const createBtn = document.getElementById('createBioLinkBtn');
        const editor = document.getElementById('bioLinkEditor');
        const emptyState = document.getElementById('bioLinksEmptyState');
        const statsGrid = document.getElementById('bioLinkStatsGrid');

        if (bioLinks.length > 0) {
            if (createBtn) createBtn.style.display = 'none';
            if (emptyState) emptyState.style.display = 'none';
            if (editor) {
                editor.style.display = 'block';
                loadBioLinkIntoEditor(bioLinks[0]);
            }
            if (statsGrid) statsGrid.style.display = 'grid';
        } else {
            if (createBtn) createBtn.style.display = 'flex';
            if (editor) editor.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            if (statsGrid) statsGrid.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading bio links:', error);
        showToast('Failed to load bio links: ' + (error.message || 'Unknown error'), 'error');
    }
}

// --- Render bio links grid (stub — legacy) ---
function renderBioLinks() {
    // No longer needed — using inline editor
}

// --- Update bio link stats ---
function updateBioLinkStats() {
    const totalBioLinks = bioLinks.length;
    const totalViews = bioLinks.reduce((sum, bl) => sum + (bl.views || 0), 0);
    const totalClicks = bioLinks.reduce((sum, bl) => sum + (bl.clicks || 0), 0);
    const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

    const elTotal = document.getElementById('totalBioLinks');
    const elViews = document.getElementById('totalBioViews');
    const elClicks = document.getElementById('totalBioClicks');
    const elCTR = document.getElementById('avgBioCTR');
    if (elTotal) elTotal.textContent = totalBioLinks;
    if (elViews) elViews.textContent = totalViews;
    if (elClicks) elClicks.textContent = totalClicks;
    if (elCTR) elCTR.textContent = avgCTR + '%';
}

// --- Global namespace for the bio-link module ---
window.bioLinkModule = {
    version: '1.0.0',
    escapeHtml,
    sanitizeHTML,
    apiCall,
    parseTimestamps,
    initBioLink,
    loadBioLinks,
    renderBioLinks,
    updateBioLinkStats
};
