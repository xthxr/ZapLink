// ================================
// EVENT LISTENERS
// ================================

function initializeCustomSelects() {
    const selects = document.querySelectorAll('.filter-select');

    selects.forEach(select => {
        if (!select.classList.contains('enhanced')) {
            select.classList.add('enhanced');
            select.addEventListener('change', () => {
                select.style.fontWeight = '600';
            });
        }
    });
}

function initializeEventListeners() {
    // Logo click handler
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('home');
        });
    }

    // Sidebar toggle for collapse/expand
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('piikme-sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });

        const isCollapsed = localStorage.getItem('piikme-sidebar-collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('show');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (sidebar && sidebar.classList.contains('show') &&
            !sidebar.contains(e.target) &&
            e.target !== mobileMenuBtn) {
            sidebar.classList.remove('show');
        }
    });

    // Close sidebar when clicking on nav items on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.remove('show');
            }
        });
    });

    // User dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }

    // Create link modal
    const createLinkBtn = document.getElementById('createLinkBtn');
    const createFirstBtn = document.getElementById('createFirstBtn');
    if (createLinkBtn) {
        createLinkBtn.addEventListener('click', () => {
            if (typeof openCreateLinkModal === 'function') openCreateLinkModal();
        });
    }
    if (createFirstBtn) {
        createFirstBtn.addEventListener('click', () => {
            if (typeof openCreateLinkModal === 'function') openCreateLinkModal();
        });
    }

    // Modal close handlers
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalClose) modalClose.addEventListener('click', () => {
        if (typeof closeCreateLinkModal === 'function') closeCreateLinkModal();
    });
    if (modalCancel) modalCancel.addEventListener('click', () => {
        if (typeof closeCreateLinkModal === 'function') closeCreateLinkModal();
    });
    if (modalOverlay) modalOverlay.addEventListener('click', () => {
        if (typeof closeCreateLinkModal === 'function') closeCreateLinkModal();
    });

    // Create link submit
    const createLinkSubmit = document.getElementById('createLinkSubmit');
    if (createLinkSubmit) {
        createLinkSubmit.addEventListener('click', () => {
            if (typeof handleCreateLink === 'function') handleCreateLink();
        });
    }

    // Custom short code validation
    const customShortCode = document.getElementById('customShortCode');
    const shortCodeCounter = document.getElementById('shortCodeCounter');
    const customShortCodeError = document.getElementById('customShortCodeError');
    const customShortCodeSuccess = document.getElementById('customShortCodeSuccess');
    if (customShortCode) {
        customShortCode.addEventListener('input', () => {
            const rawValue = customShortCode.value;
            const sanitized = rawValue.replace(/[^a-zA-Z0-9-_]/g, '');
            customShortCode.value = sanitized;
            if (shortCodeCounter) shortCodeCounter.textContent = sanitized.length;
            if (sanitized.length > 0) {
                if (typeof validateCustomShortCode === 'function') validateCustomShortCode(sanitized);
            } else {
                if (customShortCodeError) customShortCodeError.style.display = 'none';
                if (customShortCodeSuccess) customShortCodeSuccess.style.display = 'none';
            }
        });
    }

    // Username validation
    const usernameInput = document.getElementById('usernameInput');
    const usernameError = document.getElementById('usernameError');
    const usernameSuccess = document.getElementById('usernameSuccess');
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            const value = usernameInput.value;
            usernameInput.value = value.replace(/[^a-zA-Z0-9-_]/g, '');
            if (value.length > 0) {
                if (typeof validateUsername === 'function') validateUsername(value);
            } else {
                if (usernameError) usernameError.style.display = 'none';
                if (usernameSuccess) usernameSuccess.style.display = 'none';
            }
        });
    }

    const setUsernameBtn = document.getElementById('setUsernameBtn');
    const skipUsernameBtn = document.getElementById('skipUsernameBtn');
    if (setUsernameBtn) {
        setUsernameBtn.addEventListener('click', () => {
            if (typeof setUsername === 'function') setUsername();
        });
    }
    if (skipUsernameBtn) {
        skipUsernameBtn.addEventListener('click', () => {
            if (typeof hideUsernameModal === 'function') hideUsernameModal();
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            if (typeof handleLogout === 'function') handleLogout(e);
        });
    }

    // Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', (e) => {
            if (typeof handleDeleteAccount === 'function') handleDeleteAccount(e);
        });
    }

    // Global Search
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchClear = document.getElementById('searchClear');
    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', (e) => {
            if (typeof handleGlobalSearch === 'function') handleGlobalSearch(e);
        });
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() && searchSuggestions) {
                searchSuggestions.style.display = 'block';
            }
        });
    }

    if (searchClear && searchInput && searchSuggestions) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            searchSuggestions.style.display = 'none';
        });
    }

    // Close search suggestions when clicking outside
    if (searchSuggestions) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchSuggestions.style.display = 'none';
            }
        });
    }

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (typeof filterLinks === 'function') filterLinks(tab.dataset.filter);
        });
    });

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (typeof sortLinks === 'function') sortLinks(sortSelect.value);
        });
    }

    // Initialize custom styled selects
    initializeCustomSelects();

    // Date range filter buttons for clicks chart
    document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const days = btn.dataset.days === 'all' ? 'all' : parseInt(btn.dataset.days);
            if (typeof filterClicksChart === 'function') filterClicksChart(days);
        });
    });
}
