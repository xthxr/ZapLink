// ================================
// QR GENERATOR — SCANNER
// ================================
// Camera-based QR code scanner using BarcodeDetector API with jsQR fallback.
// Load AFTER qr-generator.js (QRGenerator must exist).

let _scannerActive = false;
let _scannerStream = null;
let _scannerAnimation = null;
let _scannerModal = null;
let _scannerVideo = null;

// --- Init scanner (adds scan button to DOM) ---
QRGenerator.initScanner = function () {
    // Add scan button next to the generate button
    const generateBtn = document.getElementById('generateQRBtn');
    if (!generateBtn) return;

    // Check if button already exists
    if (document.getElementById('scanQRBtn')) return;

    const scanBtn = document.createElement('button');
    scanBtn.id = 'scanQRBtn';
    scanBtn.className = 'btn btn-secondary';
    scanBtn.style.marginLeft = '8px';
    scanBtn.innerHTML = '<i class="fas fa-camera"></i> Scan QR';
    scanBtn.type = 'button';
    scanBtn.addEventListener('click', () => this.openScanner());

    generateBtn.parentNode.insertBefore(scanBtn, generateBtn.nextSibling);

    // Create scanner modal (hidden)
    this._createScannerModal();
};

// --- Create scanner modal DOM ---
QRGenerator._createScannerModal = function () {
    if (document.getElementById('qrScannerModal')) return;

    _scannerModal = document.createElement('div');
    _scannerModal.id = 'qrScannerModal';
    _scannerModal.style.cssText = `
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10000; justify-content: center;
        align-items: center; flex-direction: column;
    `;

    _scannerModal.innerHTML = `
        <div style="background: #1a1a1a; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; text-align: center;">
            <h3 style="margin: 0 0 16px; color: #fff;">
                <i class="fas fa-camera"></i> Scan QR Code
            </h3>
            <div style="position: relative; width: 100%; aspect-ratio: 1; background: #000; border-radius: 12px; overflow: hidden;">
                <video id="qrScannerVideo" style="width: 100%; height: 100%; object-fit: cover;"></video>
                <div id="qrScannerOverlay" style="
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 60%; height: 60%; border: 2px solid rgba(6, 182, 212, 0.8);
                    border-radius: 12px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
                    pointer-events: none;
                "></div>
                <div id="qrScannerStatus" style="
                    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
                    color: #fff; font-size: 14px; background: rgba(0,0,0,0.7);
                    padding: 6px 16px; border-radius: 8px;
                ">Position QR code in the frame</div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
                <button id="qrScannerCloseBtn" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button id="qrScannerSwitchBtn" class="btn btn-secondary">
                    <i class="fas fa-sync-alt"></i> Switch Camera
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(_scannerModal);

    _scannerVideo = document.getElementById('qrScannerVideo');

    document.getElementById('qrScannerCloseBtn').addEventListener('click', () => this.closeScanner());
    document.getElementById('qrScannerSwitchBtn').addEventListener('click', () => this._switchCamera());
};

// --- Open scanner modal ---
QRGenerator.openScanner = function () {
    _scannerModal = _scannerModal || document.getElementById('qrScannerModal');
    if (!_scannerModal) {
        this._createScannerModal();
    }
    _scannerModal.style.display = 'flex';
    _scannerActive = true;
    this._startCamera();
};

// --- Close scanner modal ---
QRGenerator.closeScanner = function () {
    _scannerModal = _scannerModal || document.getElementById('qrScannerModal');
    if (_scannerModal) _scannerModal.style.display = 'none';
    _scannerActive = false;
    this._stopCamera();
};

// --- Start camera ---
QRGenerator._startCamera = async function (facingMode) {
    if (typeof facingMode === 'undefined') facingMode = 'environment';

    this._stopCamera();

    try {
        _scannerStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 640 }, height: { ideal: 640 } }
        });

        if (_scannerVideo) {
            _scannerVideo.srcObject = _scannerStream;
            await _scannerVideo.play();

            // Try BarcodeDetector first
            if ('BarcodeDetector' in window) {
                this._scanWithBarcodeDetector();
            } else {
                // Fallback: load jsQR dynamically
                this._loadJsQRAndScan();
            }
        }
    } catch (err) {
        console.error('Camera error:', err);
        const statusEl = document.getElementById('qrScannerStatus');
        if (statusEl) {
            statusEl.textContent = 'Camera access denied. Please allow camera permissions.';
            statusEl.style.color = '#ef4444';
        }
    }
};

// --- Stop camera ---
QRGenerator._stopCamera = function () {
    if (_scannerAnimation) {
        cancelAnimationFrame(_scannerAnimation);
        _scannerAnimation = null;
    }

    if (_scannerStream) {
        _scannerStream.getTracks().forEach(track => track.stop());
        _scannerStream = null;
    }

    if (_scannerVideo) {
        _scannerVideo.srcObject = null;
    }
};

// --- Switch camera (front/back) ---
QRGenerator._switchCamera = function () {
    if (!_scannerStream) return;

    // Toggle between environment and user facing cameras
    const currentTrack = _scannerStream.getVideoTracks()[0];
    const facingMode = currentTrack?.getSettings()?.facingMode;

    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    this._startCamera(newMode);
};

// --- Scan using native BarcodeDetector API ---
QRGenerator._scanWithBarcodeDetector = function () {
    if (!_scannerActive || !_scannerVideo) return;

    const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });

    const detect = async () => {
        if (!_scannerActive) return;

        try {
            const barcodes = await barcodeDetector.detect(_scannerVideo);
            if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                this._onQRScanned(code);
                return;
            }
        } catch (err) {
            // Detector not ready yet — retry
        }

        const statusEl = document.getElementById('qrScannerStatus');
        if (statusEl) {
            statusEl.textContent = 'Position QR code in the frame';
            statusEl.style.color = '#fff';
        }

        _scannerAnimation = requestAnimationFrame(() => this._scanWithBarcodeDetector());
    };

    detect();
};

// --- Fallback: load jsQR and scan ---
QRGenerator._loadJsQRAndScan = function () {
    // Check if jsQR is already loaded
    if (typeof window.jsQR === 'undefined') {
        const statusEl = document.getElementById('qrScannerStatus');
        if (statusEl) {
            statusEl.textContent = 'Loading scanner library...';
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => {
            this._scanWithJsQR();
        };
        script.onerror = () => {
            if (statusEl) {
                statusEl.textContent = 'Scanner library failed to load. Try a different browser.';
                statusEl.style.color = '#ef4444';
            }
        };
        document.head.appendChild(script);
    } else {
        this._scanWithJsQR();
    }
};

// --- Scan using jsQR ---
QRGenerator._scanWithJsQR = function () {
    if (!_scannerActive || !_scannerVideo) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const detect = () => {
        if (!_scannerActive) return;

        if (_scannerVideo.readyState === _scannerVideo.HAVE_ENOUGH_DATA) {
            canvas.width = _scannerVideo.videoWidth;
            canvas.height = _scannerVideo.videoHeight;
            ctx.drawImage(_scannerVideo, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert'
            });

            if (code && code.data) {
                this._onQRScanned(code.data);
                return;
            }
        }

        _scannerAnimation = requestAnimationFrame(detect);
    };

    detect();
};

// --- Handle successful scan ---
QRGenerator._onQRScanned = function (data) {
    if (!_scannerActive) return;

    // Vibrate to indicate success
    try { navigator.vibrate?.(200); } catch (e) { /* ignore */ }

    const statusEl = document.getElementById('qrScannerStatus');
    if (statusEl) {
        statusEl.textContent = '✓ QR Code detected!';
        statusEl.style.color = '#22c55e';
    }

    // Populate the input and close scanner
    this.qrLinkInput.value = data;
    this.closeScanner();

    // Auto-generate QR code
    setTimeout(() => this.generateQR(), 300);
};
