// ================================
// BIO LINK MODULE — INLINE EDITOR
// ================================
// Inline editor panel, auto-save, editor profile picture upload.
// Load AFTER preview.js (needs updateLivePreview), reorder.js (needs setupDragAndDrop),
// and bio-link.js (needs apiCall, loadBioLinks).

// ================================
// EDITOR STATE
// ================================

let editorBioLinkItems = [];
let currentEditorBioLink = null;
let autoSaveTimeout = null;
let isSaving = false;

// ================================
// AUTO-SAVE
// ================================

function triggerAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    const saveBtn = document.querySelector('#bioLinkEditor button.btn-primary');
    if (saveBtn && !isSaving) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-circle" style="font-size: 8px; animation: pulse 1s infinite;"></i> Saving...';

        autoSaveTimeout = setTimeout(async () => {
            await saveEditorBioLink(true);
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
            }, 2000);
        }, 1500);
    }
}

// ================================
// LOAD / RENDER
// ================================

function loadBioLinkIntoEditor(bioLink) {
    currentEditorBioLink = bioLink;

    document.getElementById('editorBioName').value = bioLink.name || '';
    document.getElementById('editorBioSlug').value = bioLink.slug || '';
    document.getElementById('editorBioDescription').value = bioLink.description || '';
    document.getElementById('editorProfilePicture').value = bioLink.profilePicture || '';

    if (bioLink.profilePicture) {
        showEditorProfilePicturePreview(bioLink.profilePicture, 'Existing photo');
    }

    document.getElementById('editorThemeColor').value = bioLink.themeColor || '#06b6d4';
    document.getElementById('editorThemeColorHex').value = bioLink.themeColor || '#06b6d4';
    document.getElementById('editorBackgroundStyle').value = bioLink.backgroundStyle || 'gradient';

    document.getElementById('editorInstagram').value = bioLink.social?.instagram || '';
    document.getElementById('editorTwitter').value = bioLink.social?.twitter || '';
    document.getElementById('editorLinkedIn').value = bioLink.social?.linkedin || '';
    document.getElementById('editorGithub').value = bioLink.social?.github || '';
    document.getElementById('editorYoutube').value = bioLink.social?.youtube || '';
    document.getElementById('editorWebsite').value = bioLink.social?.website || '';

    editorBioLinkItems = bioLink.links || [];
    renderEditorBioLinkItems();
    updateLivePreview();
    setupLivePreviewListeners();
}

// ================================
// LIVE PREVIEW LISTENERS
// ================================

let livePreviewListenersSetup = false;

function setupLivePreviewListeners() {
    if (livePreviewListenersSetup) return;

    const fields = [
        'editorBioName',
        'editorBioDescription',
        'editorThemeColor',
        'editorThemeColorHex',
        'editorInstagram',
        'editorTwitter',
        'editorLinkedIn',
        'editorGithub',
        'editorYoutube',
        'editorWebsite'
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.removeEventListener('input', updateLivePreview);
            el.addEventListener('input', () => {
                updateLivePreview();
                triggerAutoSave();
            });
            console.log('Added listener to', id);
        }
    });

    const bgStyleEl = document.getElementById('editorBackgroundStyle');
    if (bgStyleEl) {
        bgStyleEl.addEventListener('change', () => {
            updateLivePreview();
            triggerAutoSave();
        });
    }

    livePreviewListenersSetup = true;
}

// ================================
// EDITOR BIO LINK ITEMS RENDER
// ================================

function renderEditorBioLinkItems() {
    const container = document.getElementById('editorBioLinkItems');
    if (!container) return;

    if (editorBioLinkItems.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">No links yet. Click "Add Link" to get started.</p>';
        updateLivePreview();
        return;
    }

    container.innerHTML = editorBioLinkItems.map((item, index) => `
        <div class="bio-link-item" draggable="true" data-index="${index}" style="display: flex; gap: 12px; padding: 16px; background: #0a0a0a; border-radius: 12px; border: 1px solid #2a2a2a; cursor: move; transition: all 0.2s ease;">
            <div class="bio-link-item-handle" style="cursor: grab; color: #707070; display: flex; align-items: center;">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="bio-link-item-content" style="flex: 1; display: grid; gap: 8px;">
                <input type="text" class="form-input" placeholder="Link Title" value="${item.title || ''}"
                       oninput="updateEditorBioLinkItem(${index}, 'title', this.value)" style="margin: 0;">
                <input type="url" class="form-input" placeholder="https://example.com" value="${item.url || ''}"
                       oninput="updateEditorBioLinkItem(${index}, 'url', this.value)" style="margin: 0;">
            </div>
            <button class="btn-icon" onclick="removeEditorBioLinkItem(${index})" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    setupDragAndDrop();
    updateLivePreview();
}

// ================================
// EDITOR LINK CRUD
// ================================

function addEditorBioLinkItem() {
    editorBioLinkItems.push({ title: '', url: '' });
    renderEditorBioLinkItems();
}

function updateEditorBioLinkItem(index, field, value) {
    if (editorBioLinkItems[index]) {
        editorBioLinkItems[index][field] = value;
        updateLivePreview();
        triggerAutoSave();
    }
}

function removeEditorBioLinkItem(index) {
    editorBioLinkItems.splice(index, 1);
    renderEditorBioLinkItems();
    triggerAutoSave();
}

// Save editor bio link
async function saveEditorBioLink(isAutoSave = false) {
    if (isSaving) return;

    try {
        isSaving = true;
        const user = firebase.auth().currentUser;
        if (!user) {
            if (!isAutoSave) showToast('Please log in to save changes', 'error');
            isSaving = false;
            return;
        }

        const name = document.getElementById('editorBioName').value.trim();
        const slug = document.getElementById('editorBioSlug').value.trim();
        const description = document.getElementById('editorBioDescription').value.trim();

        if (!name) {
            if (!isAutoSave) showToast('Please enter a name', 'error');
            isSaving = false;
            return;
        }

        if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
            if (!isAutoSave) showToast('Please enter a valid URL slug', 'error');
            isSaving = false;
            return;
        }

        if (currentEditorBioLink.slug !== slug) {
            const token = await getAuthToken();
            if (!token) {
                isSaving = false;
                return;
            }
            const slugResponse = await fetch(`/api/bio-links/check-slug/${encodeURIComponent(slug)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const slugResult = await slugResponse.json();
            if (!slugResult.available) {
                if (!isAutoSave) showToast('This URL slug is already taken', 'error');
                isSaving = false;
                return;
            }
        }

        const validLinks = editorBioLinkItems.filter(item => item.title && item.url);

        const bioLinkData = {
            name,
            slug,
            description,
            profilePicture: document.getElementById('editorProfilePicture').value.trim(),
            themeColor: document.getElementById('editorThemeColor').value,
            backgroundStyle: document.getElementById('editorBackgroundStyle').value,
            links: validLinks,
            social: {
                instagram: document.getElementById('editorInstagram').value.trim(),
                twitter: document.getElementById('editorTwitter').value.trim(),
                linkedin: document.getElementById('editorLinkedIn').value.trim(),
                github: document.getElementById('editorGithub').value.trim(),
                youtube: document.getElementById('editorYoutube').value.trim(),
                website: document.getElementById('editorWebsite').value.trim()
            }
        };

        await apiCall(`/api/bio-links/${currentEditorBioLink.id}`, {
            method: 'PUT',
            body: JSON.stringify(bioLinkData)
        });

        if (!isAutoSave) {
            showToast('Bio link updated successfully!', 'success');
            loadBioLinks();
        }

        isSaving = false;

    } catch (error) {
        console.error('Error saving bio link:', error);
        if (!isAutoSave) {
            showToast('Failed to save: ' + (error.message || 'Unknown error'), 'error');
        }
        isSaving = false;
    }
}

function cancelBioLinkEdits() {
    if (currentEditorBioLink) {
        loadBioLinkIntoEditor(currentEditorBioLink);
        showToast('Changes discarded', 'info');
    }
}

function viewBioLinkPreview() {
    const slug = document.getElementById('editorBioSlug').value.trim();
    if (slug) {
        window.open(`/${slug}`, '_blank');
    }
}

// ================================
// EDITOR PROFILE PICTURE UPLOAD
// ================================

document.addEventListener('DOMContentLoaded', () => {
    const editorProfilePictureFile = document.getElementById('editorProfilePictureFile');
    if (editorProfilePictureFile) {
        editorProfilePictureFile.addEventListener('change', async (e) => {
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
            if (!uploadBtn) return;

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

                const storage = firebase.storage();
                const fileExtension = file.name.split('.').pop();
                const fileName = `bio-profiles/${user.uid}/${Date.now()}.${fileExtension}`;
                const fileRef = storage.ref().child(fileName);

                await fileRef.put(file);
                const downloadURL = await fileRef.getDownloadURL();

                document.getElementById('editorProfilePicture').value = downloadURL;
                showEditorProfilePicturePreview(downloadURL, file.name);
                updateLivePreview();
                triggerAutoSave();

                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
                showToast('Profile picture uploaded successfully!', 'success');

            } catch (error) {
                console.error('Error uploading:', error);
                showToast('Failed to upload: ' + (error.message || 'Unknown error'), 'error');
                e.target.value = '';
                if (uploadBtn) {
                    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Picture';
                    uploadBtn.disabled = false;
                }
            }
        });
    }
});

function showEditorProfilePicturePreview(url, fileName) {
    const preview = document.getElementById('editorProfilePicturePreview');
    const previewImg = document.getElementById('editorProfilePicturePreviewImg');
    const fileNameSpan = document.getElementById('editorProfilePictureFileName');

    if (preview && previewImg && fileNameSpan) {
        previewImg.src = url;
        fileNameSpan.textContent = fileName;
        preview.style.display = 'flex';
    }
}

function removeEditorProfilePicture() {
    document.getElementById('editorProfilePicture').value = '';
    document.getElementById('editorProfilePictureFile').value = '';
    document.getElementById('editorProfilePicturePreview').style.display = 'none';
    updateLivePreview();
    triggerAutoSave();
}
