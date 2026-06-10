// ================================
// QR GENERATOR — EXPORT
// ================================
// Download QR code as PNG / SVG / JPG.
// Load AFTER qr-generator.js (QRGenerator must exist).

// --- Wait for SVG to render in container (deterministic, no arbitrary timeout) ---
QRGenerator._waitForSvgReady = function (container, maxRetries) {
    if (typeof maxRetries === 'undefined') maxRetries = 20;
    return new Promise((resolve, reject) => {
        let retries = 0;
        const check = () => {
            const svg = container.querySelector('svg');
            if (svg && svg.querySelector('rect')) {
                resolve();
            } else if (retries++ < maxRetries) {
                requestAnimationFrame(check);
            } else {
                resolve(); // timeout — proceed anyway
            }
        };
        requestAnimationFrame(check);
    });
};

// --- Download QR code ---
QRGenerator.downloadQR = async function () {
    if (!this.currentLink || !this.qrCodeStyling) {
        this.showNotification('Please generate a QR code first', 'error');
        return;
    }

    try {
        const extension = this.currentFormat;
        const fileName = `qr-code-${Date.now()}.${extension}`;

        const patternOptions = this.getPatternOptions();
        const frameOptions = this.getFrameOptions();

        let backgroundColor;
        if (extension === 'jpg') {
            backgroundColor = this.currentBgColor;
        } else {
            backgroundColor = this.transparentBg?.checked ? 'transparent' : this.currentBgColor;
        }

        const qrSize = this.currentSize;
        const canvasSize = extension === 'svg' ? this.currentSize : this.currentSize * 2;
        const scale = canvasSize / 400;

        const downloadOptions = {
            width: qrSize,
            height: qrSize,
            type: 'svg',
            data: this.currentLink,
            margin: frameOptions.margin * scale,
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
            backgroundOptions: { color: backgroundColor }
        };

        if (this.currentBrandName) {
            downloadOptions.image = await this.createBrandImage(this.currentBrandName);
        }

        const downloadQR = new QRCodeStyling(downloadOptions);

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);

        downloadQR.append(tempContainer);
        await this._waitForSvgReady(tempContainer);

        if (this.currentFrame !== 'none') {
            this.applyFrameToSVG(tempContainer, frameOptions, qrSize);
        }

        const svg = tempContainer.querySelector('svg');

        if (extension === 'svg') {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = canvasSize;
                    canvas.height = canvasSize;
                    const ctx = canvas.getContext('2d');

                    ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        resolve();
                    }, extension === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);

                    URL.revokeObjectURL(url);
                };

                img.onerror = reject;
                img.src = url;
            });
        }

        document.body.removeChild(tempContainer);
        this.showNotification('QR Code downloaded successfully!', 'success');

    } catch (error) {
        console.error('Download error:', error);
        this.showNotification('Failed to download QR code', 'error');
    }
};
