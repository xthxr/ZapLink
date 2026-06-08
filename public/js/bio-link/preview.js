// ================================
// BIO LINK MODULE — LIVE PREVIEW
// ================================
// Generates the inline iframe preview and the bio page HTML.
// Load AFTER bio-link.js (needs sanitizeHTML).

// --- Update live preview iframe ---
function updateLivePreview() {
    const iframe = document.getElementById('bioPreviewFrame');
    if (!iframe) {
        console.log('Preview iframe not found');
        return;
    }

    const name = document.getElementById('editorBioName')?.value || 'Your Name';
    const slug = document.getElementById('editorBioSlug')?.value || 'preview';
    const description = document.getElementById('editorBioDescription')?.value || 'Your bio description';
    const themeColor = document.getElementById('editorThemeColor')?.value || '#06b6d4';
    const profilePicture = document.getElementById('editorProfilePicture')?.value || '';
    const backgroundStyle = document.getElementById('editorBackgroundStyle')?.value || 'gradient';

    const social = {
        instagram: document.getElementById('editorInstagram')?.value || '',
        twitter: document.getElementById('editorTwitter')?.value || '',
        linkedin: document.getElementById('editorLinkedIn')?.value || '',
        github: document.getElementById('editorGithub')?.value || '',
        youtube: document.getElementById('editorYoutube')?.value || '',
        website: document.getElementById('editorWebsite')?.value || ''
    };

    const validLinks = (typeof editorBioLinkItems !== 'undefined' ? editorBioLinkItems : [])
        .filter(item => item.title && item.url);

    const bioLinkData = {
        name,
        slug,
        description,
        profilePicture,
        themeColor,
        backgroundStyle,
        social,
        links: validLinks,
        verified: false
    };

    const htmlContent = generateBioPreviewHTML(bioLinkData);
    iframe.srcdoc = htmlContent;
}

// --- Generate bio preview HTML ---
function generateBioPreviewHTML(bioLink) {
    const themeColor = bioLink.themeColor || '#06b6d4';
    const backgroundStyle = bioLink.backgroundStyle || 'gradient';

    function extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    function getLinkIcon(url) {
        const urlLower = url.toLowerCase();
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'fab fa-youtube';
        if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'fab fa-twitter';
        if (urlLower.includes('instagram.com')) return 'fab fa-instagram';
        if (urlLower.includes('facebook.com')) return 'fab fa-facebook';
        if (urlLower.includes('linkedin.com')) return 'fab fa-linkedin';
        if (urlLower.includes('github.com')) return 'fab fa-github';
        if (urlLower.includes('tiktok.com')) return 'fab fa-tiktok';
        if (urlLower.includes('spotify.com')) return 'fab fa-spotify';
        if (urlLower.includes('discord.')) return 'fab fa-discord';
        if (urlLower.includes('twitch.tv')) return 'fab fa-twitch';
        if (urlLower.includes('medium.com')) return 'fab fa-medium';
        if (urlLower.includes('reddit.com')) return 'fab fa-reddit';
        if (urlLower.includes('dribbble.com')) return 'fab fa-dribbble';
        if (urlLower.includes('behance.net')) return 'fab fa-behance';
        return 'fas fa-link';
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 6, g: 182, b: 212 };
    }

    // Build social links HTML
    const social = bioLink.social || {};
    const socialLinks = [];
    if (social.instagram) socialLinks.push({ icon: 'fab fa-instagram', url: sanitizeHTML(`https://instagram.com/${social.instagram}`) });
    if (social.twitter) socialLinks.push({ icon: 'fab fa-twitter', url: sanitizeHTML(`https://x.com/${social.twitter}`) });
    if (social.linkedin) socialLinks.push({ icon: 'fab fa-linkedin', url: sanitizeHTML(social.linkedin.startsWith('http') ? social.linkedin : `https://linkedin.com/in/${social.linkedin}`) });
    if (social.github) socialLinks.push({ icon: 'fab fa-github', url: sanitizeHTML(`https://github.com/${social.github}`) });
    if (social.youtube) socialLinks.push({ icon: 'fab fa-youtube', url: sanitizeHTML(social.youtube.startsWith('http') ? social.youtube : `https://youtube.com/@${social.youtube}`) });
    if (social.website) socialLinks.push({ icon: 'fas fa-globe', url: sanitizeHTML(social.website.startsWith('http') ? social.website : `https://${social.website}`) });

    let socialLinksHTML = '';
    if (socialLinks.length > 0) {
        socialLinksHTML = '<div class="bio-social">';
        socialLinks.forEach(link => {
            socialLinksHTML += `<a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer">
                <i class="${link.icon}" style="color: rgba(255, 255, 255, 0.8);"></i>
            </a>`;
        });
        socialLinksHTML += '</div>';
    }

    // Build links HTML
    let linksHTML = '';
    if (bioLink.links && bioLink.links.length > 0) {
        linksHTML = '<div class="bio-links">';
        bioLink.links.forEach((link) => {
            const domain = extractDomain(link.url);
            const icon = getLinkIcon(link.url);
            linksHTML += `<a href="${sanitizeHTML(link.url)}" class="bio-link-item" target="_blank" rel="noopener noreferrer">
                <div class="link-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="link-content">
                    <div class="link-title">${sanitizeHTML(link.title)}</div>
                    <div class="link-url">${sanitizeHTML(domain)}</div>
                </div>
            </a>`;
        });
        linksHTML += '</div>';
    }

    // Set background style
    let backgroundCSS = '';
    if (backgroundStyle === 'gradient') {
        const rgb = hexToRgb(themeColor);
        backgroundCSS = `background: linear-gradient(135deg, ${themeColor} 0%, rgb(${Math.floor(rgb.r * 0.7)}, ${Math.floor(rgb.g * 0.7)}, ${Math.floor(rgb.b * 0.7)}) 100%);`;
    } else if (backgroundStyle === 'solid') {
        backgroundCSS = `background: ${themeColor};`;
    } else if (backgroundStyle === 'image' && bioLink.profilePicture) {
        backgroundCSS = `background: url(${bioLink.profilePicture}) center/cover; filter: blur(100px) brightness(0.3);`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sanitizeHTML(bioLink.name)}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Encode+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/bio-preview.css">
    <style>
        body {
            ${backgroundCSS}
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div class="mesh-gradient"></div>
    <div class="bio-container" style="margin: 0; max-height: 100vh; overflow-y: auto;">
        <div class="bio-header">
            ${bioLink.profilePicture ? 
                `<img src="${sanitizeHTML(bioLink.profilePicture)}" alt="${sanitizeHTML(bioLink.name)}" class="bio-avatar">` :
                `<div class="bio-avatar-placeholder" style="background: ${sanitizeHTML(themeColor)};">
                    <i class="fas fa-user"></i>
                </div>`
            }
            <h1 class="bio-name">
                ${sanitizeHTML(bioLink.name)}
                ${bioLink.verified ? 
                    '<span class="verified-badge"><i class="fas fa-check"></i></span>' : 
                    '<span class="under-review-badge">Preview</span>'
                }
            </h1>
            ${bioLink.description ? `<p class="bio-description">${sanitizeHTML(bioLink.description)}</p>` : ''}
            ${socialLinksHTML}
        </div>
        ${linksHTML}
        <div class="bio-footer">
            <div class="powered-by">
                <span>100% free, try</span>
                <a href="/" target="_blank" style="display: flex; align-items: center; text-decoration: none;">
                    <img src="/assets/images/logo.png" alt="piik.me" style="width: auto; height: 24px;">
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// --- Favicon / icon helper for common URLs ---
function getFaviconForUrl(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'fab fa-youtube';
    if (urlLower.includes('github.com')) return 'fab fa-github';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'fab fa-twitter';
    if (urlLower.includes('linkedin.com')) return 'fab fa-linkedin';
    if (urlLower.includes('instagram.com')) return 'fab fa-instagram';
    if (urlLower.includes('facebook.com')) return 'fab fa-facebook';
    if (urlLower.includes('medium.com')) return 'fab fa-medium';
    if (urlLower.includes('behance.net')) return 'fab fa-behance';
    if (urlLower.includes('dribbble.com')) return 'fab fa-dribbble';
    if (urlLower.includes('spotify.com')) return 'fab fa-spotify';
    if (urlLower.includes('tiktok.com')) return 'fab fa-tiktok';
    if (urlLower.includes('discord')) return 'fab fa-discord';
    if (urlLower.includes('twitch.tv')) return 'fab fa-twitch';
    return 'fas fa-link';
}
