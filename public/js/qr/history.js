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
            this.quickLinksGrid.innerHTML = '';
            const p = document.createElement('p');
            p.className = 'text-muted';
            p.textContent = 'Please log in to see your links';
            this.quickLinksGrid.appendChild(p);
            return;
        }

        const token = await user.getIdToken();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch('/api/user/links', {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            this.quickLinksGrid.innerHTML = '';
            const p = document.createElement('p');
            p.className = 'text-muted';
            p.textContent = 'Failed to load links';
            this.quickLinksGrid.appendChild(p);
            return;
        }

        const result = await response.json();
        const links = result.links || [];

        if (links.length === 0) {
            this.quickLinksGrid.innerHTML = '';
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'text-align: center; padding: 24px; color: var(--text-secondary);';
            const icon = document.createElement('i');
            icon.className = 'fas fa-link';
            icon.style.cssText = 'font-size: 32px; opacity: 0.3; margin-bottom: 12px; display: block;';
            const p1 = document.createElement('p');
            p1.textContent = 'No links yet!';
            const p2 = document.createElement('p');
            p2.style.cssText = 'font-size: 14px; margin-top: 8px;';
            p2.textContent = 'Create a link to generate QR codes';
            emptyDiv.appendChild(icon);
            emptyDiv.appendChild(p1);
            emptyDiv.appendChild(p2);
            this.quickLinksGrid.appendChild(emptyDiv);
            return;
        }

        const recentLinks = links.slice(0, 6);

        this.quickLinksGrid.innerHTML = '';
        recentLinks.forEach(link => {
            if (!link || !link.shortCode || !link.originalUrl) return;

            const btn = document.createElement('button');
            btn.className = 'quick-link-btn';

            const shortUrl = `${window.location.origin}/${link.shortCode}`;
            const displayUrl = typeof this.truncateUrl === 'function' ? this.truncateUrl(link.originalUrl, 35) : (link.originalUrl || '').substring(0, 32) + '...';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'quick-link-header';

            const shortSpan = document.createElement('span');
            shortSpan.className = 'link-short';
            shortSpan.style.cssText = 'font-weight: 600; color: var(--accent-cyan);';
            shortSpan.textContent = `/${link.shortCode}`;

            const clicksSpan = document.createElement('span');
            clicksSpan.className = 'link-clicks';
            clicksSpan.style.cssText = 'color: var(--text-tertiary); font-size: 12px;';
            const mouseIcon = document.createElement('i');
            mouseIcon.className = 'fas fa-mouse-pointer';
            clicksSpan.appendChild(mouseIcon);
            clicksSpan.appendChild(document.createTextNode(` ${link.clicks || 0}`));

            headerDiv.appendChild(shortSpan);
            headerDiv.appendChild(clicksSpan);

            const originalSpan = document.createElement('span');
            originalSpan.className = 'link-original';
            originalSpan.style.cssText = 'font-size: 13px; color: var(--text-secondary); display: block; margin-top: 4px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;';
            originalSpan.textContent = displayUrl;

            btn.appendChild(headerDiv);
            btn.appendChild(originalSpan);

            btn.addEventListener('click', () => {
                this.qrLinkInput.value = shortUrl;
                this.generateQR();
                document.querySelector('.qr-preview-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            this.quickLinksGrid.appendChild(btn);
        });

    } catch (error) {
        console.error('Error loading links:', error);
        this.quickLinksGrid.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'text-align: center; padding: 24px; color: var(--text-secondary);';
        const errIcon = document.createElement('i');
        errIcon.className = 'fas fa-exclamation-triangle';
        errIcon.style.cssText = 'font-size: 32px; opacity: 0.3; margin-bottom: 12px; display: block; color: var(--accent-orange);';
        const p1 = document.createElement('p');
        p1.textContent = 'Error loading links';
        const p2 = document.createElement('p');
        p2.style.cssText = 'font-size: 14px; margin-top: 8px;';
        p2.textContent = error.message || 'An unexpected error occurred';
        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn btn-sm btn-secondary';
        retryBtn.style.marginTop = '12px';
        retryBtn.addEventListener('click', () => window.QRGenerator.loadUserLinks());
        const redoIcon = document.createElement('i');
        redoIcon.className = 'fas fa-redo';
        retryBtn.appendChild(redoIcon);
        retryBtn.appendChild(document.createTextNode(' Retry'));
        errorDiv.appendChild(errIcon);
        errorDiv.appendChild(p1);
        errorDiv.appendChild(p2);
        errorDiv.appendChild(retryBtn);
        this.quickLinksGrid.appendChild(errorDiv);
    }
};

// --- Truncate long URLs for display ---
QRGenerator.truncateUrl = function (url, maxLength) {
    if (typeof url !== 'string' || !url) return '';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
};
