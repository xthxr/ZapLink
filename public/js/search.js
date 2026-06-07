// ================================
// GLOBAL SEARCH
// ================================

function initializeGlobalSearch() {
    searchableContent.features = [
        { name: 'Create Link', description: 'Shorten a new URL', icon: 'plus', action: () => {
            if (typeof openCreateLinkModal === 'function') openCreateLinkModal();
        }},
        { name: 'Analytics Dashboard', description: 'View detailed analytics', icon: 'chart-line', action: () => navigateToPage('analytics') },
        { name: 'QR Code Generator', description: 'Generate QR codes for links', icon: 'qrcode', action: () => {
            if (typeof openCreateLinkModal === 'function') openCreateLinkModal();
        }},
        { name: 'Custom Short Code', description: 'Create custom branded links', icon: 'edit', action: () => {
            if (typeof openCreateLinkModal === 'function') openCreateLinkModal();
        }},
        { name: 'UTM Parameters', description: 'Add tracking parameters', icon: 'tags', action: () => {
            if (typeof openCreateLinkModal === 'function') openCreateLinkModal();
        }},
        { name: 'Report Bug', description: 'Report an issue', icon: 'bug', action: () => {
            if (typeof openBugReportModal === 'function') openBugReportModal();
        }},
        { name: 'Dark Mode', description: 'Toggle dark theme', icon: 'moon', action: () => setTheme('dark') },
        { name: 'Light Mode', description: 'Toggle light theme', icon: 'sun', action: () => setTheme('light') },
    ];

    searchableContent.pages = [
        { name: 'Home', description: 'View all your links', icon: 'home', path: 'home' },
        { name: 'Analytics', description: 'Detailed analytics dashboard', icon: 'chart-line', path: 'analytics' },
        { name: 'Profile', description: 'Manage your profile', icon: 'user', path: 'profile' },
    ];
}

function handleGlobalSearch(e) {
    const query = e.target.value.trim();

    const searchClear = document.getElementById('searchClear');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (searchClear) {
        searchClear.style.display = query ? 'block' : 'none';
    }

    if (!searchSuggestions) return;

    if (query.length < 2) {
        searchSuggestions.style.display = 'none';
        return;
    }

    const results = performGlobalSearch(query);
    displaySearchSuggestions(results);
}

function performGlobalSearch(query) {
    const lowerQuery = query.toLowerCase();
    const results = {
        links: [],
        features: [],
        pages: []
    };

    results.links = (typeof userLinks !== 'undefined' ? userLinks : [])
        .filter(link =>
            link.originalUrl.toLowerCase().includes(lowerQuery) ||
            link.shortUrl.toLowerCase().includes(lowerQuery) ||
            link.shortCode.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 5);

    results.features = (searchableContent.features || [])
        .filter(feature =>
            feature.name.toLowerCase().includes(lowerQuery) ||
            feature.description.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 4);

    results.pages = (searchableContent.pages || [])
        .filter(page =>
            page.name.toLowerCase().includes(lowerQuery) ||
            page.description.toLowerCase().includes(lowerQuery)
        );

    return results;
}

function displaySearchSuggestions(results) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (!searchSuggestions) return;

    const hasResults = results.links.length > 0 || results.features.length > 0 || results.pages.length > 0;

    if (!hasResults) {
        searchSuggestions.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No results found</p>
            </div>
        `;
        searchSuggestions.style.display = 'block';
        return;
    }

    let html = '';

    if (results.links.length > 0) {
        html += `
            <div class="search-suggestion-group">
                <div class="search-suggestion-header">Links</div>
                ${results.links.map(link => `
                    <div class="search-suggestion-item" onclick="handleSuggestionClick('link', '${link.shortCode}')">
                        <div class="search-suggestion-icon link">
                            <i class="fas fa-link"></i>
                        </div>
                        <div class="search-suggestion-content">
                            <div class="search-suggestion-title">${escapeHtml(link.shortUrl.replace('https://', '').replace('http://', ''))}</div>
                            <div class="search-suggestion-subtitle">${escapeHtml(truncateText(link.originalUrl, 50))}</div>
                        </div>
                        <div class="search-suggestion-meta">${link.clicks || 0} clicks</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (results.features.length > 0) {
        html += `
            <div class="search-suggestion-group">
                <div class="search-suggestion-header">Features</div>
                ${results.features.map((feature, index) => `
                    <div class="search-suggestion-item" onclick="handleSuggestionClick('feature', ${index})">
                        <div class="search-suggestion-icon feature">
                            <i class="fas fa-${feature.icon}"></i>
                        </div>
                        <div class="search-suggestion-content">
                            <div class="search-suggestion-title">${escapeHtml(feature.name)}</div>
                            <div class="search-suggestion-subtitle">${escapeHtml(feature.description)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (results.pages.length > 0) {
        html += `
            <div class="search-suggestion-group">
                <div class="search-suggestion-header">Pages</div>
                ${results.pages.map(page => `
                    <div class="search-suggestion-item" onclick="handleSuggestionClick('page', '${page.path}')">
                        <div class="search-suggestion-icon page">
                            <i class="fas fa-${page.icon}"></i>
                        </div>
                        <div class="search-suggestion-content">
                            <div class="search-suggestion-title">${escapeHtml(page.name)}</div>
                            <div class="search-suggestion-subtitle">${escapeHtml(page.description)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    searchSuggestions.innerHTML = html;
    searchSuggestions.style.display = 'block';
}

function handleSuggestionClick(type, data) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    if (searchSuggestions) searchSuggestions.style.display = 'none';
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';

    if (type === 'link') {
        if (typeof viewAnalytics === 'function') viewAnalytics(data);
    } else if (type === 'feature') {
        const feature = searchableContent.features[data];
        if (feature && feature.action) {
            feature.action();
        }
    } else if (type === 'page') {
        navigateToPage(data);
    }
}

// Initialize global search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGlobalSearch();
});

// Make globally available
window.initializeGlobalSearch = initializeGlobalSearch;
window.handleGlobalSearch = handleGlobalSearch;
window.performGlobalSearch = performGlobalSearch;
window.displaySearchSuggestions = displaySearchSuggestions;
window.handleSuggestionClick = handleSuggestionClick;
