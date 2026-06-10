// ================================
// QR GENERATOR — CORE GENERATION
// ================================
// Core QR generation logic, pattern/frame config, brand image, SVG frame.
// Load AFTER qr-generator.js (QRGenerator must exist).

// --- Generate QR code ---
QRGenerator.generateQR = async function () {
    const link = this.qrLinkInput.value.trim();
    if (!link) {
        this.showNotification('Please enter a link or text', 'error');
        return;
    }

    this.currentLink = link;
    if (this.qrPlaceholder) {
        this.qrPlaceholder.style.display = 'none';
    }

    try {
        if (typeof QRCodeStyling === 'undefined') {
            throw new Error('QR Code Styling library not loaded. Please refresh the page.');
        }

        const container = document.querySelector('.qr-canvas-wrapper');
        container.innerHTML = '';

        const bgColor = this.transparentBg?.checked ? '#ffffffda' : this.currentBgColor;
        container.style.backgroundColor = bgColor;
        container.style.width = `${this.currentSize}px`;
        container.style.height = `${this.currentSize}px`;
        container.style.display = 'inline-block';
        container.style.borderRadius = '24px';
        container.style.overflow = 'hidden';

        const patternOptions = this.getPatternOptions();
        const frameOptions = this.getFrameOptions();

        const qrOptions = {
            width: this.currentSize,
            height: this.currentSize,
            type: 'svg',
            data: link,
            margin: frameOptions.margin,
            qrOptions: { errorCorrectionLevel: 'H' },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 5,
                crossOrigin: 'anonymous'
            },
            dotsOptions: { color: this.currentColor, type: patternOptions.dotsType },
            cornersSquareOptions: { color: this.currentColor, type: patternOptions.cornersSquareType },
            cornersDotOptions: { color: this.currentColor, type: patternOptions.cornersDotType },
            backgroundOptions: { color: 'transparent' }
        };

        if (this.currentBrandName) {
            qrOptions.image = await this.createBrandImage(this.currentBrandName);
        }

        this.qrCodeStyling = new QRCodeStyling(qrOptions);
        this.qrCodeStyling.append(container);

        const svg = container.querySelector('svg');
        if (svg) {
            svg.style.display = 'block';
            svg.style.borderRadius = '24px';
            svg.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            svg.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            svg.style.width = `${this.currentSize}px`;
            svg.style.height = `${this.currentSize}px`;
        }

        if (this.currentFrame !== 'none') {
            this.applyFrameToSVG(container, frameOptions);
        }

        this.downloadBtn.disabled = false;

        setTimeout(() => this.updateFloatingPreview(), 100);

    } catch (error) {
        console.error('QR generation error:', error);
        this.showNotification(error.message || 'Failed to generate QR code', 'error');
        if (this.qrPlaceholder) {
            this.qrPlaceholder.style.display = 'block';
            this.qrPlaceholder.textContent = 'Failed to generate QR code. Please try again.';
        }
    }
};

// --- Get pattern options for QRCodeStyling ---
QRGenerator.getPatternOptions = function () {
    const patterns = {
        'square':         { dotsType: 'square',         cornersSquareType: 'square',        cornersDotType: 'square' },
        'dots':           { dotsType: 'dots',            cornersSquareType: 'dot',           cornersDotType: 'dot' },
        'rounded':        { dotsType: 'rounded',         cornersSquareType: 'extra-rounded', cornersDotType: 'dot' },
        'extra-rounded':  { dotsType: 'extra-rounded',   cornersSquareType: 'extra-rounded', cornersDotType: 'dot' },
        'classy':         { dotsType: 'classy',          cornersSquareType: 'square',        cornersDotType: 'square' },
        'classy-rounded': { dotsType: 'classy-rounded',  cornersSquareType: 'extra-rounded', cornersDotType: 'dot' },
        'circular':       { dotsType: 'dots',            cornersSquareType: 'dot',           cornersDotType: 'dot' },
        'diamond':        { dotsType: 'square',          cornersSquareType: 'square',        cornersDotType: 'square' },
        'star':           { dotsType: 'dots',            cornersSquareType: 'extra-rounded', cornersDotType: 'dot' },
        'bars':           { dotsType: 'classy',          cornersSquareType: 'square',        cornersDotType: 'square' },
        'thick':          { dotsType: 'square',          cornersSquareType: 'square',        cornersDotType: 'square' },
        'thin':           { dotsType: 'dots',            cornersSquareType: 'dot',           cornersDotType: 'dot' },
        'fluid':          { dotsType: 'extra-rounded',   cornersSquareType: 'extra-rounded', cornersDotType: 'dot' },
        'mosaic':         { dotsType: 'classy',          cornersSquareType: 'extra-rounded', cornersDotType: 'dot' },
        'leaf':           { dotsType: 'classy-rounded',  cornersSquareType: 'extra-rounded', cornersDotType: 'dot' }
    };
    return patterns[this.currentPattern] || patterns['square'];
};

// --- Get frame options ---
QRGenerator.getFrameOptions = function () {
    const frames = {
        'none':        { margin: 10, color: null,        text: null },
        'business':    { margin: 20, color: '#3B82F6',   text: 'SCAN ME' },
        'wedding':     { margin: 20, color: '#EC4899',   text: '💝' },
        'birthday':    { margin: 20, color: '#F59E0B',   text: '🎉' },
        'party':       { margin: 20, color: '#8B5CF6',   text: '🎊' },
        'concert':     { margin: 20, color: '#EF4444',   text: '🎵' },
        'conference':  { margin: 20, color: '#06b6d4',   text: 'EVENT' },
        'restaurant':  { margin: 20, color: '#10B981',   text: '🍴' },
        'retail':      { margin: 20, color: '#8B5CF6',   text: 'SHOP' },
        'social':      { margin: 20, color: '#3B82F6',   text: 'FOLLOW' }
    };
    return frames[this.currentFrame] || frames['none'];
};

// --- Create brand image as data URL ---
QRGenerator.createBrandImage = async function (text) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(100, 100, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = this.currentColor;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = 160;
        const words = text.split(' ');
        let line = '';
        let y = 100;

        if (words.length > 1) {
            y = 85;
            words.forEach((word, i) => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && i > 0) {
                    ctx.fillText(line, 100, y);
                    line = word + ' ';
                    y += 30;
                } else {
                    line = testLine;
                }
            });
            ctx.fillText(line, 100, y);
        } else {
            ctx.fillText(text, 100, 100);
        }

        resolve(canvas.toDataURL());
    });
};

// --- Apply decorative frame to SVG ---
QRGenerator.applyFrameToSVG = function (container, frameOptions, size) {
    if (size === undefined) size = this.currentSize;
    if (!frameOptions.color) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const frameColor = frameOptions.color;
    const frameText = frameOptions.text;
    const scale = size / 400;
    const padding = 5 * scale;
    const strokeWidth = 10 * scale;
    const fontSize = 16 * scale;
    const textY = 25 * scale;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'rounded-corners');
    const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    clipRect.setAttribute('x', '0');
    clipRect.setAttribute('y', '0');
    clipRect.setAttribute('width', size.toString());
    clipRect.setAttribute('height', size.toString());
    clipRect.setAttribute('rx', '24');
    clipRect.setAttribute('ry', '24');
    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);
    svg.insertBefore(defs, svg.firstChild);

    svg.setAttribute('clip-path', 'url(#rounded-corners)');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', padding.toString());
    rect.setAttribute('y', padding.toString());
    rect.setAttribute('width', (size - padding * 2).toString());
    rect.setAttribute('height', (size - padding * 2).toString());
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', frameColor);
    rect.setAttribute('stroke-width', strokeWidth.toString());
    rect.setAttribute('rx', (10 * scale).toString());
    rect.setAttribute('stroke-linecap', 'round');
    rect.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(rect);

    if (frameText) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (size / 2).toString());
        text.setAttribute('y', textY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', fontSize.toString());
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', frameColor);
        text.setAttribute('stroke', 'rgba(255,255,255,0.8)');
        text.setAttribute('stroke-width', '1');
        text.setAttribute('stroke-linecap', 'round');
        text.setAttribute('stroke-linejoin', 'round');
        text.textContent = frameText;
        svg.appendChild(text);
    }
};

// --- Update floating preview canvas ---
QRGenerator.updateFloatingPreview = function () {
    if (this.qrCodeStyling && this.floatingCanvas) {
        const container = document.querySelector('.qr-canvas-wrapper');
        const svg = container.querySelector('svg');

        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const ctx = this.floatingCanvas.getContext('2d');
                ctx.clearRect(0, 0, 400, 400);
                ctx.drawImage(img, 0, 0, 400, 400);
                URL.revokeObjectURL(url);
            };

            img.src = url;
        }
    }
};
