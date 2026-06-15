// ================================
// LINK MANAGEMENT
// ================================

// ================================
// MODAL FUNCTIONS
// ================================

async function openCreateLinkModal() {
    const createLinkModal = document.getElementById('createLinkModal');
    if (!createLinkModal) return;
    createLinkModal.classList.add('show');

    const urlParams = new URLSearchParams(window.location.search);
    const prefilledUrl = urlParams.get('url');
    const destinationUrl = document.getElementById('destinationUrl');
    if (prefilledUrl && destinationUrl) {
        destinationUrl.value = decodeURIComponent(prefilledUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (destinationUrl) destinationUrl.focus();

    if (!userProfile && typeof currentUser !== 'undefined' && currentUser) {
        if (typeof loadUserProfile === 'function') await loadUserProfile();
    }

    if (userProfile && userProfile.username) {
        userBioSlug = userProfile.username;

        const usernamePrefix = document.getElementById('usernamePrefix');
        const customShortCodeInput = document.getElementById('customShortCode');
        const customShortCodeHint = document.getElementById('customShortCodeHint');

        if (usernamePrefix && customShortCodeInput) {
            usernamePrefix.textContent = userBioSlug + '/';
            usernamePrefix.style.display = 'block';
            customShortCodeInput.style.paddingLeft = `${usernamePrefix.offsetWidth + 20}px`;
        }

        if (customShortCodeHint) {
            customShortCodeHint.textContent = `Custom links: piik.me/${userBioSlug}/your-code | Random links: piik.me/abc123X`;
        }
    } else {
        userBioSlug = null;
        const customShortCodeHint = document.getElementById('customShortCodeHint');
        if (customShortCodeHint) {
            customShortCodeHint.textContent = 'Set a username to create custom branded links!';
        }
    }
}

function closeCreateLinkModal() {
    const createLinkModal = document.getElementById('createLinkModal');
    if (createLinkModal) createLinkModal.classList.remove('show');
    clearCreateLinkForm();
}

function clearCreateLinkForm() {
    const destinationUrl = document.getElementById('destinationUrl');
    const customShortCode = document.getElementById('customShortCode');
    const shortCodeCounter = document.getElementById('shortCodeCounter');
    const customShortCodeError = document.getElementById('customShortCodeError');
    const customShortCodeSuccess = document.getElementById('customShortCodeSuccess');
    const utmSource = document.getElementById('utmSource');
    const utmMedium = document.getElementById('utmMedium');
    const utmCampaign = document.getElementById('utmCampaign');
    const utmTerm = document.getElementById('utmTerm');
    const utmContent = document.getElementById('utmContent');

    if (destinationUrl) destinationUrl.value = '';
    if (customShortCode) customShortCode.value = '';
    if (shortCodeCounter) shortCodeCounter.textContent = '0';
    if (customShortCodeError) customShortCodeError.style.display = 'none';
    if (customShortCodeSuccess) customShortCodeSuccess.style.display = 'none';
    if (utmSource) utmSource.value = '';
    if (utmMedium) utmMedium.value = '';
    if (utmCampaign) utmCampaign.value = '';
    if (utmTerm) utmTerm.value = '';
    if (utmContent) utmContent.value = '';

    const expiresAtInput = document.getElementById('expiresAt');
    const maxClicksInput = document.getElementById('maxClicks');
    if (expiresAtInput) expiresAtInput.value = '';
    if (maxClicksInput) maxClicksInput.value = '';

    const usernamePrefix = document.getElementById('usernamePrefix');
    const customShortCodeInput = document.getElementById('customShortCode');
    if (usernamePrefix) usernamePrefix.style.display = 'none';
    if (customShortCodeInput) customShortCodeInput.style.paddingLeft = '12px';
}

let validateTimeout;
async function validateCustomShortCode(shortCode) {
    clearTimeout(validateTimeout);

    const customShortCodeError = document.getElementById('customShortCodeError');
    const customShortCodeSuccess = document.getElementById('customShortCodeSuccess');

    if (!customShortCodeError || !customShortCodeSuccess) return false;

    if (shortCode.length < 3) {
        customShortCodeError.textContent = 'Short code must be at least 3 characters';
        customShortCodeError.style.display = 'block';
        customShortCodeSuccess.style.display = 'none';
        return false;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(shortCode)) {
        customShortCodeError.textContent = 'Only letters, numbers, hyphens, and underscores allowed';
        customShortCodeError.style.display = 'block';
        customShortCodeSuccess.style.display = 'none';
        return false;
    }

    customShortCodeError.style.display = 'none';
    customShortCodeSuccess.textContent = '⏳ Checking availability...';
    customShortCodeSuccess.style.display = 'block';

    validateTimeout = setTimeout(async () => {
        try {
            const token = await getAuthToken();
            if (!token) {
                customShortCodeSuccess.textContent = '✓ Short code is available!';
                customShortCodeSuccess.style.display = 'block';
                return true;
            }

            let checkCode = shortCode;
            if (typeof userBioSlug !== 'undefined' && userBioSlug) {
                checkCode = `${userBioSlug}/${shortCode}`;
            }

            const response = await fetch(`/api/check-shortcode/${encodeURIComponent(checkCode)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.available) {
                    customShortCodeError.style.display = 'none';
                    customShortCodeSuccess.textContent = '✓ Short code is available!';
                    customShortCodeSuccess.style.display = 'block';
                    return true;
                } else {
                    customShortCodeError.textContent = '✗ This short code is already taken';
                    customShortCodeError.style.display = 'block';
                    customShortCodeSuccess.style.display = 'none';
                    return false;
                }
            } else {
                customShortCodeSuccess.textContent = '✓ Short code is available!';
                customShortCodeSuccess.style.display = 'block';
                return true;
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            customShortCodeSuccess.textContent = '✓ Short code is available!';
            customShortCodeSuccess.style.display = 'block';
            return true;
        }
    }, 300);
}

// ================================
// CREATE LINK
// ================================

async function handleCreateLink() {
    const destinationUrl = document.getElementById('destinationUrl');
    if (!destinationUrl) return;
    const url = destinationUrl.value.trim();

    if (!url) {
        showToast('Please enter a URL', 'error');
        return;
    }

    try {
        new URL(url);
    } catch (e) {
        showToast('Please enter a valid URL', 'error');
        return;
    }

    const customShortCode = document.getElementById('customShortCode');
    const customCode = customShortCode ? customShortCode.value.trim() : '';

    if (customCode) {
        if (customCode.length < 3) {
            showToast('Custom short code must be at least 3 characters', 'error');
            return;
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
            showToast('Invalid short code format', 'error');
            return;
        }
    }

    const utmSource = document.getElementById('utmSource');
    const utmMedium = document.getElementById('utmMedium');
    const utmCampaign = document.getElementById('utmCampaign');
    const utmTerm = document.getElementById('utmTerm');
    const utmContent = document.getElementById('utmContent');

    const utmParams = {
        source: utmSource ? utmSource.value.trim() : '',
        medium: utmMedium ? utmMedium.value.trim() : '',
        campaign: utmCampaign ? utmCampaign.value.trim() : '',
        term: utmTerm ? utmTerm.value.trim() : '',
        content: utmContent ? utmContent.value.trim() : ''
    };

    Object.keys(utmParams).forEach(key => {
        if (!utmParams[key]) delete utmParams[key];
    });

    const createLinkSubmit = document.getElementById('createLinkSubmit');
    if (createLinkSubmit) {
        createLinkSubmit.disabled = true;
        createLinkSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    }

    try {
        const token = await getAuthToken();
        console.log('Creating link with token:', token ? 'Token obtained' : 'No token');

        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url,
                customShortCode: customCode || null,
                username: typeof userBioSlug !== 'undefined' ? userBioSlug : null,
                utmParams: Object.keys(utmParams).length > 0 ? utmParams : null,
                notes: document.getElementById('linkNotes')?.value || '',
                tags: document.getElementById('linkTags')?.value
                    ? document.getElementById('linkTags').value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0)
                    : [],
                expiresAt: document.getElementById('expiresAt')?.value || null,
                maxClicks: document.getElementById('maxClicks')?.value
                    ? parseInt(document.getElementById('maxClicks').value)
                    : null
            })
        });

        if (!response.ok) {
            let errorMsg = 'Failed to create link';
            try {
                const errData = await response.json();
                errorMsg = errData.error || errData.message || errorMsg;
            } catch (_) {}
            showToast(errorMsg, 'error');
            return;
        }

        const data = await response.json();

        if (data.success) {
            showToast('Link created successfully!', 'success');
            closeCreateLinkModal();
            setTimeout(() => loadLinks(), 1000);
        } else {
            showToast(data.error || 'Failed to create link', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Failed to create link. Please try again.', 'error');
    } finally {
        if (createLinkSubmit) {
            createLinkSubmit.disabled = false;
            createLinkSubmit.innerHTML = '<i class="fas fa-plus"></i> Create Link';
        }
    }
}

// ================================
// LOAD & DISPLAY LINKS
// ================================

async function loadLinks() {
    try {
        if (typeof currentUser === 'undefined' || !currentUser) {
            const emptyState = document.getElementById('emptyState');
            const linksContainer = document.getElementById('linksContainer');
            if (emptyState) emptyState.style.display = 'block';
            if (linksContainer) linksContainer.style.display = 'none';
            return;
        }

        const token = await getAuthToken();
        if (!token) {
            console.error('No auth token available');
            showToast('Authentication required', 'error');
            return;
        }

        const response = await fetch('/api/user/links', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch links');
        }

        const data = await response.json();

        userLinks = data.links || [];

        if (userLinks.length > 0) {
            let currentFilter = 'all';
            const activeTab = document.querySelector('.filter-tab.active');
            if (activeTab) {
                currentFilter = activeTab.dataset.filter;
            }

            if (currentFilter === 'all') {
                displayLinks(userLinks);
            } else {
                filterLinks(currentFilter);
                return;
            }

            updateStats(userLinks);
            const emptyState = document.getElementById('emptyState');
            const linksContainer = document.getElementById('linksContainer');
            if (emptyState) emptyState.style.display = 'none';
            if (linksContainer) linksContainer.style.display = 'grid';
        } else {
            const emptyState = document.getElementById('emptyState');
            const linksContainer = document.getElementById('linksContainer');
            if (emptyState) emptyState.style.display = 'block';
            if (linksContainer) linksContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading links:', error);
        showToast('Failed to load links: ' + error.message, 'error');
    }
}

function displayLinks(links, filter) {
    const linksContainer = document.getElementById('linksContainer');
    if (!linksContainer) return;

    linksContainer.innerHTML = '';

    if (filter === 'inactive' && links.length > 0) {
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'margin-bottom: 20px; padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;';

        const headerLeft = document.createElement('div');

        const headerTitle = document.createElement('h4');
        headerTitle.style.cssText = 'margin: 0 0 4px 0; color: var(--accent-red); font-size: 14px; font-weight: 600;';

        const warningIcon = document.createElement('i');
        warningIcon.className = 'fas fa-exclamation-triangle';
        headerTitle.appendChild(warningIcon);
        headerTitle.appendChild(document.createTextNode(' Inactive Links'));

        headerLeft.appendChild(headerTitle);

        const headerDesc = document.createElement('p');
        headerDesc.style.cssText = 'margin: 0; color: var(--text-secondary); font-size: 13px;';
        headerDesc.textContent = 'These links will be permanently deleted after 15 days of deactivation';
        headerLeft.appendChild(headerDesc);

        headerDiv.appendChild(headerLeft);

        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.className = 'btn btn-danger';
        deleteAllBtn.addEventListener('click', function () {
            window.permanentlyDeleteInactiveLinks();
        });

        const trashIcon = document.createElement('i');
        trashIcon.className = 'fas fa-trash';
        deleteAllBtn.appendChild(trashIcon);
        deleteAllBtn.appendChild(document.createTextNode(' Delete All Inactive'));

        headerDiv.appendChild(deleteAllBtn);

        linksContainer.appendChild(headerDiv);
    }

    links.forEach(link => {
        const isInactive = link.isActive === false;

        let daysRemaining = null;
        if (link.scheduledDeletion) {
            let deletionDate;
            if (typeof link.scheduledDeletion.toDate === 'function') {
                deletionDate = link.scheduledDeletion.toDate();
            } else if (link.scheduledDeletion._seconds) {
                deletionDate = new Date(link.scheduledDeletion._seconds * 1000);
            } else {
                deletionDate = new Date(link.scheduledDeletion);
            }
            daysRemaining = Math.ceil((deletionDate - new Date()) / (1000 * 60 * 60 * 24));
        }

        // --- Link card container ---
        const card = document.createElement('div');
        card.className = 'link-card' + (isInactive ? ' inactive-link' : '');
        card.setAttribute('data-link-id', link.shortCode);

        // --- Link icon ---
        const linkIcon = document.createElement('div');
        linkIcon.className = 'link-icon' + (isInactive ? ' inactive' : '');

        const iconEl = document.createElement('i');
        iconEl.className = 'fas fa-' + (isInactive ? 'ban' : 'link');
        linkIcon.appendChild(iconEl);

        card.appendChild(linkIcon);

        // --- Link content ---
        const linkContent = document.createElement('div');
        linkContent.className = 'link-content';

        // URL row
        const linkUrlDiv = document.createElement('div');
        linkUrlDiv.className = 'link-url';

        const linkAnchor = document.createElement('a');
        linkAnchor.href = link.shortUrl;
        linkAnchor.className = 'link-short';
        linkAnchor.target = '_blank';
        linkAnchor.textContent = link.shortUrl.replace('https://', '').replace('http://', '');
        linkUrlDiv.appendChild(linkAnchor);

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-icon copy-btn';
        copyBtn.title = 'Copy link';
        copyBtn.addEventListener('click', function () {
            window.copyLink(link.shortUrl);
        });

        const copyIcon = document.createElement('i');
        copyIcon.className = 'fas fa-copy';
        copyBtn.appendChild(copyIcon);
        linkUrlDiv.appendChild(copyBtn);

        // Inactive badge
        if (isInactive) {
            const inactiveBadge = document.createElement('span');
            inactiveBadge.className = 'inactive-badge';
            inactiveBadge.textContent = 'Inactive';
            linkUrlDiv.appendChild(inactiveBadge);
        }

        // Split test badge
        if (link.splitTest) {
            const splitTestBadge = document.createElement('span');
            splitTestBadge.style.cssText = 'background: linear-gradient(135deg, var(--accent-purple), #8b5cf6); color: white; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; margin-left: 6px; display: inline-flex; align-items: center; gap: 4px;';

            const flaskIconBadge = document.createElement('i');
            flaskIconBadge.className = 'fas fa-flask';
            flaskIconBadge.style.cssText = 'font-size: 9px;';
            splitTestBadge.appendChild(flaskIconBadge);
            splitTestBadge.appendChild(document.createTextNode(' Split Test'));

            linkUrlDiv.appendChild(splitTestBadge);
        }

        linkContent.appendChild(linkUrlDiv);

        // Destination / variants area
        if (link.splitTest && Array.isArray(link.variants) && link.variants.length > 0) {
            const variantsSummary = document.createElement('div');
            variantsSummary.className = 'link-destination split-test-variants-summary';
            variantsSummary.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 4px; font-size: 12px; color: var(--text-secondary);';

            link.variants.forEach(function (v) {
                const variantTag = document.createElement('span');
                variantTag.className = 'variant-summary-tag';

                const strongLabel = document.createElement('strong');
                strongLabel.style.cssText = 'color: var(--accent-purple);';
                strongLabel.textContent = v.label;
                variantTag.appendChild(strongLabel);

                variantTag.appendChild(document.createTextNode(' (' + v.weight + '%): '));

                const urlSpan = document.createElement('span');
                urlSpan.style.cssText = 'opacity: 0.8;';
                urlSpan.textContent = v.url;
                variantTag.appendChild(urlSpan);

                variantsSummary.appendChild(variantTag);
            });

            linkContent.appendChild(variantsSummary);
        } else {
            // Original destination
            const destination = document.createElement('div');
            destination.className = 'link-destination';
            destination.textContent = link.originalUrl;
            linkContent.appendChild(destination);

            // Notes
            if (link.notes) {
                const notesDiv = document.createElement('div');
                notesDiv.className = 'link-notes';
                notesDiv.style.cssText = 'margin-top: 8px; font-size: 13px; color: var(--text-secondary);';

                const noteIcon = document.createElement('i');
                noteIcon.className = 'fas fa-sticky-note';
                notesDiv.appendChild(noteIcon);
                notesDiv.appendChild(document.createTextNode(' ' + link.notes));

                linkContent.appendChild(notesDiv);
            }

            // Tags
            if (link.tags && link.tags.length) {
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'link-tags';
                tagsDiv.style.cssText = 'margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;';

                link.tags.forEach(function (tag) {
                    const tagSpan = document.createElement('span');
                    tagSpan.style.cssText = 'background: var(--accent-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;';
                    tagSpan.textContent = tag;
                    tagsDiv.appendChild(tagSpan);
                });

                linkContent.appendChild(tagsDiv);
            }
        }

        // --- Link meta ---
        const linkMeta = document.createElement('div');
        linkMeta.className = 'link-meta';

        // Health badge
        const healthBadge = document.createElement('span');
        healthBadge.className = 'health-badge health-' + (link.healthStatus || 'unknown');

        const healthIcon = document.createElement('i');
        healthIcon.className = 'fas fa-heartbeat';
        healthBadge.appendChild(healthIcon);
        healthBadge.appendChild(document.createTextNode(link.healthStatus || 'unknown'));

        linkMeta.appendChild(healthBadge);

        // Date
        const dateSpanEl = document.createElement('span');
        const dateIcon = document.createElement('i');
        dateIcon.className = 'fas fa-calendar';
        dateSpanEl.appendChild(dateIcon);
        dateSpanEl.appendChild(document.createTextNode(' ' + window.formatDate(link.createdAt)));
        linkMeta.appendChild(dateSpanEl);

        // UTM enabled
        if (link.utmParams && !link.splitTest) {
            const utmSpan = document.createElement('span');
            const utmIcon = document.createElement('i');
            utmIcon.className = 'fas fa-tags';
            utmSpan.appendChild(utmIcon);
            utmSpan.appendChild(document.createTextNode(' UTM Enabled'));
            linkMeta.appendChild(utmSpan);
        }

        // Delete countdown
        if (isInactive && daysRemaining) {
            const deleteCountdown = document.createElement('span');
            deleteCountdown.style.cssText = 'color: var(--accent-red);';
            const clockIcon = document.createElement('i');
            clockIcon.className = 'fas fa-clock';
            deleteCountdown.appendChild(clockIcon);
            deleteCountdown.appendChild(document.createTextNode(' Deletes in ' + daysRemaining + ' days'));
            linkMeta.appendChild(deleteCountdown);
        }

        linkContent.appendChild(linkMeta);
        card.appendChild(linkContent);

        // --- Link stats ---
        const linkStats = document.createElement('div');
        linkStats.className = 'link-stats';

        const linkStat = document.createElement('div');
        linkStat.className = 'link-stat';

        const statValue = document.createElement('span');
        statValue.className = 'link-stat-value';
        statValue.textContent = link.clicks || 0;
        linkStat.appendChild(statValue);

        const statLabel = document.createElement('span');
        statLabel.className = 'link-stat-label';
        statLabel.textContent = 'Clicks';
        linkStat.appendChild(statLabel);

        linkStats.appendChild(linkStat);
        card.appendChild(linkStats);

        // --- Link actions ---
        const linkActions = document.createElement('div');
        linkActions.className = 'link-actions';

        if (!isInactive) {
            // Split test button
            const splitTestBtn = document.createElement('button');
            splitTestBtn.className = 'link-action-btn';
            splitTestBtn.title = 'Split Test';
            splitTestBtn.addEventListener('click', function () {
                window.openSplitTestModal(link.shortCode);
            });
            const flaskIconAction = document.createElement('i');
            flaskIconAction.className = 'fas fa-flask';
            splitTestBtn.appendChild(flaskIconAction);
            linkActions.appendChild(splitTestBtn);

            // Analytics button
            const analyticsBtn = document.createElement('button');
            analyticsBtn.className = 'link-action-btn';
            analyticsBtn.title = 'Analytics';
            analyticsBtn.addEventListener('click', function () {
                window.viewAnalytics(link.shortCode);
            });
            const chartIcon = document.createElement('i');
            chartIcon.className = 'fas fa-chart-line';
            analyticsBtn.appendChild(chartIcon);
            linkActions.appendChild(analyticsBtn);

            // QR Code button
            const qrBtn = document.createElement('button');
            qrBtn.className = 'link-action-btn';
            qrBtn.title = 'QR Code';
            qrBtn.addEventListener('click', function () {
                window.showQRCode(link.shortUrl, link.shortCode);
            });
            const qrIcon = document.createElement('i');
            qrIcon.className = 'fas fa-qrcode';
            qrBtn.appendChild(qrIcon);
            linkActions.appendChild(qrBtn);

            // Share button
            const shareBtn = document.createElement('button');
            shareBtn.className = 'link-action-btn';
            shareBtn.title = 'Share';
            shareBtn.addEventListener('click', function () {
                window.shareLink(link.shortUrl);
            });
            const shareIcon = document.createElement('i');
            shareIcon.className = 'fas fa-share-alt';
            shareBtn.appendChild(shareIcon);
            linkActions.appendChild(shareBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'link-action-btn delete';
            deleteBtn.title = 'Deactivate';
            deleteBtn.addEventListener('click', function () {
                window.deleteLink(link.shortCode);
            });
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash';
            deleteBtn.appendChild(deleteIcon);
            linkActions.appendChild(deleteBtn);
        } else {
            // Reactivate button
            const reactivateBtn = document.createElement('button');
            reactivateBtn.className = 'link-action-btn';
            reactivateBtn.title = 'Reactivate';
            reactivateBtn.addEventListener('click', function () {
                window.reactivateLink(link.shortCode);
            });
            const redoIcon = document.createElement('i');
            redoIcon.className = 'fas fa-redo';
            reactivateBtn.appendChild(redoIcon);
            linkActions.appendChild(reactivateBtn);
        }

        card.appendChild(linkActions);

        linksContainer.appendChild(card);
    });
}

function updateStats(links) {
    const totalLinksEl = document.getElementById('totalLinks');
    const totalClicksEl = document.getElementById('totalClicks');
    const activeLinksEl = document.getElementById('activeLinks');
    const avgClickRateEl = document.getElementById('avgClickRate');

    const activeLinks = links.filter(link => link.isActive !== false);
    const totalClicks = activeLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const activeWithClicks = activeLinks.filter(link => link.clicks > 0).length;
    const avgRate = activeLinks.length > 0 ? (totalClicks / activeLinks.length).toFixed(1) : 0;

    if (totalLinksEl) totalLinksEl.textContent = links.length;
    if (totalClicksEl) totalClicksEl.textContent = totalClicks.toLocaleString();
    if (activeLinksEl) activeLinksEl.textContent = activeWithClicks;
    if (avgClickRateEl) avgClickRateEl.textContent = avgRate;
}

function filterLinks(filter) {
    let filtered = [...userLinks];

    if (filter === 'active') {
        filtered = filtered.filter(link => link.isActive !== false);
    } else if (filter === 'inactive') {
        filtered = filtered.filter(link => link.isActive === false);
    }

    const sortSelect = document.getElementById('sortSelect');
    const currentSort = sortSelect?.value || 'recent';
    filtered = applySortOrder(filtered, currentSort);

    displayLinks(filtered, filter);
}

function applySortOrder(links, sortBy) {
    let sorted = [...links];

    if (sortBy === 'recent') {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'clicks') {
        sorted.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    } else if (sortBy === 'oldest') {
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return sorted;
}

function sortLinks(sortBy) {
    let sorted = applySortOrder(userLinks, sortBy);

    let currentFilter = 'all';
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        if (tab.classList.contains('active')) {
            currentFilter = tab.dataset.filter;
        }
    });

    if (currentFilter === 'active') {
        sorted = sorted.filter(link => link.isActive !== false);
    } else if (currentFilter === 'inactive') {
        sorted = sorted.filter(link => link.isActive === false);
    }

    displayLinks(sorted, currentFilter);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();

    const filtered = userLinks.filter(link =>
        link.originalUrl.toLowerCase().includes(query) ||
        link.shortUrl.toLowerCase().includes(query) ||
        link.shortCode.toLowerCase().includes(query)
    );

    displayLinks(filtered);
}

// ================================
// LINK ACTIONS
// ================================

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

function viewAnalytics(shortCode) {
    navigateToPage('analytics');
    if (typeof loadLinkAnalytics === 'function') loadLinkAnalytics(shortCode);
}

function showQRCode(shortUrl, shortCode) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>QR Code</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <div id="qr-${shortCode}" style="display: inline-block; padding: 20px; background: white; border-radius: 12px;"></div>
                <p style="margin-top: 16px; color: var(--text-secondary); font-size: 14px;">${shortUrl.replace('https://', '').replace('http://', '')}</p>
            </div>
            <div class="modal-footer" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="customizeQR('${shortUrl.replace(/'/g, "\\'")}')">
                    <i class="fas fa-palette"></i> Customize
                </button>
                <button class="btn btn-primary" onclick="downloadQR('${shortCode}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    new QRCode(document.getElementById(`qr-${shortCode}`), {
        text: shortUrl,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function customizeQR(url) {
    const modal = document.querySelector('.modal.show');
    if (modal) modal.remove();

    navigateToPage('qr-generator');

    setTimeout(() => {
        const qrInput = document.getElementById('qrLinkInput');
        if (qrInput) {
            qrInput.value = url;
            if (window.QRGenerator && window.QRGenerator.generateQR) {
                window.QRGenerator.generateQR();
            }
        }
    }, 300);
}

function downloadQR(shortCode) {
    const qrElement = document.getElementById(`qr-${shortCode}`);
    if (!qrElement) return;
    const canvas = qrElement.querySelector('canvas');

    if (canvas) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `piikme-qr-${shortCode}.png`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('QR code downloaded!', 'success');
        });
    }
}

function shareLink(url) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this link',
            url: url
        }).catch(() => {});
    } else {
        copyLink(url);
    }
}

async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to deactivate this link? It will be moved to Inactive section.')) {
        return;
    }

    const verified = await verifyUserBeforeAction('deactivate this link');
    if (!verified) return;

    try {
        const token = await getAuthToken();
        if (!token) {
            showToast('Authentication required', 'error');
            return;
        }

        const shortCodeEncoded = encodeURIComponent(shortCode);
        const response = await fetch(`/api/links/${shortCodeEncoded}/deactivate`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to deactivate link');
        }

        showToast(result.message || 'Link deactivated. Will be permanently deleted in 15 days.', 'success');
        loadLinks();
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to deactivate link: ' + error.message, 'error');
    }
}

async function permanentlyDeleteInactiveLinks() {
    if (!confirm('Are you sure you want to permanently delete ALL inactive links? This cannot be undone!')) {
        return;
    }

    const verified = await verifyUserBeforeAction('permanently delete all inactive links');
    if (!verified) return;

    try {
        const token = await getAuthToken();
        if (!token) {
            showToast('Authentication required', 'error');
            return;
        }

        const response = await fetch('/api/links/inactive', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete inactive links');
        }

        showToast(result.message || `Successfully deleted ${result.count || 0} inactive link(s)`, 'success');
        loadLinks();
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to delete inactive links: ' + error.message, 'error');
    }
}

async function reactivateLink(shortCode) {
    if (!confirm('Do you want to reactivate this link?')) {
        return;
    }

    try {
        const token = await getAuthToken();
        if (!token) {
            showToast('Authentication required', 'error');
            return;
        }

        const shortCodeEncoded = encodeURIComponent(shortCode);
        const response = await fetch(`/api/links/${shortCodeEncoded}/reactivate`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to reactivate link');
        }

        showToast(result.message || 'Link reactivated successfully!', 'success');
        loadLinks();
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to reactivate link: ' + error.message, 'error');
    }
}

// Make globally available for inline onclick handlers
window.openCreateLinkModal = openCreateLinkModal;
window.closeCreateLinkModal = closeCreateLinkModal;
window.clearCreateLinkForm = clearCreateLinkForm;
window.validateCustomShortCode = validateCustomShortCode;
window.handleCreateLink = handleCreateLink;
window.loadLinks = loadLinks;
window.displayLinks = displayLinks;
window.updateStats = updateStats;
window.filterLinks = filterLinks;
window.applySortOrder = applySortOrder;
window.sortLinks = sortLinks;
window.handleSearch = handleSearch;
window.copyLink = copyLink;
window.viewAnalytics = viewAnalytics;
window.showQRCode = showQRCode;
window.customizeQR = customizeQR;
window.downloadQR = downloadQR;
window.shareLink = shareLink;
window.deleteLink = deleteLink;
window.permanentlyDeleteInactiveLinks = permanentlyDeleteInactiveLinks;
window.reactivateLink = reactivateLink;
