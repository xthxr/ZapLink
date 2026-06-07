// ================================
// BOOTSTRAP — App Initialization
// ================================

document.addEventListener('DOMContentLoaded', () => {
    checkBackendRuntimeStatus();
    initializeTheme();
    initializeAuth();
    initializeNavigation();
    initializeEventListeners();
    initializeSplitTestEventListeners();
    checkForURLParameter();
    initializeLandingPage();
});

async function checkBackendRuntimeStatus() {
    try {
        const response = await fetch('/api/system/status');
        if (!response.ok) return;

        const data = await response.json();
        backendRuntimeStatus = data;

        if (data?.firebase?.enabled === false) {
            showFirebaseFallbackNotice(data.firebase);
        }
    } catch (error) {
        console.warn('Runtime status unavailable:', error.message);
    }
}

function showFirebaseFallbackNotice(firebaseStatus) {
    const existingBanner = document.getElementById('firebaseFallbackBanner');
    if (existingBanner) return;

    const banner = document.createElement('div');
    banner.id = 'firebaseFallbackBanner';
    banner.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'right: 0',
        'z-index: 9999',
        'padding: 10px 16px',
        'font-size: 14px',
        'font-weight: 600',
        'text-align: center',
        'color: #1f1a00',
        'background: linear-gradient(90deg, #ffe7a3, #ffd56a)',
        'border-bottom: 1px solid #f0c14b'
    ].join(';');
    banner.textContent = `Firebase is disabled (${firebaseStatus.reason}). Auth and persistent database routes are unavailable in this local session.`;

    document.body.prepend(banner);
    showToast('Firebase fallback mode is active. Some features are disabled.', 'warning');
}

// Landing page event listeners
function initializeLandingPage() {
    const landingLoginBtn = document.getElementById('landingLoginBtn');
    const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
    const loginModalClose = document.getElementById('loginModalClose');
    const suggestionsForm = document.getElementById('suggestionsForm');
    const suggestionInput = document.getElementById('suggestionInput');

    if (landingLoginBtn) {
        landingLoginBtn.addEventListener('click', () => {
            if (typeof showLoginModal === 'function') showLoginModal();
        });
    }

    if (heroGetStartedBtn) {
        heroGetStartedBtn.addEventListener('click', () => {
            if (typeof showLoginModal === 'function') showLoginModal();
        });
    }

    if (loginModalClose) {
        loginModalClose.addEventListener('click', () => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'none';
        });
    }

    if (suggestionsForm) {
        suggestionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const suggestion = suggestionInput.value.trim();

            if (suggestion) {
                const discussionUrl = `https://github.com/xthxr/Link360/discussions/new?category=ideas&title=${encodeURIComponent(suggestion)}`;
                window.open(discussionUrl, '_blank');
                suggestionInput.value = '';
                showToast('Opening GitHub Discussions...', 'success');
            }
        });
    }
}
