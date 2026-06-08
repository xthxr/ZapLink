// ================================
// BIO LINK MODULE — SETTINGS / CRUD
// ================================
// Create/edit/delete modals, import from platforms, profile picture upload.
// Load AFTER bio-link.js (needs sanitizeHTML, apiCall, bioLinks/currentBioLink/bioLinkItems globals).

// ================================
// CRUD MODAL FUNCTIONS
// ================================

// Open bio link modal (create or edit)
function openBioLinkModal(bioLinkId = null) {
    const modal = document.getElementById('bioLinkModal');
    const modalTitle = document.getElementById('bioLinkModalTitle');

    // Reset form
    document.getElementById('bioLinkName').value = '';
    document.getElementById('bioLinkSlug').value = '';
    document.getElementById('bioLinkDescription').value = '';
    document.getElementById('bioProfilePicture').value = '';
    document.getElementById('bioProfilePictureFile').value = '';
    document.getElementById('bioProfilePicturePreview').style.display = 'none';
    document.getElementById('bioThemeColor').value = '#06b6d4';
    document.getElementById('bioThemeColorHex').value = '#06b6d4';
    document.getElementById('bioBackgroundStyle').value = 'gradient';
    document.getElementById('bioInstagram').value = '';
    document.getElementById('bioTwitter').value = '';
    document.getElementById('bioLinkedIn').value = '';
    document.getElementById('bioGithub').value = '';
    document.getElementById('bioYoutube').value = '';
    document.getElementById('bioWebsite').value = '';

    bioLinkItems = [];
    renderBioLinkItems();

    if (bioLinkId) {
        // Edit mode
        currentBioLink = bioLinks.find(bl => bl.id === bioLinkId);
        if (currentBioLink) {
            modalTitle.textContent = 'Edit Bio Link';
            document.getElementById('bioLinkName').value = currentBioLink.name || '';
            document.getElementById('bioLinkSlug').value = currentBioLink.slug || '';
            document.getElementById('bioLinkDescription').value = currentBioLink.description || '';
            document.getElementById('bioProfilePicture').value = currentBioLink.profilePicture || '';

            if (currentBioLink.profilePicture) {
                showBioProfilePicturePreview(currentBioLink.profilePicture, 'Existing photo');
            }

            document.getElementById('bioThemeColor').value = currentBioLink.themeColor || '#06b6d4';
            document.getElementById('bioThemeColorHex').value = currentBioLink.themeColor || '#06b6d4';
            document.getElementById('bioBackgroundStyle').value = currentBioLink.backgroundStyle || 'gradient';
            document.getElementById('bioInstagram').value = currentBioLink.social?.instagram || '';
            document.getElementById('bioTwitter').value = currentBioLink.social?.twitter || '';
            document.getElementById('bioLinkedIn').value = currentBioLink.social?.linkedin || '';
            document.getElementById('bioGithub').value = currentBioLink.social?.github || '';
            document.getElementById('bioYoutube').value = currentBioLink.social?.youtube || '';
            document.getElementById('bioWebsite').value = currentBioLink.social?.website || '';
            bioLinkItems = currentBioLink.links || [];
            renderBioLinkItems();
        }
    } else {
        // Create mode
        modalTitle.textContent = 'Create Bio Link';
        currentBioLink = null;
    }

    modal.style.display = 'flex';
}

// Close bio link modal
function closeBioLinkModal() {
    document.getElementById('bioLinkModal').style.display = 'none';
    currentBioLink = null;
    bioLinkItems = [];
}

// Render bio link items in modal
function renderBioLinkItems() {
    const container = document.getElementById('bioLinksListContainer');
    if (!container) return;

    if (bioLinkItems.length === 0) {
        container.innerHTML = '<p style="color: var(--text-tertiary); font-size: 14px; text-align: center; padding: 12px;">No links added yet. Click "Add Link" to get started.</p>';
        return;
    }

    container.innerHTML = bioLinkItems.map((item, index) => `
        <div class="bio-link-item" data-index="${index}">
            <div class="bio-link-item-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="bio-link-item-content">
                <input type="text" class="form-input" placeholder="Link Title" value="${sanitizeHTML(item.title || '')}" onchange="updateBioLinkItem(${index}, 'title', this.value)">
                <input type="url" class="form-input" placeholder="https://example.com" value="${sanitizeHTML(item.url || '')}" onchange="updateBioLinkItem(${index}, 'url', this.value)">
            </div>
            <button class="btn-icon" onclick="removeBioLinkItem(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Add new bio link item
function addBioLinkItem() {
    bioLinkItems.push({ title: '', url: '' });
    renderBioLinkItems();
}

// Update bio link item
function updateBioLinkItem(index, field, value) {
    if (bioLinkItems[index]) {
        bioLinkItems[index][field] = value;
    }
}

// Remove bio link item
function removeBioLinkItem(index) {
    bioLinkItems.splice(index, 1);
    renderBioLinkItems();
}

// Save bio link (create or update)
async function saveBioLink() {
    try {
        const token = await getAuthToken();
        if (!token) {
            showToast('You must be logged in to save bio links', 'error');
            return;
        }

        const name = document.getElementById('bioLinkName').value.trim();
        const slug = document.getElementById('bioLinkSlug').value.trim();
        const description = document.getElementById('bioLinkDescription').value.trim();

        if (!name) {
            showToast('Please enter a bio link name', 'error');
            return;
        }

        if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
            showToast('Please enter a valid URL slug', 'error');
            return;
        }

        const validLinks = bioLinkItems.filter(item => item.title && item.url);

        const bioLinkData = {
            name,
            slug,
            description,
            profilePicture: document.getElementById('bioProfilePicture').value.trim(),
            themeColor: document.getElementById('bioThemeColor').value,
            backgroundStyle: document.getElementById('bioBackgroundStyle').value,
            links: validLinks,
            social: {
                instagram: document.getElementById('bioInstagram').value.trim(),
                twitter: document.getElementById('bioTwitter').value.trim(),
                linkedin: document.getElementById('bioLinkedIn').value.trim(),
                github: document.getElementById('bioGithub').value.trim(),
                youtube: document.getElementById('bioYoutube').value.trim(),
                website: document.getElementById('bioWebsite').value.trim()
            }
        };

        if (currentBioLink) {
            await apiCall(`/api/bio-links/${currentBioLink.id}`, {
                method: 'PUT',
                body: JSON.stringify(bioLinkData)
            });
            showToast('Bio link updated successfully!', 'success');
        } else {
            await apiCall('/api/bio-links', {
                method: 'POST',
                body: JSON.stringify(bioLinkData)
            });
            showToast('Bio link created successfully!', 'success');
        }

        closeBioLinkModal();
        loadBioLinks();

    } catch (error) {
        console.error('Error saving bio link:', error);
        showToast('Failed to save bio link: ' + error.message, 'error');
    }
}

// Copy bio link URL to clipboard
function copyBioLink(slug) {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Failed to copy link', 'error');
    });
}

// View bio link in new tab
function viewBioLink(slug) {
    window.open(`/${slug}`, '_blank');
}

// Edit bio link
function editBioLink(bioLinkId) {
    openBioLinkModal(bioLinkId);
}

// Delete bio link
async function deleteBioLink(bioLinkId) {
    if (!confirm('Are you sure you want to delete this bio link? This action cannot be undone.')) {
        return;
    }

    try {
        await apiCall(`/api/bio-links/${bioLinkId}`, { method: 'DELETE' });
        showToast('Bio link deleted successfully', 'success');
        loadBioLinks();
    } catch (error) {
        console.error('Error deleting bio link:', error);
        showToast('Failed to delete bio link: ' + error.message, 'error');
    }
}

// ================================
// SETTINGS EVENT LISTENERS
// ================================

document.addEventListener('DOMContentLoaded', () => {
    // Create bio link button
    const createBioLinkBtn = document.getElementById('createBioLinkBtn');
    if (createBioLinkBtn) {
        createBioLinkBtn.addEventListener('click', () => openBioLinkModal());
    }

    // Create first bio button
    const createFirstBioBtn = document.getElementById('createFirstBioBtn');
    if (createFirstBioBtn) {
        createFirstBioBtn.addEventListener('click', () => openBioLinkModal());
    }

    // Modal close buttons
    const bioLinkModalClose = document.getElementById('bioLinkModalClose');
    if (bioLinkModalClose) {
        bioLinkModalClose.addEventListener('click', closeBioLinkModal);
    }

    const bioLinkModalCancel = document.getElementById('bioLinkModalCancel');
    if (bioLinkModalCancel) {
        bioLinkModalCancel.addEventListener('click', closeBioLinkModal);
    }

    const bioLinkModalOverlay = document.getElementById('bioLinkModalOverlay');
    if (bioLinkModalOverlay) {
        bioLinkModalOverlay.addEventListener('click', closeBioLinkModal);
    }

    // Save button
    const saveBioLinkBtn = document.getElementById('saveBioLinkBtn');
    if (saveBioLinkBtn) {
        saveBioLinkBtn.addEventListener('click', saveBioLink);
    }

    // Add link item button
    const addBioLinkItemBtn = document.getElementById('addBioLinkItemBtn');
    if (addBioLinkItemBtn) {
        addBioLinkItemBtn.addEventListener('click', addBioLinkItem);
    }

    // Description character counter
    const bioLinkDescription = document.getElementById('bioLinkDescription');
    const bioDescCount = document.getElementById('bioDescCount');
    if (bioLinkDescription && bioDescCount) {
        bioLinkDescription.addEventListener('input', (e) => {
            bioDescCount.textContent = e.target.value.length;
        });
    }

    // Theme color sync
    const bioThemeColor = document.getElementById('bioThemeColor');
    const bioThemeColorHex = document.getElementById('bioThemeColorHex');
    if (bioThemeColor && bioThemeColorHex) {
        bioThemeColor.addEventListener('input', (e) => {
            bioThemeColorHex.value = e.target.value.toUpperCase();
        });
        bioThemeColorHex.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                bioThemeColor.value = color;
            }
        });
    }

    // Slug validation
    const bioLinkSlug = document.getElementById('bioLinkSlug');
    const bioSlugError = document.getElementById('bioSlugError');
    const bioSlugSuccess = document.getElementById('bioSlugSuccess');

    if (bioLinkSlug && bioSlugError && bioSlugSuccess) {
        let slugCheckTimeout;
        bioLinkSlug.addEventListener('input', (e) => {
            const slug = e.target.value.trim();

            clearTimeout(slugCheckTimeout);
            bioSlugError.style.display = 'none';
            bioSlugSuccess.style.display = 'none';

            if (!slug) return;

            if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
                bioSlugError.textContent = 'Only letters, numbers, hyphens, and underscores allowed';
                bioSlugError.style.display = 'block';
                return;
            }

            slugCheckTimeout = setTimeout(async () => {
                try {
                    if (currentBioLink && currentBioLink.slug === slug) {
                        bioSlugSuccess.style.display = 'block';
                        return;
                    }

                    const token = await getAuthToken();
                    if (!token) return;

                    const response = await fetch(`/api/bio-links/check-slug/${encodeURIComponent(slug)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const result = await response.json();

                    if (result.available) {
                        bioSlugSuccess.style.display = 'block';
                    } else {
                        bioSlugError.textContent = 'This URL slug is already taken';
                        bioSlugError.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error checking slug:', error);
                }
            }, 500);
        });
    }

    // Import data button
    const importDataBtn = document.getElementById('importDataBtn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importFromPlatform);
    }
});

// ================================
// IMPORT FROM OTHER PLATFORMS
// ================================

async function importFromPlatform() {
    const importUrl = document.getElementById('importUrl').value.trim();
    const importStatus = document.getElementById('importStatus');
    const importBtn = document.getElementById('importDataBtn');

    if (!importUrl) {
        showImportStatus('Please enter a URL', 'error');
        return;
    }

    let platform = null;
    let username = null;

    if (importUrl.includes('linktr.ee') || importUrl.includes('linktree.com')) {
        platform = 'linktree';
        const match = importUrl.match(/(?:https?:\/\/)?(?:www\.)?linktr\.ee\/([a-zA-Z0-9_.-]+)|(?:https?:\/\/)?(?:www\.)?linktree\.com\/([a-zA-Z0-9_.-]+)/);
        username = match ? (match[1] || match[2]) : null;
    } else if (importUrl.includes('bento.me')) {
        platform = 'bento';
        const match = importUrl.match(/(?:https?:\/\/)?(?:www\.)?bento\.me\/([a-zA-Z0-9_.-]+)/);
        username = match ? match[1] : null;
    }

    if (!platform || !username) {
        showImportStatus('Invalid URL. Please enter a valid Linktree or Bento URL', 'error');
        return;
    }

    const originalText = importBtn.innerHTML;
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    importBtn.disabled = true;
    showImportStatus('Fetching your data...', 'loading');

    try {
        let data;
        if (platform === 'linktree') {
            data = await importFromLinktree(username);
        } else if (platform === 'bento') {
            data = await importFromBento(username);
        }

        if (data) {
            fillFormWithImportedData(data);
            showImportStatus(`✓ Successfully imported from ${platform === 'linktree' ? 'Linktree' : 'Bento'}!`, 'success');

            setTimeout(() => {
                document.getElementById('importUrl').value = '';
                importStatus.style.display = 'none';
            }, 3000);
        } else {
            showImportStatus('Could not fetch data. Make sure your profile is public.', 'error');
        }
    } catch (error) {
        console.error('Import error:', error);
        showImportStatus('Failed to import data. Please try again.', 'error');
    } finally {
        importBtn.innerHTML = originalText;
        importBtn.disabled = false;
    }
}

async function importFromLinktree(username) {
    try {
        const url = `https://linktr.ee/${username}`;

        const response = await fetch('/api/import-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Linktree data');
        }

        const result = await response.json();
        const html = result.html;

        console.log('Fetched HTML length:', html.length);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const nextDataScript = doc.querySelector('script#__NEXT_DATA__');
        if (nextDataScript) {
            const nextData = JSON.parse(nextDataScript.textContent);
            console.log('Linktree Next.js data:', nextData);
            return parseLinktreeData(nextData.props?.pageProps || nextData, username);
        }

        const allScripts = doc.querySelectorAll('script');
        for (const script of allScripts) {
            const content = script.textContent;
            if (content.includes('account') && content.includes('links')) {
                try {
                    const jsonMatch = content.match(/({.*})/s);
                    if (jsonMatch) {
                        const jsonData = JSON.parse(jsonMatch[1]);
                        console.log('Found embedded JSON:', jsonData);
                        return parseLinktreeData(jsonData, username);
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        throw new Error('Could not extract Linktree data');

    } catch (error) {
        console.error('Linktree import error:', error);
        return null;
    }
}

function parseLinktreeData(props, username) {
    const data = {
        name: '',
        description: '',
        links: [],
        profilePicture: '',
        social: {}
    };

    if (props.account) {
        if (props.account.username) data.name = props.account.username;
        if (props.account.pageTitle) data.name = props.account.pageTitle;
        if (props.account.description) data.description = props.account.description;
        if (props.account.profilePictureUrl) data.profilePicture = props.account.profilePictureUrl;
    }

    let links = props.links || props.account?.links || [];

    console.log('Parsing links:', links);

    if (links && Array.isArray(links)) {
        links.forEach(link => {
            if (link.url && link.title && link.type !== 'SOCIAL_LINK' && link.type !== 'SOCIAL') {
                data.links.push({
                    title: link.title,
                    url: link.url
                });
            }
        });
    }

    let socialLinks = props.socialLinks || props.account?.socialLinks || [];

    console.log('Parsing social links:', socialLinks);

    if (socialLinks && Array.isArray(socialLinks)) {
        socialLinks.forEach(social => {
            extractSocialLink(social.url, data.social);
        });
    }

    if (links && Array.isArray(links)) {
        links.forEach(link => {
            if ((link.type === 'SOCIAL_LINK' || link.type === 'SOCIAL') && link.url) {
                extractSocialLink(link.url, data.social);
            }
        });
    }

    if (!data.name) {
        data.name = username;
    }

    console.log('Final parsed data:', data);
    return data;
}

function extractSocialLink(url, socialObj) {
    if (!url) return;

    if (url.includes('instagram.com') && !socialObj.instagram) {
        const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
        if (match) socialObj.instagram = match[1];
    } else if ((url.includes('twitter.com') || url.includes('x.com')) && !socialObj.twitter) {
        const match = url.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/);
        if (match) socialObj.twitter = match[1];
    } else if (url.includes('youtube.com') && !socialObj.youtube) {
        socialObj.youtube = url;
    } else if (url.includes('tiktok.com') && !socialObj.tiktok) {
        const match = url.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/);
        if (match) socialObj.tiktok = match[1];
    } else if (url.includes('github.com') && !socialObj.github) {
        const match = url.match(/github\.com\/([a-zA-Z0-9_-]+)/);
        if (match) socialObj.github = match[1];
    } else if (url.includes('linkedin.com') && !socialObj.linkedin) {
        socialObj.linkedin = url;
    }
}

async function importFromBento(username) {
    try {
        const url = `https://bento.me/${username}`;

        const response = await fetch('/api/import-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Bento data');
        }

        const result = await response.json();
        const html = result.html;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const data = {
            name: '',
            description: '',
            links: [],
            profilePicture: '',
            social: {}
        };

        const ogTitle = doc.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            data.name = ogTitle.content;
        }

        const ogDescription = doc.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            data.description = ogDescription.content;
        }

        const ogImage = doc.querySelector('meta[property="og:image"]');
        if (ogImage) {
            data.profilePicture = ogImage.content;
        }

        const nextDataScript = doc.querySelector('script#__NEXT_DATA__');
        if (nextDataScript) {
            try {
                const nextData = JSON.parse(nextDataScript.textContent);
                const pageProps = nextData?.props?.pageProps;

                if (pageProps) {
                    if (pageProps.user) {
                        if (pageProps.user.name) data.name = pageProps.user.name;
                        if (pageProps.user.bio) data.description = pageProps.user.bio;
                        if (pageProps.user.avatar) data.profilePicture = pageProps.user.avatar;
                    }

                    if (pageProps.components && Array.isArray(pageProps.components)) {
                        pageProps.components.forEach(component => {
                            if (component.type === 'link' && component.url && component.title) {
                                data.links.push({
                                    title: component.title,
                                    url: component.url
                                });
                            }

                            if (component.type === 'social' || component.platform) {
                                const url = component.url || '';
                                if (url) {
                                    extractSocialLink(url, data.social);
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                console.log('Could not parse NEXT_DATA:', e);
            }
        }

        if (!data.name) {
            data.name = username;
        }

        return data;
    } catch (error) {
        console.error('Bento import error:', error);
        return null;
    }
}

function fillFormWithImportedData(data) {
    if (data.name) {
        document.getElementById('bioLinkName').value = data.name;
    }

    if (data.description) {
        const descField = document.getElementById('bioLinkDescription');
        descField.value = data.description.substring(0, 200);
        document.getElementById('bioDescCount').textContent = descField.value.length;
    }

    if (data.name && !document.getElementById('bioLinkSlug').value) {
        const slug = data.name.toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        document.getElementById('bioLinkSlug').value = slug;
        document.getElementById('bioLinkSlug').dispatchEvent(new Event('input'));
    }

    if (data.profilePicture) {
        window.importedProfilePictureUrl = data.profilePicture;
        showToast('Profile picture URL imported. You can upload it manually if needed.', 'info');
    }

    if (data.social) {
        if (data.social.instagram) {
            document.getElementById('bioInstagram').value = data.social.instagram;
        }
        if (data.social.twitter) {
            document.getElementById('bioTwitter').value = data.social.twitter;
        }
        if (data.social.youtube) {
            document.getElementById('bioYoutube').value = data.social.youtube;
        }
        if (data.social.tiktok) {
            document.getElementById('bioTiktok').value = data.social.tiktok;
        }
        if (data.social.github) {
            document.getElementById('bioGithub').value = data.social.github;
        }
    }

    if (data.links && data.links.length > 0) {
        document.getElementById('bioLinksListContainer').innerHTML = '';

        data.links.forEach((link) => {
            addBioLinkItem();
            const items = document.querySelectorAll('.bio-link-item');
            const lastItem = items[items.length - 1];

            const titleInput = lastItem.querySelector('input[placeholder*="Title"]');
            const urlInput = lastItem.querySelector('input[type="url"]');

            if (titleInput && link.title) titleInput.value = link.title;
            if (urlInput && link.url) urlInput.value = link.url;

            // Persist in bioLinkItems so saveBioLink() reads actual values
            const arrayIdx = bioLinkItems.length - 1;
            if (bioLinkItems[arrayIdx]) {
                if (link.title) bioLinkItems[arrayIdx].title = link.title;
                if (link.url) bioLinkItems[arrayIdx].url = link.url;
            }
        });
    }
}

function showImportStatus(message, type) {
    const importStatus = document.getElementById('importStatus');
    importStatus.style.display = 'block';

    importStatus.classList.remove('import-success', 'import-error', 'import-loading');

    if (type === 'success') {
        importStatus.style.background = 'rgba(34, 197, 94, 0.1)';
        importStatus.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        importStatus.style.color = '#22c55e';
    } else if (type === 'error') {
        importStatus.style.background = 'rgba(239, 68, 68, 0.1)';
        importStatus.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        importStatus.style.color = '#ef4444';
    } else if (type === 'loading') {
        importStatus.style.background = 'rgba(6, 182, 212, 0.1)';
        importStatus.style.border = '1px solid rgba(6, 182, 212, 0.3)';
        importStatus.style.color = '#06b6d4';
    }

    importStatus.textContent = message;
}

// ================================
// PROFILE PICTURE UPLOAD (Modal)
// ================================

document.addEventListener('DOMContentLoaded', () => {
    const bioProfilePictureFile = document.getElementById('bioProfilePictureFile');
    if (bioProfilePictureFile) {
        bioProfilePictureFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                e.target.value = '';
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('Image size must be less than 2MB', 'error');
                e.target.value = '';
                return;
            }

            const uploadBtn = e.target.parentElement.querySelector('button.btn-secondary');
            if (!uploadBtn) {
                console.error('Upload button not found');
                showToast('Upload button not found', 'error');
                return;
            }

            try {
                const user = firebase.auth().currentUser;
                if (!user) {
                    showToast('Please log in to upload images', 'error');
                    e.target.value = '';
                    return;
                }

                const originalText = uploadBtn.innerHTML;
                uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                uploadBtn.disabled = true;

                console.log('Starting upload for:', file.name, 'Size:', file.size, 'bytes');
                console.log('User ID:', user.uid);

                if (!firebase.storage) {
                    throw new Error('Firebase Storage not initialized');
                }

                const uploadPromise = new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            const storage = firebase.storage();
                            console.log('Storage bucket:', storage.app.options.storageBucket);

                            const storageRef = storage.ref();
                            const fileExtension = file.name.split('.').pop();
                            const fileName = `bio-profiles/${user.uid}/${Date.now()}.${fileExtension}`;
                            const fileRef = storageRef.child(fileName);

                            console.log('Uploading to path:', fileName);

                            const uploadTask = fileRef.put(file);

                            uploadTask.on('state_changed',
                                (snapshot) => {
                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    console.log('Upload progress:', progress.toFixed(0) + '%');
                                    uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${progress.toFixed(0)}%`;
                                },
                                (error) => {
                                    console.error('Upload error:', error);
                                    console.error('Error code:', error.code);
                                    console.error('Error message:', error.message);
                                    reject(error);
                                },
                                async () => {
                                    console.log('Upload completed, getting download URL...');
                                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                                    console.log('Download URL:', downloadURL);
                                    resolve(downloadURL);
                                }
                            );
                        } catch (error) {
                            reject(error);
                        }
                    })();
                });

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Upload timeout - please check Firebase Storage rules')), 60000);
                });

                const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);

                document.getElementById('bioProfilePicture').value = downloadURL;
                showBioProfilePicturePreview(downloadURL, file.name);

                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;

                showToast('Profile picture uploaded successfully!', 'success');

            } catch (error) {
                console.error('Error uploading profile picture:', error);

                let errorMessage = 'Failed to upload';
                if (error.code === 'storage/unauthorized') {
                    errorMessage = 'Permission denied - please contact support';
                } else if (error.message) {
                    errorMessage = error.message;
                }

                showToast(errorMessage, 'error');
                e.target.value = '';

                if (uploadBtn) {
                    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Picture';
                    uploadBtn.disabled = false;
                }
            }
        });
    }
});

// Show profile picture preview
function showBioProfilePicturePreview(url, fileName) {
    const preview = document.getElementById('bioProfilePicturePreview');
    const previewImg = document.getElementById('bioProfilePicturePreviewImg');
    const fileNameSpan = document.getElementById('bioProfilePictureFileName');

    if (!preview || !previewImg || !fileNameSpan) return;
    previewImg.src = url;
    fileNameSpan.textContent = fileName;
    preview.style.display = 'flex';
}

// Remove profile picture
function removeBioProfilePicture() {
    document.getElementById('bioProfilePicture').value = '';
    document.getElementById('bioProfilePictureFile').value = '';
    document.getElementById('bioProfilePicturePreview').style.display = 'none';
}
