// Authentication State Management

let currentUser = null;
let authToken = null;

// Auth UI Elements (may not exist in all pages)
const loginSection = document.getElementById('loginSection');
const userSection = document.getElementById('userSection');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const promptLoginBtn = document.getElementById('promptLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');

// Section Elements
const loginPrompt = document.getElementById('loginPrompt');
const dashboardSection = document.getElementById('dashboardSection');
const shortenerSection = document.querySelector('.shortener-section');

// Initialize Auth State Listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        authToken = await user.getIdToken();
        
        // Update UI (only if elements exist)
        if (userPhoto) userPhoto.src = user.photoURL || 'https://via.placeholder.com/40';
        if (userName) userName.textContent = user.displayName || user.email;
        
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) userSection.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
        
        // Show dashboard by default - wait for app.js to load
        if (typeof showDashboard === 'function') {
            showDashboard();
        } else {
            // Fallback: wait for DOM to be ready and retry
            window.addEventListener('DOMContentLoaded', () => {
                if (typeof showDashboard === 'function') {
                    showDashboard();
                }
            });
        }
    } else {
        currentUser = null;
        authToken = null;
        
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (dashboardSection) dashboardSection.style.display = 'none';
        if (shortenerSection) shortenerSection.style.display = 'none';
        
        // Hide analytics if visible
        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) analyticsSection.style.display = 'none';
    }
});

// Google Sign In
async function signInWithGoogle() {
    try {
        // Try redirect method first (better for embedded browsers)
        if (window.location !== window.parent.location) {
            // We're in an iframe/embedded browser, use redirect
            await auth.signInWithRedirect(googleProvider);
        } else {
            // Try popup method
            const result = await auth.signInWithPopup(googleProvider);
            console.log('Signed in:', result.user.displayName);
        }
    } catch (error) {
        console.error('Error signing in:', error);
        
        if (error.code === 'auth/popup-blocked') {
            // Fallback to redirect if popup is blocked
            console.log('Popup blocked, trying redirect...');
            await auth.signInWithRedirect(googleProvider);
        } else if (error.code === 'auth/popup-closed-by-user') {
            // User closed popup, do nothing
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('This domain is not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains');
        } else {
            alert('Error signing in: ' + error.message + '\n\nTip: Try opening in a regular browser instead of VS Code.');
        }
    }
}

// Handle redirect result
auth.getRedirectResult().then((result) => {
    if (result.user) {
        console.log('Signed in via redirect:', result.user.displayName);
    }
}).catch((error) => {
    console.error('Redirect error:', error);
});

// Sign Out
async function signOut() {
    try {
        await auth.signOut();
        console.log('Signed out');
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

// Event Listeners
if (googleLoginBtn) googleLoginBtn.addEventListener('click', signInWithGoogle);
if (promptLoginBtn) promptLoginBtn.addEventListener('click', signInWithGoogle);
if (logoutBtn) logoutBtn.addEventListener('click', signOut);

// Get Auth Token (for API calls)
async function getAuthToken() {
    if (currentUser) {
        return await currentUser.getIdToken();
    }
    return null;
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Verify user before sensitive actions (2FA reauthentication)
async function verifyUserBeforeAction(actionDescription = 'perform this action') {
    if (!currentUser) {
        showToast('Please sign in first', 'error');
        return false;
    }

    try {
        // Show loading state
        const loadingToast = showToast(`Verifying identity to ${actionDescription}...`, 'info');

        // Reauthenticate with popup
        const result = await auth.currentUser.reauthenticateWithPopup(window.googleProvider);
        
        console.log('✅ User reauthenticated:', result.user.email);
        
        // Clear loading toast
        if (loadingToast && loadingToast.remove) loadingToast.remove();
        
        showToast('Identity verified successfully', 'success');
        return true;
        
    } catch (error) {
        console.error('Reauthentication failed:', error);
        
        // Handle specific error cases
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Verification cancelled', 'info');
        } else if (error.code === 'auth/popup-blocked') {
            showToast('Please allow popups to verify your identity', 'error');
        } else if (error.code === 'auth/user-mismatch') {
            showToast('Please sign in with the same account', 'error');
        } else if (error.code === 'auth/cancelled-popup-request') {
            // Another popup is already open, ignore silently
            showToast('Verification cancelled', 'info');
        } else {
            showToast('Verification failed: ' + error.message, 'error');
        }
        
        return false;
    }
}

// ================================
// ADDITIONAL AUTH FUNCTIONS (from app.js)
// ================================

async function initializeAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;

                await loadUserProfile();

                showAuthenticatedUI();

                const landingPage = document.getElementById('landingPage');
                const appContainer = document.getElementById('app');
                if (landingPage) landingPage.style.display = 'none';
                if (appContainer) appContainer.style.display = 'flex';

                if (!userProfile || !userProfile.username) {
                    showUsernameModal();
                }

                const currentPath = window.location.pathname;
                const currentPageFromUrl = currentPath.substring(1) || 'home';

                navigateToPage(currentPageFromUrl, false);

                if (currentPageFromUrl === 'home') {
                    if (typeof loadLinks === 'function') loadLinks();
                } else if (currentPageFromUrl === 'analytics') {
                    if (typeof loadAnalytics === 'function') loadAnalytics();
                } else if (currentPageFromUrl === 'profile') {
                    if (typeof loadProfile === 'function') loadProfile();
                } else if (currentPageFromUrl === 'qr-generator') {
                    setTimeout(() => {
                        if (window.QRGenerator && !window.QRGenerator.initialized) {
                            window.QRGenerator.init();
                            window.QRGenerator.initialized = true;
                        }
                    }, 100);
                }
            } else {
                currentUser = null;
                userProfile = null;
                showLandingPage();
            }
        });

        firebase.auth().getRedirectResult().then((result) => {
            if (result.user) {
                console.log('Signed in via redirect:', result.user.displayName);
                showToast('Welcome ' + result.user.displayName + '!', 'success');

                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none';
                const currentPath = window.location.pathname;
                const currentPageFromUrl = currentPath.substring(1) || 'home';
                navigateToPage(currentPageFromUrl);
            }
        }).catch((error) => {
            console.error('Redirect error:', error);
            showToast('Error signing in: ' + error.message, 'error');
        });
    } else {
        showLandingPage();
    }
}

async function loadUserProfile() {
    try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            userProfile = data.profile;
            userBioSlug = userProfile.username;
            console.log('User profile loaded:', userProfile);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

function showUsernameModal() {
    const usernameModal = document.getElementById('usernameModal');
    if (usernameModal) {
        usernameModal.style.display = 'flex';
    }
}

function hideUsernameModal() {
    const usernameModal = document.getElementById('usernameModal');
    const usernameInput = document.getElementById('usernameInput');
    const usernameError = document.getElementById('usernameError');
    const usernameSuccess = document.getElementById('usernameSuccess');
    if (usernameModal) usernameModal.style.display = 'none';
    if (usernameInput) usernameInput.value = '';
    if (usernameError) usernameError.style.display = 'none';
    if (usernameSuccess) usernameSuccess.style.display = 'none';
}

let usernameValidateTimeout;
async function validateUsername(username) {
    clearTimeout(usernameValidateTimeout);

    const usernameError = document.getElementById('usernameError');
    const usernameSuccess = document.getElementById('usernameSuccess');

    if (!usernameError || !usernameSuccess) return false;

    if (username.length < 3) {
        usernameError.textContent = 'Username must be at least 3 characters';
        usernameError.style.display = 'block';
        usernameSuccess.style.display = 'none';
        return false;
    }

    if (username.length > 20) {
        usernameError.textContent = 'Username must be less than 20 characters';
        usernameError.style.display = 'block';
        usernameSuccess.style.display = 'none';
        return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        usernameError.textContent = 'Only letters, numbers, hyphens, and underscores allowed';
        usernameError.style.display = 'block';
        usernameSuccess.style.display = 'none';
        return false;
    }

    usernameError.style.display = 'none';
    usernameSuccess.textContent = '⏳ Checking availability...';
    usernameSuccess.style.display = 'block';

    usernameValidateTimeout = setTimeout(async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const response = await fetch(`/api/check-username/${encodeURIComponent(username)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.available) {
                    usernameError.style.display = 'none';
                    usernameSuccess.textContent = '✓ Username is available!';
                    usernameSuccess.style.display = 'block';
                    return true;
                } else {
                    usernameError.textContent = data.error || '✗ Username is already taken';
                    usernameError.style.display = 'block';
                    usernameSuccess.style.display = 'none';
                    return false;
                }
            }
        } catch (error) {
            console.error('Error checking username:', error);
        }
    }, 300);
}

async function setUsername() {
    const usernameInput = document.getElementById('usernameInput');
    const setUsernameBtn = document.getElementById('setUsernameBtn');
    if (!usernameInput || !setUsernameBtn) return;

    const username = usernameInput.value.trim();

    if (!username || username.length < 3) {
        showToast('Please enter a valid username', 'error');
        return;
    }

    setUsernameBtn.disabled = true;
    setUsernameBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Setting...';

    try {
        const token = await getAuthToken();
        if (!token) {
            showToast('Authentication required', 'error');
            return;
        }

        const response = await fetch('/api/user/username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            userProfile.username = username;
            userBioSlug = username;
            hideUsernameModal();
            showToast(`Username set to @${username}!`, 'success');
        } else {
            showToast(data.error || 'Failed to set username', 'error');
        }
    } catch (error) {
        console.error('Error setting username:', error);
        showToast('Failed to set username', 'error');
    } finally {
        setUsernameBtn.disabled = false;
        setUsernameBtn.innerHTML = '<i class="fas fa-check"></i> Set Username';
    }
}

async function getCurrentUser() {
    return new Promise((resolve) => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                resolve(user);
            });
        } else {
            resolve(null);
        }
    });
}

function showAuthenticatedUI() {
    if (currentUser) {
        const sidebarUserPhoto = document.getElementById('sidebarUserPhoto');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserEmail = document.getElementById('sidebarUserEmail');
        const sidebarUser = document.getElementById('sidebarUser');
        const topbarUserPhoto = document.getElementById('topbarUserPhoto');

        if (sidebarUserPhoto) sidebarUserPhoto.src = currentUser.photoURL || 'https://via.placeholder.com/40';
        if (sidebarUserName) sidebarUserName.textContent = currentUser.displayName || 'User';
        if (sidebarUserEmail) sidebarUserEmail.textContent = currentUser.email || '';
        if (sidebarUser) sidebarUser.style.display = 'flex';
        if (topbarUserPhoto) topbarUserPhoto.src = currentUser.photoURL || 'https://via.placeholder.com/40';

        const loginModal = document.getElementById('loginModal');
        const landingPage = document.getElementById('landingPage');
        if (loginModal) loginModal.style.display = 'none';
        if (landingPage) landingPage.style.display = 'none';
    }
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const landingPage = document.getElementById('landingPage');
    if (loginModal) loginModal.style.display = 'flex';
    if (landingPage) landingPage.style.display = 'none';
}

function showLandingPage() {
    const loginModal = document.getElementById('loginModal');
    const landingPage = document.getElementById('landingPage');
    const appContainer = document.getElementById('app');

    if (landingPage) {
        landingPage.style.display = 'block';
        if (loginModal) loginModal.style.display = 'none';
        if (appContainer) appContainer.style.display = 'none';
        return;
    }

    if (appContainer) appContainer.style.display = 'none';
    if (loginModal) loginModal.style.display = 'flex';
}

async function handleLogout(e) {
    e.preventDefault();

    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            await firebase.auth().signOut();
            currentUser = null;
            userLinks = [];
            showLandingPage();
            showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Failed to logout', 'error');
        }
    }
}

async function handleDeleteAccount(e) {
    e.preventDefault();

    const confirmed = confirm("Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your links and analytics.");
    if (!confirmed) return;

    try {
        const token = await getAuthToken();
        if (!token) {
            showToast('Authentication required', 'error');
            return;
        }

        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        }

        const response = await fetch('/api/user', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await firebase.auth().signOut();
            currentUser = null;
            userLinks = [];
            window.location.href = '/';
        } else {
            const data = await response.json();
            showToast(data.error || "Failed to delete account", "error");
            if (deleteAccountBtn) {
                deleteAccountBtn.disabled = false;
                deleteAccountBtn.textContent = 'Delete Account';
            }
        }
    } catch (error) {
        console.error("Error deleting account:", error);
        showToast("An error occurred", "error");
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.disabled = false;
            deleteAccountBtn.textContent = 'Delete Account';
        }
    }
}

// Make globally available
window.initializeAuth = initializeAuth;
window.loadUserProfile = loadUserProfile;
window.showUsernameModal = showUsernameModal;
window.hideUsernameModal = hideUsernameModal;
window.validateUsername = validateUsername;
window.setUsername = setUsername;
window.getCurrentUser = getCurrentUser;
window.showAuthenticatedUI = showAuthenticatedUI;
window.showLoginModal = showLoginModal;
window.showLandingPage = showLandingPage;
window.handleLogout = handleLogout;
window.handleDeleteAccount = handleDeleteAccount;
