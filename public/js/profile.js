// ================================
// PROFILE
// ================================

function loadProfile() {
    if (typeof currentUser === 'undefined' || !currentUser) return;

    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    if (profileAvatar) profileAvatar.src = currentUser.photoURL || 'https://via.placeholder.com/100';
    if (profileName) profileName.value = currentUser.displayName || '';
    if (profileEmail) profileEmail.value = currentUser.email || '';
}

// Make globally available
window.loadProfile = loadProfile;
