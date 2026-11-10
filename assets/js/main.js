/* =====================================================
   VELQOR — Navbar + Hero interactions
   ===================================================== */

(function () {
    'use strict';

    const qs = (s, c = document) => c.querySelector(s);
    const qsa = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- 1. HEADER SCROLL ---------- */
    const header = qs('#header');
    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 2. SEARCH PANEL ---------- */
    const searchPanel = qs('#searchPanel');
    const searchToggle = qs('#searchToggle');
    const searchInput = qs('#searchInput');

    function openSearch() {
        if (!searchPanel) return;
        closeCart(); closeMobile();
        searchPanel.hidden = false;
        searchToggle?.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => searchInput?.focus());
    }
    function closeSearch() {
        if (searchPanel) searchPanel.hidden = true;
        searchToggle?.setAttribute('aria-expanded', 'false');
    }
    searchToggle?.addEventListener('click', () => {
        if (!searchPanel) return;
        searchPanel.hidden ? openSearch() : closeSearch();
    });

    /* ---------- 3. MINI CART ---------- */
    const minicart = qs('#minicart');
    const cartToggle = qs('#cartToggle');
    const minicartX = qs('#minicartClose');
    const minicartContinue = qs('#minicartContinue');
    const backdrop = qs('#backdrop');

    /* ---------- 4. MOBILE NAV ---------- */
    const mobileNav = qs('#mobileNav');
    const hamburger = qs('#hamburger');
    const mobileClose = qs('#mobileClose');

    // Move overlays to direct children of body to avoid backdrop-filter and stacking-context traps from <header>
    [searchPanel, minicart, backdrop, mobileNav].forEach(el => {
        if (el && el.parentElement && el.parentElement !== document.body) {
            document.body.appendChild(el);
        }
    });

    function openCart() {
        if (!minicart) return;
        closeSearch(); closeMobile();
        minicart.hidden = false;
        minicart.classList.add('is-open');
        if (backdrop) {
            backdrop.hidden = false;
            backdrop.classList.add('is-open');
        }
        cartToggle?.setAttribute('aria-expanded', 'true');
    }
    function closeCart() {
        if (minicart) {
            minicart.classList.remove('is-open');
            minicart.hidden = true;
        }
        if (backdrop && (!mobileNav || !mobileNav.classList.contains('is-open'))) {
            backdrop.classList.remove('is-open');
            backdrop.hidden = true;
        }
        cartToggle?.setAttribute('aria-expanded', 'false');
    }
    cartToggle?.addEventListener('click', () => {
        if (!minicart) {
            window.location.href = 'cart.html';
            return;
        }
        const isOpen = minicart.classList.contains('is-open') && !minicart.hidden;
        isOpen ? closeCart() : openCart();
    });
    minicartX?.addEventListener('click', closeCart);
    minicart?.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (!href || href === '#' || link.id === 'minicartContinue') {
                e.preventDefault();
                closeCart();
            } else {
                // Real navigation link (e.g. cart.html or checkout.html)
                closeCart();
            }
        }
    });
    backdrop?.addEventListener('click', () => { closeCart(); closeSearch(); closeMobile(); });

    function openMobile() {
        closeSearch(); closeCart();
        if (mobileNav) {
            mobileNav.hidden = false;
            mobileNav.classList.add('is-open');
        }
        if (backdrop) {
            backdrop.hidden = false;
            backdrop.classList.add('is-open');
        }
        hamburger?.classList.add('is-open');
        hamburger?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobile() {
        if (mobileNav) {
            mobileNav.classList.remove('is-open');
            mobileNav.hidden = true;
        }
        if (backdrop && (!minicart || !minicart.classList.contains('is-open'))) {
            backdrop.classList.remove('is-open');
            backdrop.hidden = true;
        }
        hamburger?.classList.remove('is-open');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    hamburger?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!mobileNav) return;
        const isOpen = mobileNav.classList.contains('is-open') && !mobileNav.hidden;
        isOpen ? closeMobile() : openMobile();
    });
    mobileClose?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobile();
    });
    qsa('.mobile-nav__links a').forEach(a =>
        a.addEventListener('click', closeMobile)
    );

    /* ---------- 5. ESC to close anything ---------- */
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (searchPanel && !searchPanel.hidden) closeSearch();
        else if (minicart && minicart.classList.contains('is-open')) closeCart();
        else if (mobileNav && mobileNav.classList.contains('is-open')) closeMobile();
    });

    /* ---------- 6. WISHLIST NAVIGATION ---------- */
    const wishToggle = qs('#wishToggle');

    wishToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.ShaanwearWishlist && typeof window.ShaanwearWishlist.handleWishlistHeaderClick === 'function') {
            window.ShaanwearWishlist.handleWishlistHeaderClick(e);
        } else {
            const isAuth = window.ShaanwearAuth && typeof window.ShaanwearAuth.isAuthenticated === 'function'
                ? window.ShaanwearAuth.isAuthenticated()
                : !!(localStorage.getItem('shaanwear_access_token') || localStorage.getItem('shaanwear_token'));

            if (isAuth) {
                window.location.href = 'account.html#wishlist';
            } else {
                window.location.href = 'login.html?redirect=' + encodeURIComponent('account.html#wishlist');
            }
        }
    });

    /* ---------- 7. SOURCING DISCLAIMER MODAL ---------- */
    const disclaimerModal = qs('#disclaimerModal');
    const disclaimerClose = qs('#disclaimerClose');
    const disclaimerBackdrop = qs('#disclaimerBackdrop');
    const disclaimerTriggers = qsa('.sourcing-disclaimer-trigger, a[href="#sourcing-disclaimer"]');

    function openDisclaimer(e) {
        if (e) e.preventDefault();
        if (!disclaimerModal) return;
        disclaimerModal.hidden = false;
        disclaimerModal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    }

    function closeDisclaimer() {
        if (!disclaimerModal) return;
        disclaimerModal.classList.remove('is-active');
        setTimeout(() => {
            disclaimerModal.hidden = true;
            document.body.style.overflow = '';
        }, 300);
    }

    disclaimerTriggers.forEach(t => t.addEventListener('click', openDisclaimer));
    disclaimerClose?.addEventListener('click', closeDisclaimer);
    disclaimerBackdrop?.addEventListener('click', closeDisclaimer);

    /* ---------- 8. Prevent flash of hidden panels ---------- */
    [searchPanel, minicart, backdrop, mobileNav, disclaimerModal].forEach(el => {
        if (el && el.style.visibility) el.style.visibility = '';
    });

    /* ---------- 9. CUSTOMER PROFILE (PERSON ICON) ROUTING ---------- */
    const accountButtons = qsa('#accountBtn, a.icon-btn[aria-label="Account"]');
    accountButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.ShaanwearAuth && typeof window.ShaanwearAuth.handleAccountClick === 'function') {
                window.ShaanwearAuth.handleAccountClick(e);
            } else {
                const token = localStorage.getItem('shaanwear_access_token') || localStorage.getItem('shaanwear_token');
                window.location.href = token ? 'account.html' : 'login.html';
            }
        });
    });

    // Visual authentication state update on header icon
    function syncAuthBadge() {
        const isAuth = window.ShaanwearAuth ? window.ShaanwearAuth.isAuthenticated() : false;
        const user = window.ShaanwearAuth ? window.ShaanwearAuth.getUser() : null;
        accountButtons.forEach(btn => {
            if (isAuth && user) {
                btn.setAttribute('title', `Logged in as ${user.name}`);
                btn.setAttribute('aria-label', `Account (${user.name})`);
                btn.classList.add('is-authenticated');
            } else {
                btn.setAttribute('title', 'Sign In / Register');
                btn.setAttribute('aria-label', 'Account');
                btn.classList.remove('is-authenticated');
            }
        });
    }

    syncAuthBadge();
    window.addEventListener('shaanwear:auth-changed', syncAuthBadge);
})();