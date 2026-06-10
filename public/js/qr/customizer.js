// ================================
// QR GENERATOR — CUSTOMIZER
// ================================
// Floating preview, draggable/resizable behavior, scroll behavior, notifications.
// Load AFTER qr-generator.js (QRGenerator must exist).

// --- Create floating preview ---
QRGenerator.createFloatingPreview = function () {
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
};

// --- Make floating preview draggable ---
QRGenerator.initDraggable = function () {
    const preview = this.floatingPreview;
    const header = preview.querySelector('.floating-header');
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

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

    function dragEnd() {
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

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    header.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);
};

// --- Make floating preview resizable ---
QRGenerator.initResizable = function () {
    const preview = this.floatingPreview;
    const resizeHandle = preview.querySelector('.resize-handle');
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

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

    function stopResize() {
        if (isResizing) {
            isResizing = false;
            preview.classList.remove('resizing');
        }
    }

    resizeHandle.addEventListener('mousedown', initResize);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    resizeHandle.addEventListener('touchstart', initResize);
    document.addEventListener('touchmove', resize);
    document.addEventListener('touchend', stopResize);
};

// --- Init scroll behavior (show floating preview on scroll) ---
QRGenerator.initScrollBehavior = function () {
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

    window.addEventListener('scroll', handleScroll.bind(this));
};

// --- Show notification ---
QRGenerator.showNotification = function (message, type) {
    if (typeof type === 'undefined') type = 'info';
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
};
