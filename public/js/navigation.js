// ================================
// NAVIGATION & THEME SYSTEM
// ================================

function checkForURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledUrl = urlParams.get('url');

    if (prefilledUrl) {
        const checkAuthInterval = setInterval(() => {
            if (typeof currentUser !== 'undefined' && currentUser) {
                clearInterval(checkAuthInterval);
                if (typeof openCreateLinkModal === 'function') {
                    openCreateLinkModal();
                }
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkAuthInterval);
        }, 5000);
    }
}

function initializeTheme() {
    setTheme('dark');
}

function setTheme(theme) {
    currentTheme = 'dark';
    const html = document.documentElement;
    if (html) {
        html.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('piikme-theme', 'dark');
}

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const page = item.dataset.page;
            if (page) {
                e.preventDefault();
                navigateToPage(page, true);
            }
        });
    });

    window.addEventListener('popstate', (e) => {
        const path = window.location.pathname;
        const page = path.substring(1) || 'home';
        navigateToPage(page, false);
    });

    const initialPath = window.location.pathname;
    const initialPage = initialPath.substring(1) || 'home';
    navigateToPage(initialPage, false);
}

function navigateToPage(page, updateHistory = true) {
    if (!page || page === '' || page === '/') {
        page = 'home';
    }

    // Stop analytics polling when leaving the analytics page
    if (window.analyticsPollInterval) {
        clearInterval(window.analyticsPollInterval);
        window.analyticsPollInterval = null;
        window.analyticsPollFilter = null;
    }

    currentPage = page;

    if (updateHistory) {
        window.history.pushState({ page }, '', `/${page}`);
    }

    localStorage.setItem('piikme-current-page', page);

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.style.display = p.id === `${page}Page` ? 'block' : 'none';
    });

    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        home: 'Home',
        analytics: 'Analytics',
        profile: 'Profile',
        'qr-generator': 'QR Generator',
        'geo-details': 'Geographic Details',
        'bio-link': 'Bio Link'
    };
    if (pageTitle) pageTitle.textContent = titles[page] || page;
    document.title = `piik.me - ${titles[page] || page}`;

    // Load page data
    if (page === 'home') {
        if (typeof loadLinks === 'function') loadLinks();
    } else if (page === 'analytics') {
        if (typeof loadAnalytics === 'function') loadAnalytics();
    } else if (page === 'profile') {
        if (typeof loadProfile === 'function') loadProfile();
    } else if (page === 'qr-generator') {
        setTimeout(() => {
            if (window.QRGenerator && !window.QRGenerator.initialized) {
                window.QRGenerator.init();
                window.QRGenerator.initialized = true;
            }
        }, 100);
    } else if (page === 'geo-details') {
        if (typeof loadDetailedGeographicData === 'function') loadDetailedGeographicData();
    } else if (page === 'bio-link') {
        if (typeof initBioLink === 'function') {
            initBioLink();
        }
    }

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 1024) {
        sidebar.classList.remove('show');
    }
}

// Expose globally for inline onclick handlers
window.navigateToPage = navigateToPage;
window.setTheme = setTheme;
