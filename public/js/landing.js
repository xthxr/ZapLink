// ================================
// PIIK.ME - LANDING INTERACTIVITY
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initWorkerGlobe();
    initMobileMenu();
    initScrollAnimations();
});

// ================================
// 3D GLOBE VISUALIZATION
// ================================
function initWorkerGlobe() {
    const canvas = document.getElementById('globeViz');
    if (!canvas) return;

    if (!('transferControlToOffscreen' in canvas)) {
        console.error('OffscreenCanvas is not supported in this browser.');
        return; 
    }

    // Detach canvas from Main Thread
    const offscreenCanvas = canvas.transferControlToOffscreen();

    // Start Worker
    const worker = new Worker('js/globe-worker.js');

    worker.postMessage({ 
        type: 'INIT', 
        canvas: offscreenCanvas,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: Math.min(window.devicePixelRatio, 1.2)
    }, [offscreenCanvas]); 

    window.addEventListener('resize', () => {
        worker.postMessage({
            type: 'RESIZE',
            width: window.innerWidth,
            height: window.innerHeight
        });
    });

    console.log('Main thread is free! God-Tier Web Worker Active 🚀');
}

// ================================
// MOBILE MENU
// ================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('mobileMenu');
    const closeButton = document.getElementById('mobileMenuClose');
    const links = document.querySelectorAll('.landing-mobile-link');
    
    if (!toggle || !menu) return;

    let isOpen = false;
    let previousFocus = null;

    function syncMenuState(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        menu.setAttribute('aria-hidden', String(!open));
    }

    function closeMenu({ restoreFocus = true } = {}) {
        if (!isOpen) return;

        isOpen = false;
        menu.classList.remove('open');
        document.body.style.overflow = '';
        syncMenuState(false);

        if (restoreFocus) {
            toggle.focus();
        } else if (previousFocus && typeof previousFocus.focus === 'function') {
            previousFocus.focus();
        }
    }

    function toggleMenu() {
        if (!isOpen) {
            previousFocus = document.activeElement;
            isOpen = true;
            menu.classList.add('open');
            document.body.style.overflow = 'hidden';
            syncMenuState(true);
            const firstFocusable = menu.querySelector('a, button, [href], [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        } else {
            closeMenu();
        }
    }

    syncMenuState(false);
    toggle.addEventListener('click', toggleMenu);
    if (closeButton) {
        closeButton.addEventListener('click', () => closeMenu());
    }
    
    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu({ restoreFocus: false });
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
}

// ================================
// SCROLL ANIMATIONS (Native)
// ================================
function initScrollAnimations() {
    // Navbar Blur Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                navbar.classList.add('shadow-lg');
            } else {
                navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                navbar.classList.remove('shadow-lg');
            }
        });
    }
}
