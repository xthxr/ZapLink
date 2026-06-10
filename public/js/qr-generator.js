// QR Generator Module
const QRGenerator = {
    currentPattern: 'square',
    currentFrame: 'none',
    currentColor: '#000000',
    currentBgColor: '#ffffff',
    currentFormat: 'png',
    currentSize: 400,
    currentLink: '',
    currentBrandName: '',
    qrCodeStyling: null,

    init() {
        this.cacheDom();
        this.bindEvents();
        this.createFloatingPreview();
        this.initScrollBehavior();
        this._initAuthListener();
    },

    _initAuthListener() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setTimeout(() => this._initAuthListener(), 500);
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.loadUserLinks();
            } else {
                if (this.quickLinksGrid) {
                    this.quickLinksGrid.innerHTML = `
                        <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
                            <i class="fas fa-lock" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                            <p>Please log in to see your links</p>
                        </div>
                    `;
                }
            }
        });
    },

    createFloatingPreview() {
        const floatingPreview = document.createElement('div');
        floatingPreview.className = 'qr-floating-preview';
        floatingPreview.id = 'floatingQRPreview';
        floatingPreview.innerHTML = `
            <div class="floating-header">
                <span class="floating-title">Live Preview</span>
                <button class="floating-close" onclick="document.getElementById('floatingQRPreview').classList.remove('show')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="floating-qr-container">
                <canvas id="floatingQRCanvas" width="400" height="400"></canvas>
            </div>
            <div class="resize-handle"></div>
        `;
        document.body.appendChild(floatingPreview);
        this.floatingCanvas = document.getElementById('floatingQRCanvas');
        this.floatingPreview = floatingPreview;

        this.initDraggable();
        this.initResizable();
    },

    initDraggable() {
        const preview = this.floatingPreview;
        const header = preview.querySelector('.floating-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        header.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', dragEnd);

        function dragStart(e) {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === header || header.contains(e.target)) {
                if (!e.target.classList.contains('floating-close')) {
                    isDragging = true;
                    preview.classList.add('dragging');
                }
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();

                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, preview);
            }
        }

        function dragEnd(e) {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                preview.classList.remove('dragging');
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, calc(-50% + ${yPos}px))`;
        }
    },

    initResizable() {
        const preview = this.floatingPreview;
        const resizeHandle = preview.querySelector('.resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', initResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);

        resizeHandle.addEventListener('touchstart', initResize);
        document.addEventListener('touchmove', resize);
        document.addEventListener('touchend', stopResize);

        function initResize(e) {
            isResizing = true;
            preview.classList.add('resizing');

            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }

            startWidth = preview.offsetWidth;
            startHeight = preview.offsetHeight;

            e.preventDefault();
            e.stopPropagation();
        }

        function resize(e) {
            if (!isResizing) return;

            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const width = startWidth + (clientX - startX);
            const height = startHeight + (clientY - startY);
            const size = Math.max(width, height);

            if (size >= 150 && size <= 400) {
                preview.style.width = size + 'px';
            }

            e.preventDefault();
        }

        function stopResize(e) {
            if (isResizing) {
                isResizing = false;
                preview.classList.remove('resizing');
            }
        }
    },

    initScrollBehavior() {
        const qrPreviewCard = document.querySelector('.qr-preview-card');
        if (!qrPreviewCard) return;

        let scrollTimeout;
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const previewRect = qrPreviewCard.getBoundingClientRect();

                if (previewRect.top < -100 && this.currentLink) {
                    this.floatingPreview.classList.add('show');
                    this.updateFloatingPreview();
                } else {
                    this.floatingPreview.classList.remove('show');
                }
            }, 50);
        };

        window.addEventListener('scroll', handleScroll);
    },

    cacheDom() {
        this.qrSizeSlider = document.getElementById('qrSizeSlider') || null;
        this.qrSizeValue = document.getElementById('qrSizeValue') || null;
        this.qrLinkInput = document.getElementById('qrLinkInput');
        this.generateBtn = document.getElementById('generateQRBtn');
        this.qrPlaceholder = document.getElementById('qrPlaceholder');
        this.qrBrandInput = document.getElementById('qrBrandInput');
        this.qrBrandOverlay = document.getElementById('qrBrandOverlay');
        this.qrBrandText = document.getElementById('qrBrandText');
        this.qrColorPicker = document.getElementById('qrColorPicker');
        this.qrColorHex = document.getElementById('qrColorHex');
        this.bgColorPicker = document.getElementById('bgColorPicker');
        this.bgColorHex = document.getElementById('bgColorHex');
        this.transparentBg = document.getElementById('transparentBg');
        this.downloadBtn = document.getElementById('downloadQRBtn');
        this.quickLinksGrid = document.getElementById('quickLinksGrid');
        this.downloadBgOptions = document.getElementById('downloadBgOptions');
        this.transparentOption = document.getElementById('transparentOption');
    },

    bindEvents() {
        if (!this.generateBtn || !this.qrLinkInput) return;

        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.qrLinkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateQR();
        });

        this.qrSizeSlider?.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            if (this.qrSizeValue) {
                this.qrSizeValue.textContent = `${this.currentSize}px`;
            }
            if (this.currentLink) {
                this.generateQR();
            }
        });

        this.qrBrandInput.addEventListener('input', (e) => {
            this.currentBrandName = e.target.value;
            if (this.currentLink) this.generateQR();
        });

        document.querySelectorAll('.pattern-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.pattern-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.currentPattern = option.dataset.pattern;
                if (this.currentLink) this.generateQR();
            });
        });

        document.querySelectorAll('.frame-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.frame-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.currentFrame = option.dataset.frame;
                if (this.currentLink) this.generateQR();
            });
        });

        this.qrColorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.qrColorHex.value = e.target.value.toUpperCase();
            if (this.currentLink) this.generateQR();
        });

        this.qrColorHex.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                this.currentColor = color;
                this.qrColorPicker.value = color;
                if (this.currentLink) this.generateQR();
            }
        });

        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = preset.dataset.color;
                this.currentColor = color;
                this.qrColorPicker.value = color;
                this.qrColorHex.value = color.toUpperCase();
                if (this.currentLink) this.generateQR();
            });
        });

        this.bgColorPicker.addEventListener('input', (e) => {
            this.currentBgColor = e.target.value;
            this.bgColorHex.value = e.target.value.toUpperCase();
        });

        this.bgColorHex.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                this.currentBgColor = color;
                this.bgColorPicker.value = color;
            }
        });

        this.transparentBg.addEventListener('change', (e) => {
            if (this.currentLink) this.generateQR();
        });

        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFormat = btn.dataset.format;

                if (this.currentFormat === 'jpg') {
                    this.downloadBgOptions.style.display = 'block';
                    this.transparentOption.style.display = 'none';
                    this.transparentBg.checked = false;
                } else {
                    this.downloadBgOptions.style.display = 'none';
                    this.transparentOption.style.display = 'block';
                }
            });
        });

        this.downloadBtn.addEventListener('click', () => this.downloadQR());
    },

    async generateQR() {
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
                qrOptions: {
                    errorCorrectionLevel: 'H'
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 5,
                    crossOrigin: 'anonymous'
                },
                dotsOptions: {
                    color: this.currentColor,
                    type: patternOptions.dotsType
                },
                cornersSquareOptions: {
                    color: this.currentColor,
                    type: patternOptions.cornersSquareType
                },
                cornersDotOptions: {
                    color: this.currentColor,
                    type: patternOptions.cornersDotType
                },
                backgroundOptions: {
                    color: 'transparent'
                }
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
    },

    getPatternOptions() {
        const patterns = {
            'square': {
                dotsType: 'square',
                cornersSquareType: 'square',
                cornersDotType: 'square'
            },
            'dots': {
                dotsType: 'dots',
                cornersSquareType: 'dot',
                cornersDotType: 'dot'
            },
            'rounded': {
                dotsType: 'rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            },
            'extra-rounded': {
                dotsType: 'extra-rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            },
            'classy': {
                dotsType: 'classy',
                cornersSquareType: 'square',
                cornersDotType: 'square'
            },
            'classy-rounded': {
                dotsType: 'classy-rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            },
            'circular': {
                dotsType: 'dots',
                cornersSquareType: 'dot',
                cornersDotType: 'dot'
            },
            'diamond': {
                dotsType: 'square',
                cornersSquareType: 'square',
                cornersDotType: 'square'
            },
            'star': {
                dotsType: 'dots',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            },
            'bars': {
                dotsType: 'classy',
                cornersSquareType: 'square',
                cornersDotType: 'square'
            },
            'thick': {
                dotsType: 'square',
                cornersSquareType: 'square',
                cornersDotType: 'square'
            },
            'thin': {
                dotsType: 'dots',
                cornersSquareType: 'dot',
                cornersDotType: 'dot'
            },
            'fluid': {
                dotsType: 'extra-rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            },
            'mosaic': {
                dotsType: 'classy',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            },
            'leaf': {
                dotsType: 'classy-rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot'
            }
        };

        return patterns[this.currentPattern] || patterns['square'];
    },

    getFrameOptions() {
        const frames = {
            'none': { margin: 10, color: null, text: null },
            'business': { margin: 20, color: '#3B82F6', text: 'SCAN ME' },
            'wedding': { margin: 20, color: '#EC4899', text: '💝' },
            'birthday': { margin: 20, color: '#F59E0B', text: '🎉' },
            'party': { margin: 20, color: '#8B5CF6', text: '🎊' },
            'concert': { margin: 20, color: '#EF4444', text: '🎵' },
            'conference': { margin: 20, color: '#06b6d4', text: 'EVENT' },
            'restaurant': { margin: 20, color: '#10B981', text: '🍴' },
            'retail': { margin: 20, color: '#8B5CF6', text: 'SHOP' },
            'social': { margin: 20, color: '#3B82F6', text: 'FOLLOW' }
        };

        return frames[this.currentFrame] || frames['none'];
    },

    async createBrandImage(text) {
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
    },

    applyFrameToSVG(container, frameOptions, size = this.currentSize) {
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
    },

    updateFloatingPreview() {
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
    },

    async downloadQR() {
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
                qrOptions: {
                    errorCorrectionLevel: 'H'
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 5,
                    crossOrigin: 'anonymous'
                },
                dotsOptions: {
                    color: this.currentColor,
                    type: patternOptions.dotsType
                },
                cornersSquareOptions: {
                    color: this.currentColor,
                    type: patternOptions.cornersSquareType
                },
                cornersDotOptions: {
                    color: this.currentColor,
                    type: patternOptions.cornersDotType
                },
                backgroundOptions: {
                    color: backgroundColor
                }
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

            await new Promise(resolve => setTimeout(resolve, 100));

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
    },

    async loadUserLinks() {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return;

            if (this.quickLinksGrid) {
                this.quickLinksGrid.innerHTML = `
                    <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px; display: block;"></i>
                        <p>Loading your links...</p>
                    </div>
                `;
            }

            const token = await user.getIdToken();
            const response = await fetch('/api/user/links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (this.quickLinksGrid) {
                    this.quickLinksGrid.innerHTML = '<p class="text-muted" style="padding: 16px;">Failed to load links</p>';
                }
                return;
            }

            const result = await response.json();
            const links = result.links || [];

            if (links.length === 0) {
                if (this.quickLinksGrid) {
                    this.quickLinksGrid.innerHTML = `
                        <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
                            <i class="fas fa-link" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                            <p>No links yet!</p>
                            <p style="font-size: 14px; margin-top: 8px;">Create a link to generate QR codes</p>
                        </div>
                    `;
                }
                return;
            }

            const recentLinks = links.slice(0, 6);

            this.quickLinksGrid.innerHTML = '';
            recentLinks.forEach(link => {
                const btn = document.createElement('button');
                btn.className = 'quick-link-btn';

                const shortUrl = link.shortUrl || `${window.location.origin}/${link.shortCode}`;
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
            if (this.quickLinksGrid) {
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
        }
    },

    truncateUrl(url, maxLength) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength - 3) + '...';
    },

    showNotification(message, type = 'info') {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

if (typeof window !== 'undefined') {
    window.QRGenerator = QRGenerator;
}
