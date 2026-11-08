/**
 * SHAANWEAR — Storefront Wishlist Service
 * Handles persistent database wishlist for logged-in customers,
 * guest localStorage cache, real-time badge updates, and header navigation.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'shaanwear_wishlist';

    const getApiUrl = () => {
        if (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.apiUrl) {
            return window.SHAANWEAR_CONFIG.apiUrl.replace(/\/+$/, '');
        }
        const isLocal = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:'
        );
        const host = (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'))
            ? window.location.hostname
            : 'localhost';

        return isLocal ? `http://${host}:5000/api` : 'https://shaan-wear-backend.vercel.app/api';
    };

    const getAuthToken = () => {
        if (window.ShaanwearAuth && typeof window.ShaanwearAuth.getToken === 'function') {
            return window.ShaanwearAuth.getToken();
        }
        return localStorage.getItem('shaanwear_access_token') || localStorage.getItem('shaanwear_token');
    };

    const isAuthenticated = () => {
        if (window.ShaanwearAuth && typeof window.ShaanwearAuth.isAuthenticated === 'function') {
            return window.ShaanwearAuth.isAuthenticated();
        }
        const token = getAuthToken();
        return !!token;
    };

    // Read cached product IDs from localStorage
    const getLocalIds = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    };

    // Save product IDs to localStorage
    const setLocalIds = (ids) => {
        try {
            const unique = Array.from(new Set(ids));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
            return unique;
        } catch (_) {
            return ids;
        }
    };

    // Lightweight floating toast
    const showToast = (message, isError = false) => {
        let toast = document.getElementById('shaanwearGlobalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shaanwearGlobalToast';
            toast.style.position = 'fixed';
            toast.style.bottom = '24px';
            toast.style.right = '24px';
            toast.style.zIndex = '9999';
            toast.style.maxWidth = '360px';
            toast.style.padding = '14px 20px';
            toast.style.borderRadius = '4px';
            toast.style.fontSize = '13px';
            toast.style.fontWeight = '500';
            toast.style.letterSpacing = '0.02em';
            toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.25)';
            toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(16px)';
            toast.style.pointerEvents = 'none';
            document.body.appendChild(toast);
        }

        toast.style.background = isError ? '#9B1C1C' : '#111111';
        toast.style.color = '#FFFFFF';
        toast.style.border = isError ? '1px solid #F87171' : '1px solid #B79A68';
        toast.innerHTML = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(16px)';
        }, 3200);
    };

    const ShaanwearWishlist = {
        has: function (productId) {
            if (!productId) return false;
            const ids = getLocalIds();
            return ids.includes(String(productId));
        },

        getIds: function () {
            return getLocalIds();
        },

        getCount: function () {
            return getLocalIds().length;
        },

        updateBadge: function (count) {
            const c = typeof count === 'number' ? count : this.getCount();
            const badges = document.querySelectorAll('#wishCount');
            badges.forEach((b) => {
                b.textContent = c;
                b.hidden = c === 0;
            });
            const sidebarBadge = document.getElementById('badgeWishlistCount');
            if (sidebarBadge) {
                sidebarBadge.textContent = c;
            }
        },

        syncLocalIds: function (ids) {
            if (!Array.isArray(ids)) return;
            const updated = setLocalIds(ids);
            this.updateBadge(updated.length);
            this.syncProductCardButtons();
        },

        removeLocalId: function (productId) {
            if (!productId) return;
            const ids = getLocalIds().filter((id) => id !== String(productId));
            setLocalIds(ids);
            this.updateBadge(ids.length);
            this.syncProductCardButtons();
        },

        syncProductCardButtons: function () {
            const ids = new Set(getLocalIds());
            document.querySelectorAll('[data-wish-product-id]').forEach((btn) => {
                const pid = btn.getAttribute('data-wish-product-id');
                const isWished = ids.has(pid);
                btn.classList.toggle('is-active', isWished);
                btn.setAttribute('aria-pressed', isWished ? 'true' : 'false');
            });
        },

        // Fetch fresh wishlist from backend (if logged in)
        fetchRemote: async function () {
            if (!isAuthenticated()) {
                this.updateBadge();
                return { items: [], count: this.getCount() };
            }

            const token = getAuthToken();
            try {
                const res = await fetch(`${getApiUrl()}/customer/wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    const items = data.data?.wishlist?.items || [];
                    const ids = items.map((i) => i.productId);
                    this.syncLocalIds(ids);
                    return { items, count: items.length };
                }
            } catch (err) {
                console.warn('[ShaanwearWishlist] Fetch error:', err.message);
            }

            this.updateBadge();
            return { items: [], count: this.getCount() };
        },

        // Add item to wishlist
        add: async function (productId, productMeta = {}) {
            if (!productId) return false;
            const pid = String(productId);
            const currentIds = getLocalIds();
            if (!currentIds.includes(pid)) {
                currentIds.push(pid);
                setLocalIds(currentIds);
            }

            this.updateBadge(currentIds.length);
            this.syncProductCardButtons();

            const productName = productMeta.name || 'Item';
            showToast(`Added <strong>${productName}</strong> to your Wishlist`);

            // If user is logged in, persist to backend database
            if (isAuthenticated()) {
                const token = getAuthToken();
                try {
                    await fetch(`${getApiUrl()}/customer/wishlist/items`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId: pid })
                    });
                } catch (err) {
                    console.warn('[ShaanwearWishlist] Add backend error:', err.message);
                }
            }

            window.dispatchEvent(new CustomEvent('shaanwear:wishlist-updated', {
                detail: { productId: pid, action: 'add', count: currentIds.length }
            }));

            return true;
        },

        // Remove item from wishlist
        remove: async function (productId, productMeta = {}) {
            if (!productId) return false;
            const pid = String(productId);
            const ids = getLocalIds().filter((id) => id !== pid);
            setLocalIds(ids);

            this.updateBadge(ids.length);
            this.syncProductCardButtons();

            showToast('Removed from your Wishlist');

            // If user is logged in, remove from backend database
            if (isAuthenticated()) {
                const token = getAuthToken();
                try {
                    await fetch(`${getApiUrl()}/customer/wishlist/items/${encodeURIComponent(pid)}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (err) {
                    console.warn('[ShaanwearWishlist] Remove backend error:', err.message);
                }
            }

            window.dispatchEvent(new CustomEvent('shaanwear:wishlist-updated', {
                detail: { productId: pid, action: 'remove', count: ids.length }
            }));

            return true;
        },

        // Toggle add / remove
        toggle: async function (productId, productMeta = {}) {
            if (this.has(productId)) {
                await this.remove(productId, productMeta);
                return false;
            } else {
                await this.add(productId, productMeta);
                return true;
            }
        },

        updateCartBadge: function (count) {
            try {
                let total = count;
                if (typeof total !== 'number') {
                    const raw = localStorage.getItem('shaanwear_cart');
                    const cart = raw ? JSON.parse(raw) : [];
                    total = cart.reduce((sum, it) => sum + (Number(it.qty) || 1), 0);
                }
                document.querySelectorAll('#cartCount').forEach(badge => {
                    badge.textContent = total;
                    badge.hidden = total === 0;
                });
            } catch (_) {}
        },

        moveToCart: async function (productId, productMeta = {}) {
            if (!productId) return false;
            const pid = String(productId);

            // 1. Add to local storage cart
            try {
                const raw = localStorage.getItem('shaanwear_cart');
                const cart = raw ? JSON.parse(raw) : [];
                const color = productMeta.color || (productMeta.variants?.[0]?.color) || 'Standard';
                const size = productMeta.size || (productMeta.variants?.[0]?.size) || 'M';
                const price = Number(productMeta.price || productMeta.basePrice || productMeta.unitPrice || 0);
                const image = productMeta.image || productMeta.thumbnail || (productMeta.variants?.[0]?.images?.[0]?.secureUrl) || 'assets/images/products/jackets/jacketcategory-01.jpg';
                const name = productMeta.name || 'Garment';
                const qty = Number(productMeta.quantity || productMeta.qty || 1);

                const existingIndex = cart.findIndex(i => String(i.id) === pid && (i.color || 'Standard') === color && (i.size || 'M') === size);
                if (existingIndex > -1) {
                    cart[existingIndex].qty = (Number(cart[existingIndex].qty) || 1) + qty;
                } else {
                    cart.push({
                        id: pid,
                        name: name,
                        price: price,
                        color: color,
                        size: size,
                        item: '1 Piece',
                        qty: qty,
                        image: image
                    });
                }
                localStorage.setItem('shaanwear_cart', JSON.stringify(cart));
                this.updateCartBadge();
            } catch (e) {
                console.warn('[ShaanwearWishlist moveToCart local warning]:', e);
            }

            // 2. Remove from local wishlist
            this.removeLocalId(pid);

            showToast('Item moved from wishlist directly to your bag!');

            // 3. If authenticated, persist moving this single item to backend
            if (isAuthenticated()) {
                const token = getAuthToken();
                try {
                    await fetch(`${getApiUrl()}/customer/wishlist/move-to-cart`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId: pid, quantity: 1 })
                    });
                } catch (err) {
                    console.warn('[ShaanwearWishlist moveToCart backend error]:', err.message);
                }
            }

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('shaanwear:cart-updated'));
            window.dispatchEvent(new CustomEvent('shaanwear:wishlist-updated', {
                detail: { productId: pid, action: 'move-to-cart' }
            }));

            return true;
        },

        // Migrate guest items to user's DB wishlist upon login
        migrateGuestWishlist: async function () {
            if (!isAuthenticated()) return;
            const token = getAuthToken();
            const guestIds = getLocalIds();
            if (!guestIds.length) return;

            console.log(`[ShaanwearWishlist] Migrating ${guestIds.length} guest wishlist items...`);
            for (const pid of guestIds) {
                try {
                    await fetch(`${getApiUrl()}/customer/wishlist/items`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId: pid })
                    });
                } catch (_) { }
            }

            // Sync with authoritative backend wishlist
            await this.fetchRemote();
        },

        // Heart icon header click handler: navigates directly to Wishlist items
        handleWishlistHeaderClick: function (e) {
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }

            const currentPath = (window.location.pathname || '').toLowerCase();

            // If already on customer dashboard (account.html)
            if (currentPath.endsWith('account.html')) {
                if (typeof window.switchDashboardTab === 'function') {
                    window.switchDashboardTab('wishlist');
                }
                const tabEl = document.getElementById('tab-wishlist');
                if (tabEl) {
                    tabEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            // If logged in: go directly to customer dashboard wishlist tab
            if (isAuthenticated()) {
                window.location.href = 'account.html#wishlist';
            } else {
                window.location.href = 'login.html?redirect=' + encodeURIComponent('account.html#wishlist');
            }
        }
    };

    // Auto-init on page load
    document.addEventListener('DOMContentLoaded', () => {
        ShaanwearWishlist.updateBadge();
        ShaanwearWishlist.updateCartBadge();
        ShaanwearWishlist.fetchRemote();
        ShaanwearWishlist.syncProductCardButtons();
    });

    // Listen for auth state changes (e.g. login)
    window.addEventListener('shaanwear:auth-changed', (event) => {
        if (event.detail && event.detail.isAuthenticated) {
            ShaanwearWishlist.migrateGuestWishlist();
        } else {
            ShaanwearWishlist.updateBadge();
        }
    });

    window.ShaanwearWishlist = ShaanwearWishlist;
})();

