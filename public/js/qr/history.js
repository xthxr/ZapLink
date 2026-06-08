// ================================
// QR GENERATOR — HISTORY
// ================================
// Load user's recent links for quick QR generation.
// Load AFTER qr-generator.js (QRGenerator must exist).

// --- Load user links for quick generation ---
QRGenerator.loadUserLinks = async function () {
    try {
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
            console.log('Firebase not ready, waiting...');
            setTimeout(() => this.loadUserLinks(), 500);
            return;
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('No user logged in');
            this.quickLinksGrid.innerHTML = '<p class="text-muted">Please log in to see your links</p>';
            return;
        }

        const token = await user.getIdToken();
        const response = await fetch('/api/user/links', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            this.quickLinksGrid.innerHTML = '<p class="text-muted">Failed to load links</p>';
            return;
        }

        const result = await response.json();
        const links = result.links || [];

        if (links.length === 0) {
            this.quickLinksGrid.innerHTML = `
                <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
                    <i class="fas fa-link" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                    <p>No links yet!</p>
                    <p style="font-size: 14px; margin-top: 8px;">Create a link to generate QR codes</p>
                </div>
            `;
            return;
        }

        const recentLinks = links.slice(0, 6);

        this.quickLinksGrid.innerHTML = '';
        recentLinks.forEach(link => {
            const btn = document.createElement('button');
            btn.className = 'quick-link-btn';

            const shortUrl = `${window.location.origin}/${link.shortCode}`;
            const displayUrl = this.truncateUrl(link.originalUrl, 35);

            btn.innerHTML = `
                <div class="quick-link-header">
                    <span class="link-short" style="font-weight: 600; color: var(--accent-cyan);">/${link.shortCode}</span>
                    <span class="link-clicks" style="color: var(--text-tertiary); font-size: 12px;">
                        <i class="fas fa-mouse-pointer"></i> ${link.clicks || 0}
                    </span>
                </div>
                <span class="link-original" style="font-size: 13px; color: var(--text-secondary); display: block; margin-top: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${link.originalUrl}">${displayUrl}</span>
            `;

            btn.addEventListener('click', () => {
                this.qrLinkInput.value = shortUrl;
                this.generateQR();
                document.querySelector('.qr-preview-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            this.quickLinksGrid.appendChild(btn);
        });

    } catch (error) {
        console.error('Error loading links:', error);
        this.quickLinksGrid.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px; display: block; color: var(--accent-orange);"></i>
                <p>Error loading links</p>
                <p style="font-size: 14px; margin-top: 8px;">${error.message}</p>
                <button class="btn btn-sm btn-secondary" onclick="window.QRGenerator.loadUserLinks()" style="margin-top: 12px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
};

// --- Truncate long URLs for display ---
QRGenerator.truncateUrl = function (url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
};
