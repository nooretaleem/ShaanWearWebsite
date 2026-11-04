/**
 * SHAANWEAR — Dedicated Shopping Cart Controller
 * Handles cart rendering, quantity changes, item removal, coupon codes,
 * real-time subtotal & shipping calculations, notes, and localStorage sync.
 */

(function () {
    'use strict';

    // Storage keys
    const CART_KEY = 'shaanwear_cart';
    const NOTE_KEY = 'shaanwear_cart_note';
    const COUPON_KEY = 'shaanwear_cart_coupon';
    const FREE_SHIPPING_THRESHOLD = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.freeShippingThreshold) || 4999;
    const STANDARD_SHIPPING_FEE = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.standardShippingFee) || 250;
    const API_BASE = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.apiUrl) || 'https://shaan-wear-backend.vercel.app/api';


    // DOM Utilities
    const qs = (sel, parent = document) => parent.querySelector(sel);
    const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];
    const fmtPrice = (num) => 'PKR ' + Number(num || 0).toLocaleString('en-US');

    // Cart state
    const state = {
        items: [],
        appliedCoupon: null,
        note: '',
        catalog: []
    };

    /* ---------- 1. DATA ACCESS ---------- */
    function getStoredCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('[Cart] Error reading localStorage:', e);
            return [];
        }
    }

    function saveStoredCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('[Cart] Error saving localStorage:', e);
        }
    }

    function getStoredNote() {
        return localStorage.getItem(NOTE_KEY) || '';
    }

    function saveStoredNote(note) {
        localStorage.setItem(NOTE_KEY, note);
    }

    function getStoredCoupon() {
        return sessionStorage.getItem(COUPON_KEY) || null;
    }

    function saveStoredCoupon(code) {
        if (code) {
            sessionStorage.setItem(COUPON_KEY, code);
        } else {
            sessionStorage.removeItem(COUPON_KEY);
        }
    }

    /* ---------- 2. INITIALIZATION ---------- */
    function init() {
        state.catalog = window.SHAANWEAR_PRODUCTS || [];
        state.items = getStoredCart();
        state.note = getStoredNote();

        // Restore stored coupon if saved previously
        const savedCouponCode = getStoredCoupon();
        if (savedCouponCode) {
            validateAndApplyCoupon(savedCouponCode, false);
        }

        renderCart();
        initNoteHandler();
        initCouponHandler();
        initContinueShopping();
        initStorageSync();
        updateHeaderCartCount();
    }

    /* ---------- 3. HEADER BADGE & MINICART SYNC ---------- */
    function updateHeaderCartCount() {
        const totalItems = state.items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
        const countBadges = qsa('#cartCount');
        countBadges.forEach(badge => {
            badge.textContent = totalItems;
            badge.hidden = totalItems === 0;
        });

        // Also update minicart drawer if present on page
        syncMiniCart();
    }

    function syncMiniCart() {
        const body = qs('#minicart .minicart__body');
        const subtotalEl = qs('#minicartSubtotal');
        const foot = qs('#minicartFoot') || qs('.minicart__foot');

        if (!body) return;

        if (!state.items.length) {
            body.innerHTML = '<p class="minicart__empty">Your bag is currently empty.</p>';
            if (subtotalEl) subtotalEl.textContent = 'PKR 0';
            return;
        }

        let subtotal = 0;
        body.innerHTML = '';

        state.items.forEach((item, index) => {
            const lineTotal = (item.price || 0) * (item.qty || 1);
            subtotal += lineTotal;

            const row = document.createElement('div');
            row.className = 'minicart-item';
            row.style.display = 'flex';
            row.style.gap = '14px';
            row.style.padding = '14px 0';
            row.style.borderBottom = '1px solid var(--border, #E5E3DE)';
            row.style.alignItems = 'center';

            row.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 2px; flex-shrink: 0;" />
                <div style="flex: 1; min-width: 0;">
                    <p style="font-size: 13.5px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</p>
                    <p style="font-size: 11.5px; color: var(--text-gray, #6E6E6E); margin-bottom: 4px;">${item.color || 'Standard'} / ${item.size || 'M'} / Qty: ${item.qty}</p>
                    <p style="font-size: 13px; font-weight: 700; color: var(--black, #111);">${fmtPrice(lineTotal)}</p>
                </div>
                <button type="button" class="minicart-remove-btn" aria-label="Remove item" data-index="${index}" style="color: #999; font-size: 18px; padding: 4px; cursor: pointer; background: none; border: none;">&times;</button>
            `;

            body.appendChild(row);
        });

        if (subtotalEl) {
            subtotalEl.textContent = fmtPrice(subtotal);
        }

        // Mini-cart remove buttons
        qsa('.minicart-remove-btn', body).forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                removeItem(idx);
            });
        });
    }

    /* ---------- 4. RENDER MAIN CART ---------- */
    function renderCart() {
        const container = qs('#cart-items-container');
        const tableHeader = qs('#cartTableHeader');
        const bottomExtras = qs('#cartBottomExtras');
        const sidebar = qs('#cartSidebar');
        const shippingBanner = qs('#shippingBanner');

        if (!container) return;

        // EMPTY CART STATE
        if (!state.items || state.items.length === 0) {
            if (tableHeader) tableHeader.style.display = 'none';
            if (bottomExtras) bottomExtras.style.display = 'none';
            if (shippingBanner) shippingBanner.style.display = 'none';

            container.innerHTML = `
                <div class="cart-empty-view">
                    <div class="cart-empty__icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <path d="M3 6h18"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                    </div>
                    <h2 class="cart-empty__title">Your cart is currently empty</h2>
                    <p class="cart-empty__desc">You haven't added any items to your shopping bag yet. Explore our authentic export surplus collection and find premium menswear tailored for everyday style.</p>
                    <a href="index.html#tshirts" class="cart-empty__action">
                        <span>Continue Shopping</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            `;

            updateSummaryCalculations(0);
            updateHeaderCartCount();
            return;
        }

        // SHOW TABLES & EXTRAS IF CART HAS ITEMS
        if (tableHeader) tableHeader.style.display = '';
        if (bottomExtras) bottomExtras.style.display = '';
        if (shippingBanner) shippingBanner.style.display = '';

        container.innerHTML = '';

        let subtotal = 0;

        state.items.forEach((item, index) => {
            const qty = Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            const lineTotal = price * qty;
            subtotal += lineTotal;

            // Enrich with product data from catalog if available
            const catalogProduct = state.catalog.find(p => p.id === item.id);
            const oldPrice = catalogProduct ? catalogProduct.oldPrice : null;
            const category = catalogProduct ? catalogProduct.category : 'Everyday Surplus';

            // Find color hex code if available
            let colorHex = '#222222';
            if (catalogProduct && catalogProduct.colors) {
                const foundColor = catalogProduct.colors.find(c => c.name.toLowerCase() === (item.color || '').toLowerCase());
                if (foundColor && foundColor.hex) colorHex = foundColor.hex;
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.dataset.index = index;

            // HTML Structure matching user's exact specification:
            // Left: thumbnail + title + variant info
            // Middle: unit price (and strike-through original if on sale)
            // Right: quantity selector (- 1 +) and line total price
            // Far right: small 'X' button to remove
            itemEl.innerHTML = `
                <div class="cart-item__product">
                    <a href="product-detail.html?id=${item.id}" class="cart-item__thumb-link" aria-label="${item.name}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item__thumb" loading="lazy" />
                    </a>
                    <div class="cart-item__info">
                        <span class="cart-item__category">${category}</span>
                        <a href="product-detail.html?id=${item.id}" class="cart-item__name">${item.name}</a>
                        <div class="cart-item__variants">
                            <span class="variant-tag">
                                <span class="variant-color-dot" style="background-color: ${colorHex};"></span>
                                ${item.color || 'Standard'}
                            </span>
                            <span class="variant-tag">Size: ${item.size || 'M'}</span>
                        </div>
                        <div class="cart-item__mobile-price">
                            ${fmtPrice(price)} ${oldPrice && oldPrice > price ? `<del style="color: #999; font-weight: normal; font-size: 12px; margin-left: 4px;">${fmtPrice(oldPrice)}</del>` : ''}
                        </div>
                    </div>
                </div>

                <div class="cart-item__price-col">
                    <span class="unit-price">${fmtPrice(price)}</span>
                    ${oldPrice && oldPrice > price ? `<span class="unit-old-price">${fmtPrice(oldPrice)}</span>` : ''}
                </div>

                <div class="cart-item__qty-col">
                    <div class="cart-qty" role="group" aria-label="Quantity selector for ${item.name}">
                        <button type="button" class="cart-qty__btn qty-minus" aria-label="Decrease quantity" data-action="minus" ${qty <= 1 ? 'disabled' : ''}>−</button>
                        <input type="number" class="cart-qty__input" value="${qty}" min="1" max="10" aria-label="Quantity of ${item.name}" data-index="${index}" />
                        <button type="button" class="cart-qty__btn qty-plus" aria-label="Increase quantity" data-action="plus" ${qty >= 10 ? 'disabled' : ''}>+</button>
                    </div>
                </div>

                <div class="cart-item__total-col">
                    <span class="line-total">${fmtPrice(lineTotal)}</span>
                </div>

                <div class="cart-item__remove-col">
                    <button type="button" class="cart-item__remove-btn" aria-label="Remove ${item.name} from cart" data-action="remove" data-index="${index}">&times;</button>
                </div>
            `;

            container.appendChild(itemEl);
        });

        // Attach item-level event listeners
        attachItemEvents();

        // Update Summary Card & Free Shipping Banner
        updateSummaryCalculations(subtotal);
        updateHeaderCartCount();
    }

    /* ---------- 5. QUANTITY & REMOVE EVENT LISTENERS ---------- */
    function attachItemEvents() {
        const container = qs('#cart-items-container');
        if (!container) return;

        // Minus buttons
        qsa('.qty-minus', container).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemRow = e.target.closest('.cart-item');
                const idx = parseInt(itemRow.dataset.index, 10);
                updateItemQty(idx, state.items[idx].qty - 1);
            });
        });

        // Plus buttons
        qsa('.qty-plus', container).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemRow = e.target.closest('.cart-item');
                const idx = parseInt(itemRow.dataset.index, 10);
                updateItemQty(idx, state.items[idx].qty + 1);
            });
        });

        // Input manual change
        qsa('.cart-qty__input', container).forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                updateItemQty(idx, val);
            });
        });

        // Remove buttons
        qsa('.cart-item__remove-btn', container).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index, 10);
                removeItem(idx);
            });
        });
    }

    function updateItemQty(index, newQty) {
        if (!state.items[index]) return;

        if (newQty < 1) {
            removeItem(index);
            return;
        }

        if (newQty > 10) newQty = 10;

        state.items[index].qty = newQty;
        saveStoredCart(state.items);
        renderCart();
    }

    function removeItem(index) {
        if (!state.items[index]) return;

        const container = qs('#cart-items-container');
        const itemRow = qs(`.cart-item[data-index="${index}"]`, container);
        const itemName = state.items[index].name;

        if (itemRow) {
            itemRow.classList.add('is-removing');
            setTimeout(() => {
                state.items.splice(index, 1);
                saveStoredCart(state.items);
                renderCart();
                showToast(`Removed "${itemName}" from your cart`);
            }, 200);
        } else {
            state.items.splice(index, 1);
            saveStoredCart(state.items);
            renderCart();
            showToast(`Removed item from your cart`);
        }
    }

    /* ---------- 6. CALCULATIONS & SUMMARY ---------- */
    function updateSummaryCalculations(subtotal) {
        const subtotalEl = qs('#summarySubtotal');
        const shippingEl = qs('#summaryShipping');
        const totalEl = qs('#summaryTotal');
        const discountLine = qs('#discountLine');
        const discountCodeName = qs('#discountCodeName');
        const discountVal = qs('#summaryDiscount');
        const banner = qs('#shippingBanner');
        const bannerMsg = qs('#shippingBannerMsg');
        const bannerFill = qs('#shippingBannerFill');

        // Subtotal
        if (subtotalEl) {
            subtotalEl.textContent = fmtPrice(subtotal);
        }

        // Free shipping progress logic
        let shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;

        if (banner && bannerMsg && bannerFill) {
            if (subtotal === 0) {
                banner.style.display = 'none';
            } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
                banner.style.display = '';
                banner.classList.add('is-qualified');
                bannerMsg.innerHTML = '🎉 Congratulations! You have unlocked <strong>FREE Nationwide Delivery</strong>!';
                bannerFill.style.width = '100%';
            } else {
                banner.style.display = '';
                banner.classList.remove('is-qualified');
                const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
                const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
                bannerMsg.innerHTML = `Add <strong>${fmtPrice(remaining)}</strong> more to qualify for <strong>FREE Nationwide Shipping</strong>!`;
                bannerFill.style.width = pct + '%';
            }
        }

        // Re-check subtotal eligibility if coupon requires minOrderAmount
        if (state.appliedCoupon && subtotal > 0 && state.appliedCoupon.minOrderAmount && subtotal < state.appliedCoupon.minOrderAmount) {
            const minReq = state.appliedCoupon.minOrderAmount;
            const code = state.appliedCoupon.code;
            state.appliedCoupon = null;
            saveStoredCoupon(null);
            const feedback = qs('#couponFeedback');
            if (feedback) {
                showFeedback(feedback, `Coupon '${code}' removed: minimum subtotal of ${fmtPrice(minReq)} required.`, false);
            }
        }

        // Coupon discount calculation
        let discount = 0;
        if (state.appliedCoupon && subtotal > 0) {
            const c = state.appliedCoupon;
            if (c.type === 'percent') {
                discount = Math.min(subtotal, Math.round((subtotal * c.value) / 100));
            } else if (c.type === 'fixed') {
                discount = Math.min(subtotal, c.value);
            } else if (c.type === 'shipping') {
                shippingFee = 0;
                discount = STANDARD_SHIPPING_FEE;
            }

            if (discountLine) {
                discountLine.hidden = false;
                if (discountCodeName) discountCodeName.textContent = c.code;
                if (discountVal) discountVal.textContent = '-' + fmtPrice(discount);
            }
        } else {
            if (discountLine) discountLine.hidden = true;
        }

        // Shipping line display
        if (shippingEl) {
            if (subtotal === 0) {
                shippingEl.textContent = 'PKR 0';
            } else if (shippingFee === 0) {
                shippingEl.innerHTML = '<strong style="color: #2E7D32;">FREE</strong>';
            } else {
                shippingEl.textContent = fmtPrice(shippingFee);
            }
        }

        // Final Total
        const finalTotal = Math.max(0, subtotal - discount + (subtotal > 0 ? shippingFee : 0));
        if (totalEl) {
            totalEl.textContent = fmtPrice(finalTotal);
        }

        // Checkout button disable/enable if cart is empty
        const checkoutBtn = qs('#cartCheckoutBtn');
        if (checkoutBtn) {
            if (subtotal === 0) {
                checkoutBtn.style.opacity = '0.5';
                checkoutBtn.style.pointerEvents = 'none';
            } else {
                checkoutBtn.style.opacity = '';
                checkoutBtn.style.pointerEvents = '';
            }
        }
    }

    function calculateCurrentSubtotal() {
        return (state.items || []).reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.qty) || 1;
            return sum + (price * qty);
        }, 0);
    }

    /* ---------- 7. COUPON CODE HANDLER & API INTEGRATION ---------- */
    async function validateAndApplyCoupon(code, isUserAction = true) {
        const input = qs('#couponInput');
        const applyBtn = qs('#applyCouponBtn');
        const feedback = qs('#couponFeedback');

        if (!code) return;
        const cleanCode = code.trim().toUpperCase();
        const currentSubtotal = calculateCurrentSubtotal();

        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.textContent = 'Verifying...';
        }

        try {
            const res = await fetch(`${API_BASE}/discounts/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: cleanCode, subtotal: currentSubtotal })
            });

            const data = await res.json();

            if (res.ok && data.success && data.data?.discount) {
                const disc = data.data.discount;
                state.appliedCoupon = {
                    code: disc.code,
                    type: disc.discountType === 'PERCENTAGE' ? 'percent' : 'fixed',
                    value: disc.value,
                    discountAmount: disc.discountAmount,
                    minOrderAmount: disc.minOrderAmount,
                    label: disc.discountType === 'PERCENTAGE' ? `${disc.value}% OFF` : `PKR ${disc.value} OFF`
                };
                saveStoredCoupon(disc.code);

                if (input) input.value = disc.code;
                if (feedback) {
                    showFeedback(
                        feedback,
                        `✓ Code <strong>${disc.code}</strong> applied (${state.appliedCoupon.label}) <button type="button" id="cartRemoveCouponBtn" style="margin-left: 8px; background: none; border: none; color: #b8332a; font-weight: 600; text-decoration: underline; cursor: pointer; font-size: 11.5px;">Remove</button>`,
                        true
                    );
                    const removeBtn = qs('#cartRemoveCouponBtn', feedback);
                    if (removeBtn) {
                        removeBtn.addEventListener('click', () => removeCoupon(true));
                    }
                }

                updateSummaryCalculations(currentSubtotal);
                if (isUserAction) {
                    showToast(`Coupon "${disc.code}" successfully applied!`);
                }
            } else {
                const errMsg = data.error?.message || `Coupon code '${cleanCode}' is not eligible.`;
                if (feedback) {
                    showFeedback(feedback, errMsg, false);
                }
                if (state.appliedCoupon?.code === cleanCode) {
                    removeCoupon(false);
                }
            }
        } catch (netErr) {
            console.warn('[Cart] Network coupon validation error:', netErr);
            if (isUserAction && feedback) {
                showFeedback(feedback, 'Unable to verify coupon online. Please check network connection.', false);
            }
        } finally {
            if (applyBtn) {
                applyBtn.disabled = false;
                applyBtn.textContent = 'Apply';
            }
        }
    }

    function removeCoupon(showNotice = true) {
        state.appliedCoupon = null;
        saveStoredCoupon(null);
        const input = qs('#couponInput');
        const feedback = qs('#couponFeedback');
        if (input) input.value = '';
        if (feedback) {
            if (showNotice) {
                showFeedback(feedback, 'Coupon has been removed.', false);
                setTimeout(() => { if (feedback && !state.appliedCoupon) feedback.hidden = true; }, 3000);
            } else {
                feedback.hidden = true;
            }
        }
        updateSummaryCalculations(calculateCurrentSubtotal());
        showToast('Coupon removed');
    }

    function initCouponHandler() {
        const input = qs('#couponInput');
        const applyBtn = qs('#applyCouponBtn');
        const feedback = qs('#couponFeedback');

        if (!applyBtn || !input) return;

        applyBtn.addEventListener('click', () => {
            const code = input.value.trim().toUpperCase();

            if (!code) {
                showFeedback(feedback, 'Please enter a coupon code', false);
                return;
            }

            validateAndApplyCoupon(code, true);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyBtn.click();
            }
        });
    }

    function showFeedback(el, msg, isSuccess) {
        if (!el) return;
        el.hidden = false;
        el.className = 'coupon-feedback ' + (isSuccess ? 'is-success' : 'is-error');
        el.innerHTML = msg;
    }

    /* ---------- 8. ORDER NOTE HANDLER ---------- */
    function initNoteHandler() {
        const textarea = qs('#cartNoteInput');
        if (!textarea) return;

        // Restore saved note
        textarea.value = state.note;

        let timeout = null;
        textarea.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                state.note = textarea.value.trim();
                saveStoredNote(state.note);
            }, 300);
        });
    }

    /* ---------- 9. CROSS-TAB STORAGE SYNC ---------- */
    function initStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === CART_KEY) {
                state.items = getStoredCart();
                renderCart();
            } else if (e.key === NOTE_KEY) {
                const noteInput = qs('#cartNoteInput');
                if (noteInput && document.activeElement !== noteInput) {
                    noteInput.value = getStoredNote();
                }
            }
        });
    }

    /* ---------- 10. CONTINUE SHOPPING HANDLER ---------- */
    function initContinueShopping() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#continueShoppingBtn, .cart-btn-view, .cart-empty__action');
            if (!btn) return;

            const ref = document.referrer;
            // If user arrived from another store page on this site (e.g. product detail or catalog), return there smoothly
            if (ref && ref.includes(window.location.host) && !ref.includes('cart.html') && !ref.includes('checkout.html')) {
                e.preventDefault();
                window.location.href = ref;
            } else {
                e.preventDefault();
                window.location.href = 'index.html#tshirts';
            }
        });
    }

    /* ---------- 10. TOAST NOTIFICATION ---------- */
    function showToast(msg) {
        let toast = qs('#cartToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cartToast';
            toast.className = 'cart-toast';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            <span>${msg}</span>
        `;
        toast.classList.add('is-visible');

        setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 3000);
    }

    // Expose controller to global window for testing or integrations
    window.SHAANWEAR_CART = {
        init,
        getCart: () => state.items,
        addItem: (item) => {
            const cart = getStoredCart();
            const existingIdx = cart.findIndex(i => i.id === item.id && i.color === item.color && i.size === item.size);
            if (existingIdx > -1) {
                cart[existingIdx].qty = (cart[existingIdx].qty || 1) + (item.qty || 1);
            } else {
                cart.push(item);
            }
            saveStoredCart(cart);
            state.items = cart;
            renderCart();
        },
        removeItem,
        updateQty: updateItemQty,
        clearCart: () => {
            state.items = [];
            saveStoredCart([]);
            renderCart();
        }
    };

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
