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

    function openCart() {
        if (!minicart) return;
        closeSearch(); closeMobile();
        minicart.hidden = false;
        if (backdrop) backdrop.hidden = false;
        cartToggle?.setAttribute('aria-expanded', 'true');
    }
    function closeCart() {
        if (minicart) minicart.hidden = true;
        if (backdrop && (!mobileNav || mobileNav.hidden)) backdrop.hidden = true;
        cartToggle?.setAttribute('aria-expanded', 'false');
    }
    cartToggle?.addEventListener('click', () => {
        if (!minicart) {
            window.location.href = 'cart.html';
            return;
        }
        minicart.hidden ? openCart() : closeCart();
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

    /* ---------- 4. MOBILE NAV ---------- */
    const mobileNav = qs('#mobileNav');
    const hamburger = qs('#hamburger');
    const mobileClose = qs('#mobileClose');

    function openMobile() {
        closeSearch(); closeCart();
        if (mobileNav) mobileNav.hidden = false;
        if (backdrop) backdrop.hidden = false;
        hamburger?.classList.add('is-open');
        hamburger?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobile() {
        if (!mobileNav) return;
        mobileNav.hidden = true;
        if (backdrop && (!minicart || minicart.hidden)) backdrop.hidden = true;
        hamburger?.classList.remove('is-open');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    hamburger?.addEventListener('click', () => {
        if (!mobileNav) return;
        mobileNav.hidden ? openMobile() : closeMobile();
    });
    mobileClose?.addEventListener('click', closeMobile);
    qsa('.mobile-nav__links a').forEach(a =>
        a.addEventListener('click', closeMobile)
    );

    /* ---------- 5. ESC to close anything ---------- */
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (searchPanel && !searchPanel.hidden) closeSearch();
        else if (minicart && !minicart.hidden) closeCart();
        else if (mobileNav && !mobileNav.hidden) closeMobile();
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
        if (el) el.style.visibility = 'visible';
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