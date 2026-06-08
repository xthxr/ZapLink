// ================================
// BIO LINK MODULE — SHARE
// ================================
// Share modal, copy to clipboard, social sharing, native share API.
// Load AFTER bio-link.js (uses no bootstrap APIs directly — standalone).

// ================================
// SHARE MODAL
// ================================

function shareBioLink() {
    const slug = document.getElementById('editorBioSlug')?.value.trim();
    if (!slug) {
        showToast('Please save your bio link first', 'error');
        return;
    }

    const url = `${window.location.origin}/${slug}`;
    const urlInput = document.getElementById('shareBioLinkUrl');
    const modal = document.getElementById('shareBioLinkModal');
    const nativeBtn = document.getElementById('nativeShareBtn');

    if (!urlInput || !modal) {
        console.error('Share modal elements not found');
        showToast('Share functionality not available', 'error');
        return;
    }

    urlInput.value = url;

    if (navigator.share && nativeBtn) {
        nativeBtn.style.display = 'block';
    }

    modal.style.display = 'block';
    modal.classList.add('show');
}

function closeShareBioLinkModal() {
    const modal = document.getElementById('shareBioLinkModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function copyShareBioLink() {
    const url = document.getElementById('shareBioLinkUrl').value;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('copyShareBtn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-secondary');

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-secondary');
        }, 2000);

        showToast('Link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Failed to copy link', 'error');
    });
}

// ================================
// SOCIAL SHARE FUNCTIONS
// ================================

function shareToWhatsApp() {
    const url = document.getElementById('shareBioLinkUrl').value;
    const text = `Check out my bio link: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareToTelegram() {
    const url = document.getElementById('shareBioLinkUrl').value;
    const text = `Check out my bio link`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
}

function shareToTwitter() {
    const url = document.getElementById('shareBioLinkUrl').value;
    const text = `Check out my bio link`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
}

function shareToFacebook() {
    const url = document.getElementById('shareBioLinkUrl').value;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareToLinkedIn() {
    const url = document.getElementById('shareBioLinkUrl').value;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

function shareToEmail() {
    const url = document.getElementById('shareBioLinkUrl').value;
    const subject = 'Check out my bio link';
    const body = `I'd like to share my bio link with you: ${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ================================
// NATIVE SHARE API
// ================================

async function nativeShare() {
    const url = document.getElementById('shareBioLinkUrl').value;
    const name = document.getElementById('editorBioName')?.value || 'My Bio Link';

    try {
        await navigator.share({
            title: name,
            text: 'Check out my bio link',
            url: url
        });
        showToast('Shared successfully!', 'success');
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            showToast('Failed to share', 'error');
        }
    }
}

// ================================
// SHARE MODAL EVENT LISTENERS
// ================================

document.addEventListener('DOMContentLoaded', () => {
    const shareModalOverlay = document.getElementById('shareBioLinkModalOverlay');
    if (shareModalOverlay) {
        shareModalOverlay.addEventListener('click', closeShareBioLinkModal);
    }
});
