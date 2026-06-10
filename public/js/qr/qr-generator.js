// ================================
// QR GENERATOR — BOOTSTRAP
// ================================
// Creates the QRGenerator namespace, shared state, and orchestrates init.
// Load this FIRST — all other qr/ modules add methods to QRGenerator.

const QRGenerator = {
    // --- Shared state ---
    currentPattern: 'square',
    currentFrame: 'none',
    currentColor: '#000000',
    currentBgColor: '#ffffff',
    currentFormat: 'png',
    currentSize: 400,
    currentLink: '',
    currentBrandName: '',
    qrCodeStyling: null,
    floatingCanvas: null,
    floatingPreview: null,

    // --- Init (orchestration) ---
    init() {
        this.cacheDom();
        this.bindEvents();
        this.loadUserLinks();
        this.createFloatingPreview();
        this.initScrollBehavior();
    },

    // --- Cache DOM references ---
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

    // --- Bind all DOM events ---
    bindEvents() {
        if (!this.generateBtn || !this.qrLinkInput) return;

        // Generate QR
        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.qrLinkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateQR();
        });

        // Size slider
        this.qrSizeSlider?.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            if (this.qrSizeValue) {
                this.qrSizeValue.textContent = `${this.currentSize}px`;
            }
            if (this.currentLink) this.generateQR();
        });

        // Brand name
        this.qrBrandInput.addEventListener('input', (e) => {
            this.currentBrandName = e.target.value;
            if (this.currentLink) this.generateQR();
        });

        // Pattern selection
        document.querySelectorAll('.pattern-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.pattern-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.currentPattern = option.dataset.pattern;
                if (this.currentLink) this.generateQR();
            });
        });

        // Frame selection
        document.querySelectorAll('.frame-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.frame-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.currentFrame = option.dataset.frame;
                if (this.currentLink) this.generateQR();
            });
        });

        // Color pickers
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

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = preset.dataset.color;
                this.currentColor = color;
                this.qrColorPicker.value = color;
                this.qrColorHex.value = color.toUpperCase();
                if (this.currentLink) this.generateQR();
            });
        });

        // Background color for JPG
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

        // Transparent background toggle
        this.transparentBg.addEventListener('change', (e) => {
            if (this.currentLink) this.generateQR();
        });

        // Format selection
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

        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
    }
};

// Expose globally
window.QRGenerator = QRGenerator;
