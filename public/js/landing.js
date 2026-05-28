// ================================
// PIIK.ME - LANDING INTERACTIVITY
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initWorkerGlobe();
    initMobileMenu();
    initScrollAnimations();
    initThemeToggle();
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
    const links = document.querySelectorAll('.mobile-link');
    
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
        menu.classList.add('translate-x-full');
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
            menu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
            syncMenuState(true);
            const firstFocusable = menu.querySelector('.mobile-link, button, [href], [tabindex]:not([tabindex="-1"])');
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
            const isLight = document.documentElement.classList.contains('light-theme');
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)';
                navbar.classList.add('shadow-lg');
            } else {
                navbar.style.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.2)';
                navbar.classList.remove('shadow-lg');
            }
        });
    }
}

// ================================
// THEME TOGGLE
// ================================
function initThemeToggle() {
    const desktopToggle = document.getElementById('themeToggleBtn');
    const mobileToggle = document.getElementById('mobileThemeToggleBtn');
    const toggles = [desktopToggle, mobileToggle].filter(Boolean);
    
    function updateIcon() {
        const isLight = document.documentElement.classList.contains('light-theme');
        toggles.forEach(toggle => {
            const lightIcon = toggle.querySelector('.light-icon');
            const darkIcon = toggle.querySelector('.dark-icon');
            if (lightIcon && darkIcon) {
                if (isLight) {
                    lightIcon.style.display = 'block';
                    darkIcon.style.display = 'none';
                } else {
                    lightIcon.style.display = 'none';
                    darkIcon.style.display = 'block';
                }
            }
        });
        
        // Trigger scroll event to update navbar color based on theme
        window.dispatchEvent(new Event('scroll'));
    }

    function toggleTheme() {
        const isLight = document.documentElement.classList.contains('light-theme');
        if (isLight) {
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
        updateIcon();
    }

    toggles.forEach(toggle => {
        toggle.addEventListener('click', toggleTheme);
    });

    // Initialize icon state
    updateIcon();
}
