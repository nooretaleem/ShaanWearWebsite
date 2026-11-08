/**
 * SHAANWEAR — Checkout Module
 * Complete end-to-end functionality for checkout form validation,
 * dynamic shipping options, payment method switching, order completion simulation,
 * confirmation modal management, and shopping cart persistence.
 */

(function () {
    'use strict';

    const CART_KEY = 'shaanwear_cart';
    const COUPON_KEY = 'shaanwear_cart_coupon';
    const ORDER_KEY = 'shaanwear_last_order';
    const SAVED_INFO_KEY = 'shaanwear_saved_checkout_info';

    const FREE_SHIPPING_THRESHOLD = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.freeShippingThreshold) || 4999;
    const STANDARD_SHIPPING_FEE = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.standardShippingFee) || 250;
    const API_BASE = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.apiUrl) || 'https://shaan-wear-backend.vercel.app/api';

    // Helper shortcuts
    const qs = (sel, parent = document) => parent.querySelector(sel);
    const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];
    const fmtPrice = (num) => 'Rs. ' + Number(num || 0).toLocaleString('en-US') + '.00';

    // Module State
    const state = {
        items: [],
        subtotal: 0,
        shipping: 250,
        taxes: 0,
        discount: 0,
        appliedCoupon: null,
        selectedShippingMethod: 'Standard Delivery',
        selectedShippingRate: 250,
        selectedPaymentMethod: 'Cash on Delivery'
    };

    /* ---------- 1. DATA ACCESS & PERSISTENCE ---------- */
    function getStoredCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('[Checkout] Error reading cart from localStorage:', e);
            return [];
        }
    }

    function clearStoredCart() {
        try {
            localStorage.removeItem(CART_KEY);
            localStorage.removeItem('shaanwear_cart_note');
            sessionStorage.removeItem(COUPON_KEY);
        } catch (e) {
            console.error('[Checkout] Error clearing cart from storage:', e);
        }
    }

    function getStoredCoupon() {
        return sessionStorage.getItem(COUPON_KEY) || null;
    }

    /* ---------- 2. VALIDATION UTILITIES ---------- */
    /**
     * Standard RFC-compliant email regex.
     */
    function isValidEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    }

    /**
     * Validates Pakistani mobile phone numbers.
     * Supports formats such as:
     * - 0300 1234567, 0300-1234567, 03001234567
     * - +923001234567, +92 300 1234567, +92-300-1234567
     * - 00923001234567, 923001234567
     */
    function isValidPakistaniPhone(phone) {
        if (!phone) return false;
        const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
        return /^(?:\+92|0092|92|0)?3[0-9]{9}$/.test(cleaned);
    }

    /**
     * Highlights field with red border and inserts error message beneath it.
     */
    function setFieldError(inputEl, message) {
        if (!inputEl) return;
        inputEl.classList.add('is-error');
        inputEl.setAttribute('aria-invalid', 'true');

        const errorKey = inputEl.id || inputEl.name || inputEl.placeholder || 'field';
        const parent = inputEl.parentElement;
        let errorEl = parent.querySelector(`.field-error-msg[data-for="${errorKey}"]`);

        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error-msg';
            errorEl.setAttribute('data-for', errorKey);
            errorEl.setAttribute('role', 'alert');
            inputEl.insertAdjacentElement('afterend', errorEl);
        }
        errorEl.textContent = message;
    }

    /**
     * Removes red border and error message from field.
     */
    function clearFieldError(inputEl) {
        if (!inputEl) return;
        inputEl.classList.remove('is-error');
        inputEl.removeAttribute('aria-invalid');

        const errorKey = inputEl.id || inputEl.name || inputEl.placeholder || 'field';
        const parent = inputEl.parentElement;
        if (parent) {
            const errorEl = parent.querySelector(`.field-error-msg[data-for="${errorKey}"]`);
            if (errorEl) {
                errorEl.remove();
            }
        }
    }

    /* ---------- 3. INITIALIZATION ---------- */
    function init() {
        state.items = getStoredCart();

        // If cart is empty on direct page visit, provide a sample item for testing/demo
        if (!state.items || state.items.length === 0) {
            state.items = [
                {
                    id: 101,
                    name: 'Heavyweight Boxy Tee — Jet Black',
                    price: 2490,
                    qty: 1,
                    color: 'Jet Black',
                    size: 'L',
                    image: 'assets/images/products/tshirts/tshirt-1-1.jpg'
                }
            ];
            try {
                localStorage.setItem(CART_KEY, JSON.stringify(state.items));
            } catch (err) {
                // Ignore storage write errors
            }
        }

        // Restore coupon if saved previously
        const savedCouponCode = getStoredCoupon();
        if (savedCouponCode) {
            validateDiscountOnline(savedCouponCode, false);
        }

        renderSummaryItems();
        calculateTotals();
        initMobileSummaryToggle();
        initDiscountHandler();
        initPaymentMethodSwitcher();
        initShippingMethod();
        initCheckoutForm();
        initModalDismissal();
        initRealtimeInputValidation();
        restoreSavedCheckoutInfo();
        initSaveInfoHandler();
        initCustomerAuthIntegration();
    }

    /* ---------- 4. RENDER ORDER SUMMARY ITEMS ---------- */
    function renderSummaryItems() {
        const container = qs('#summaryItemsList');
        const countBadge = qs('#summaryCountBadge');
        if (!container) return;

        container.innerHTML = '';
        let totalCount = 0;

        state.items.forEach((item) => {
            const qty = Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            const linePrice = price * qty;
            totalCount += qty;

            const variantText = [item.color, item.size].filter(Boolean).join(' / ') || 'Standard';

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <div class="summary-item__left">
                    <div class="summary-item__thumb-wrap">
                        <img src="${item.image || 'assets/images/products/tshirts/tshirt-1-1.jpg'}" alt="${item.name}" class="summary-item__thumb" loading="lazy" />
                        <span class="summary-item__qty-badge">${qty}</span>
                    </div>
                    <div class="summary-item__info">
                        <h4 class="summary-item__title">${item.name}</h4>
                        <span class="summary-item__variant">${variantText}</span>
                    </div>
                </div>
                <div class="summary-item__right">
                    <span class="summary-item__price">${fmtPrice(linePrice)}</span>
                    <span class="summary-item__unit-qty">Qty: ${qty}</span>
                </div>
            `;
            container.appendChild(itemEl);
        });

        if (countBadge) {
            countBadge.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
        }
    }

    function resetSummaryDisplay() {
        const container = qs('#summaryItemsList');
        const countBadge = qs('#summaryCountBadge');
        const subtotalEl = qs('#checkoutSubtotal');
        const discountRow = qs('#checkoutDiscountRow');
        const shippingEl = qs('#checkoutShipping');
        const totalEl = qs('#checkoutTotal');
        const mobileTotalEl = qs('#mobileSummaryPrice');

        if (countBadge) countBadge.textContent = '0 items';
        if (container) {
            container.innerHTML = '<p style="color: #6E6E6E; font-size: 13px; text-align: center; padding: 24px 0;">Your shopping cart is now empty.</p>';
        }
        if (subtotalEl) subtotalEl.textContent = 'Rs. 0.00';
        if (discountRow) discountRow.style.display = 'none';
        if (shippingEl) shippingEl.textContent = 'Free (Rs. 0.00)';
        if (totalEl) totalEl.textContent = 'Rs. 0.00';
        if (mobileTotalEl) mobileTotalEl.textContent = 'Rs. 0.00';
    }

    /* ---------- 5. CALCULATIONS ---------- */
    function calculateTotals() {
        let subtotal = 0;
        state.items.forEach(item => {
            subtotal += (Number(item.price) || 0) * (Number(item.qty) || 1);
        });

        state.subtotal = subtotal;
        const isFree = subtotal >= FREE_SHIPPING_THRESHOLD || state.appliedCoupon?.type === 'shipping';
        state.shipping = isFree ? 0 : STANDARD_SHIPPING_FEE;
        state.selectedShippingRate = state.shipping;
        state.taxes = 0;

        // Re-check subtotal minimum requirement
        if (state.appliedCoupon && subtotal > 0 && state.appliedCoupon.minOrderAmount && subtotal < state.appliedCoupon.minOrderAmount) {
            const minReq = state.appliedCoupon.minOrderAmount;
            state.appliedCoupon = null;
            try { sessionStorage.removeItem(COUPON_KEY); } catch (e) { }
            const msg = qs('#checkoutCouponMsg');
            if (msg) {
                msg.className = 'checkout-coupon-msg is-error';
                msg.textContent = `Coupon removed: minimum subtotal of PKR ${minReq.toLocaleString()} required.`;
            }
        }

        // Discount calculation
        let discount = 0;
        if (state.appliedCoupon && subtotal > 0) {
            if (state.appliedCoupon.type === 'percent') {
                discount = Math.min(subtotal, Math.round((subtotal * state.appliedCoupon.value) / 100));
            } else if (state.appliedCoupon.type === 'fixed') {
                discount = Math.min(subtotal, state.appliedCoupon.value);
            } else if (state.appliedCoupon.type === 'shipping') {
                state.shipping = 0;
                discount = 0;
            }
        }
        state.discount = discount;

        const total = Math.max(0, subtotal - discount + state.shipping + state.taxes);

        // Update shipping method box dynamic price
        const shippingPriceEl = qs('#shippingMethodPrice');
        if (shippingPriceEl) {
            shippingPriceEl.textContent = state.shipping === 0 ? 'Free (Rs. 0.00)' : `Rs. ${state.shipping}.00`;
        }

        // Update DOM elements
        const subtotalEl = qs('#checkoutSubtotal');
        const shippingEl = qs('#checkoutShipping');
        const taxesEl = qs('#checkoutTaxes');
        const discountRow = qs('#checkoutDiscountRow');
        const discountVal = qs('#checkoutDiscountVal');
        const discountCodeSpan = qs('#checkoutDiscountCode');
        const totalEl = qs('#checkoutTotal');
        const mobileTotalEl = qs('#mobileSummaryPrice');

        if (subtotalEl) subtotalEl.textContent = fmtPrice(subtotal);

        if (shippingEl) {
            if (state.shipping > 0) {
                shippingEl.textContent = fmtPrice(state.shipping);
            } else {
                shippingEl.textContent = 'Free (Rs. 0.00)';
            }
        }

        if (taxesEl) taxesEl.textContent = 'Rs. 0.00';

        if (discountRow) {
            if (discount > 0) {
                discountRow.style.display = 'flex';
                if (discountVal) discountVal.textContent = '-' + fmtPrice(discount);
                if (discountCodeSpan) discountCodeSpan.textContent = state.appliedCoupon.code;
            } else {
                discountRow.style.display = 'none';
            }
        }

        if (totalEl) totalEl.textContent = fmtPrice(total);
        if (mobileTotalEl) mobileTotalEl.textContent = fmtPrice(total);
    }

    /* ---------- 6. ONLINE DISCOUNT CODE VALIDATION & REMOVAL ---------- */
    async function validateDiscountOnline(code, isUserAction = true) {
        const input = qs('#checkoutDiscountInput');
        const btn = qs('#applyDiscountBtn');
        const msg = qs('#checkoutCouponMsg');

        if (!code) return;
        const cleanCode = code.trim().toUpperCase();

        if (btn) {
            btn.disabled = true;
            btn.textContent = '...';
        }

        try {
            const res = await fetch(`${API_BASE}/discounts/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: cleanCode, subtotal: state.subtotal })
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
                try { sessionStorage.setItem(COUPON_KEY, disc.code); } catch (e) { }

                if (input) input.value = disc.code;
                if (msg) {
                    msg.className = 'checkout-coupon-msg is-success';
                    msg.innerHTML = `✓ Code <strong>${disc.code}</strong> applied: ${state.appliedCoupon.label} <button type="button" id="removeDiscountBtn" style="margin-left: 6px; background: none; border: none; color: #b8332a; font-weight: 600; text-decoration: underline; cursor: pointer; font-size: 11px;">Remove</button>`;
                    const remBtn = qs('#removeDiscountBtn', msg);
                    if (remBtn) {
                        remBtn.addEventListener('click', () => removeCheckoutDiscount(true));
                    }
                }
                calculateTotals();
            } else {
                const errMsg = data.error?.message || `Coupon '${cleanCode}' is not eligible.`;
                if (msg) {
                    msg.className = 'checkout-coupon-msg is-error';
                    msg.textContent = errMsg;
                }
                if (state.appliedCoupon?.code === cleanCode) {
                    removeCheckoutDiscount(false);
                }
            }
        } catch (netErr) {
            console.warn('[Checkout] Coupon validation network error:', netErr);
            if (isUserAction && msg) {
                msg.className = 'checkout-coupon-msg is-error';
                msg.textContent = 'Unable to verify coupon online. Please check network connection.';
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Apply';
            }
        }
    }

    function removeCheckoutDiscount(showNotice = true) {
        state.appliedCoupon = null;
        try { sessionStorage.removeItem(COUPON_KEY); } catch (e) { }
        const input = qs('#checkoutDiscountInput');
        const msg = qs('#checkoutCouponMsg');
        if (input) input.value = '';
        if (msg) {
            if (showNotice) {
                msg.className = 'checkout-coupon-msg';
                msg.textContent = 'Coupon removed.';
                setTimeout(() => { if (msg && !state.appliedCoupon) msg.textContent = ''; }, 3000);
            } else {
                msg.textContent = '';
            }
        }
        calculateTotals();
    }

    function initDiscountHandler() {
        const input = qs('#checkoutDiscountInput');
        const btn = qs('#applyDiscountBtn');
        const msg = qs('#checkoutCouponMsg');

        if (!btn || !input) return;

        btn.addEventListener('click', () => {
            const code = input.value.trim().toUpperCase();

            if (!code) {
                if (msg) {
                    msg.className = 'checkout-coupon-msg is-error';
                    msg.textContent = 'Please enter a discount code';
                }
                return;
            }

            validateDiscountOnline(code, true);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    }

    /* ---------- 7. PAYMENT METHOD SWITCHER ---------- */
    function initPaymentMethodSwitcher() {
        const codRadio = qs('#paymentCOD');
        const cardRadio = qs('#paymentCard');
        const codOption = qs('#optionCOD');
        const cardOption = qs('#optionCard');
        const cardDetails = qs('#cardDetailsBlock');

        if (!codRadio || !cardRadio) return;

        function updatePaymentUI() {
            const isCard = cardRadio.checked;

            if (isCard) {
                cardOption?.classList.add('is-selected');
                codOption?.classList.remove('is-selected');
                if (cardDetails) cardDetails.style.display = 'block';
                state.selectedPaymentMethod = 'Credit/Debit Card';

                // Mark card detail fields required
                const cardInputs = cardDetails ? qsa('input', cardDetails) : [];
                cardInputs.forEach(inp => {
                    inp.required = true;
                });
            } else {
                codOption?.classList.add('is-selected');
                cardOption?.classList.remove('is-selected');
                if (cardDetails) cardDetails.style.display = 'none';
                state.selectedPaymentMethod = 'Cash on Delivery';

                // Remove required rule and clear errors on card detail fields
                const cardInputs = cardDetails ? qsa('input', cardDetails) : [];
                cardInputs.forEach(inp => {
                    inp.required = false;
                    clearFieldError(inp);
                });
            }
        }

        codRadio.addEventListener('change', updatePaymentUI);
        cardRadio.addEventListener('change', updatePaymentUI);

        // Header click delegates
        codOption?.querySelector('.payment-option__header')?.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                codRadio.checked = true;
                updatePaymentUI();
            }
        });

        cardOption?.querySelector('.payment-option__header')?.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                cardRadio.checked = true;
                updatePaymentUI();
            }
        });

        updatePaymentUI();
    }

    /* ---------- 8. SINGLE SHIPPING METHOD (PKR 250 / Free over 4999) ---------- */
    function initShippingMethod() {
        const shippingBox = qs('#shippingMethodBox');
        if (!shippingBox) return;

        // Ensure the single shipping option is rendered
        if (!qs('#shippingOptionsGroup', shippingBox)) {
            shippingBox.innerHTML = `
                <div class="shipping-options-group" id="shippingOptionsGroup">
                    <label class="shipping-option is-selected" id="shippingOptionStandard">
                        <div class="shipping-option__left">
                            <input type="radio" name="shippingMethodChoice" id="shippingMethodStandard" value="Standard Delivery" checked />
                            <div class="shipping-option__text">
                                <span class="shipping-option__title">Standard Delivery</span>
                                <span class="shipping-option__time">2 to 3 working days nationwide</span>
                            </div>
                        </div>
                        <span class="shipping-option__price" id="shippingMethodPrice">Rs. ${STANDARD_SHIPPING_FEE}.00</span>
                    </label>
                </div>
            `;
        }

        const standardRadio = qs('#shippingMethodStandard');
        if (standardRadio) {
            standardRadio.checked = true;
        }

        state.selectedShippingMethod = 'Standard Delivery';
        calculateTotals();
    }

    /* ---------- 9. REALTIME INPUT VALIDATION CLEARING ---------- */
    function initRealtimeInputValidation() {
        const form = qs('#checkoutForm');
        if (!form) return;

        form.addEventListener('input', (e) => {
            const target = e.target;
            if (target && target.matches('.form-input, .form-select')) {
                clearFieldError(target);
            }
        });
    }

    /* ---------- 10. FORM VALIDATION LOGIC ---------- */
    function validateForm() {
        let isValid = true;
        let firstInvalidField = null;

        function markInvalid(field, msg) {
            isValid = false;
            setFieldError(field, msg);
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }

        // 1. Email field
        const emailInput = qs('#checkoutEmail');
        const emailVal = emailInput ? emailInput.value.trim() : '';
        if (!emailVal) {
            markInvalid(emailInput, 'Email address is required.');
        } else if (!isValidEmail(emailVal)) {
            markInvalid(emailInput, 'Please enter a valid email address.');
        } else {
            clearFieldError(emailInput);
        }

        // 2. First name
        const firstNameInput = qs('#checkoutFirstName');
        if (!firstNameInput || !firstNameInput.value.trim()) {
            markInvalid(firstNameInput, 'First name is required.');
        } else {
            clearFieldError(firstNameInput);
        }

        // 3. Last name
        const lastNameInput = qs('#checkoutLastName');
        if (!lastNameInput || !lastNameInput.value.trim()) {
            markInvalid(lastNameInput, 'Last name is required.');
        } else {
            clearFieldError(lastNameInput);
        }

        // 4. Street address
        const addressInput = qs('#checkoutAddress');
        if (!addressInput || !addressInput.value.trim()) {
            markInvalid(addressInput, 'Street address is required.');
        } else {
            clearFieldError(addressInput);
        }

        // 5. City
        const cityInput = qs('#checkoutCity');
        if (!cityInput || !cityInput.value.trim()) {
            markInvalid(cityInput, 'City is required.');
        } else {
            clearFieldError(cityInput);
        }

        // 6. Mobile phone (Pakistani format check)
        const phoneInput = qs('#checkoutPhone');
        const phoneVal = phoneInput ? phoneInput.value.trim() : '';
        if (!phoneVal) {
            markInvalid(phoneInput, 'Mobile phone number is required.');
        } else if (!isValidPakistaniPhone(phoneVal)) {
            markInvalid(phoneInput, 'Please enter a valid Pakistani mobile number (e.g. 0300 1234567 or +923001234567).');
        } else {
            clearFieldError(phoneInput);
        }

        // 7. Card payment fields (only if Credit/Debit Card is selected)
        const isCardSelected = qs('#paymentCard')?.checked;
        if (isCardSelected) {
            const cardBlock = qs('#cardDetailsBlock');
            const numInput = cardBlock ? cardBlock.querySelector('input[placeholder*="Card number"]') : null;
            const expInput = cardBlock ? cardBlock.querySelector('input[placeholder*="MM / YY"]') : null;
            const cvvInput = cardBlock ? cardBlock.querySelector('input[placeholder*="CVV"]') : null;
            const nameInput = cardBlock ? cardBlock.querySelector('input[placeholder*="Name on card"]') : null;

            // Card number
            const cleanDigits = numInput ? numInput.value.replace(/\D/g, '') : '';
            if (!cleanDigits) {
                markInvalid(numInput, 'Card number is required.');
            } else if (cleanDigits.length < 15 || cleanDigits.length > 19) {
                markInvalid(numInput, 'Please enter a valid 16-digit card number.');
            } else {
                clearFieldError(numInput);
            }

            // Expiry MM / YY
            const expVal = expInput ? expInput.value.trim() : '';
            if (!expVal) {
                markInvalid(expInput, 'Expiry date is required.');
            } else if (!/^(0[1-9]|1[0-2])\s*\/?\s*([0-9]{2})$/.test(expVal)) {
                markInvalid(expInput, 'Enter valid MM / YY.');
            } else {
                clearFieldError(expInput);
            }

            // CVV
            const cvvClean = cvvInput ? cvvInput.value.replace(/\D/g, '') : '';
            if (!cvvClean) {
                markInvalid(cvvInput, 'CVV code is required.');
            } else if (cvvClean.length < 3 || cvvClean.length > 4) {
                markInvalid(cvvInput, 'Enter a 3 or 4-digit CVV.');
            } else {
                clearFieldError(cvvInput);
            }

            // Name on card
            if (!nameInput || !nameInput.value.trim()) {
                markInvalid(nameInput, 'Name on card is required.');
            } else {
                clearFieldError(nameInput);
            }
        }

        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    /* ---------- 11. CHECKOUT FORM SUBMISSION & SUCCESS MODAL ---------- */
    function initCheckoutForm() {
        const form = qs('#checkoutForm');
        const completeBtn = qs('#completeOrderBtn');
        const modal = qs('#orderSuccessModal');
        const modalRef = qs('#orderSuccessRef');
        const modalCustomer = qs('#orderSuccessCustomer');
        const modalAddress = qs('#orderSuccessAddress');
        const modalTotal = qs('#orderSuccessTotal');
        const errorBanner = qs('#checkoutOrderError');

        if (!form || !completeBtn) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (errorBanner) {
                errorBanner.style.display = 'none';
                errorBanner.textContent = '';
            }

            // 1. Validate form fields
            if (!validateForm()) {
                return;
            }

            // 2. Validate cart has items
            if (!state.items || state.items.length === 0) {
                if (errorBanner) {
                    errorBanner.style.display = 'block';
                    errorBanner.textContent = 'Your cart is empty. Please add items before completing checkout.';
                    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            if (completeBtn.disabled) return;

            // 3. Show processing state
            const originalBtnHTML = completeBtn.innerHTML;
            completeBtn.disabled = true;
            completeBtn.innerHTML = `
                <span class="btn-spinner" aria-hidden="true"></span>
                <span>Placing order...</span>
            `;

            // Extract customer and address details
            const firstName = qs('#checkoutFirstName')?.value.trim() || '';
            const lastName = qs('#checkoutLastName')?.value.trim() || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const email = qs('#checkoutEmail')?.value.trim() || '';
            const phone = qs('#checkoutPhone')?.value.trim() || '';

            const street = qs('#checkoutAddress')?.value.trim() || '';
            const apartment = qs('#checkoutApartment')?.value.trim() || '';
            const city = qs('#checkoutCity')?.value.trim() || '';
            const postal = qs('#checkoutPostal')?.value.trim() || '';

            const addressParts = [street, apartment, city, postal, 'Pakistan'].filter(Boolean);
            const fullDeliveryAddress = addressParts.join(', ');

            // Construct payload according to backend createStorefrontOrder contract
            // const orderPayload = {
            //     customer: {
            //         firstName,
            //         lastName,
            //         email,
            //         phone
            //     },
            //     shippingAddress: {
            //         street,
            //         apartment,
            //         city,
            //         postalCode: postal,
            //         country: 'Pakistan'
            //     },
            //     paymentMethod: state.selectedPaymentMethod,
            //     couponCode: state.appliedCoupon ? state.appliedCoupon.code : null,
            //     items: state.items.map(item => ({
            //         id: item.id,
            //         productId: item.productId || item.id,
            //         name: item.name,
            //         price: Number(item.price) || 0,
            //         qty: Number(item.qty) || 1,
            //         color: item.color || null,
            //         size: item.size || null,
            //         image: item.image || null
            //     })),
            //     notes: ''
            // };
            // Construct payload according to backend createStorefrontOrder contract
            const orderPayload = {
                shippingName: fullName,
                shippingPhone: phone,
                shippingAddress: fullDeliveryAddress,
                shippingCity: city,
                shippingPostalCode: postal,
                shippingCountry: 'Pakistan',
                email: email,
                customerEmail: email,
                customerName: fullName,
                paymentMethod: state.selectedPaymentMethod,
                couponCode: state.appliedCoupon ? state.appliedCoupon.code : null,
                items: state.items.map(item => ({
                    id: item.id,
                    productId: item.productId || item.id,
                    name: item.name,
                    price: Number(item.price) || 0,
                    qty: Number(item.qty) || 1,
                    color: item.color || null,
                    size: item.size || null,
                    image: item.image || null
                })),
                notes: ''
            };
            try {
                const headers = { 'Content-Type': 'application/json' };
                const token = window.ShaanwearAuth && typeof window.ShaanwearAuth.getToken === 'function'
                    ? window.ShaanwearAuth.getToken()
                    : (localStorage.getItem('shaanwear_access_token') || localStorage.getItem('shaanwear_token'));
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(orderPayload)
                });

                const data = await response.json();

                if (response.ok && data.success && data.data?.order) {
                    const verifiedOrder = data.data.order;
                    const orderReference = verifiedOrder.orderNumber;
                    const rawTotal = (verifiedOrder.totalAmount != null && !isNaN(Number(verifiedOrder.totalAmount)))
                        ? Number(verifiedOrder.totalAmount)
                        : ((verifiedOrder.total != null && !isNaN(Number(verifiedOrder.total)))
                            ? Number(verifiedOrder.total)
                            : (state.subtotal + state.selectedShippingRate - state.discount));
                    const liveTotal = fmtPrice(rawTotal);

                    // 5. Populate confirmation modal with authoritative server values
                    if (modalRef) modalRef.textContent = orderReference;
                    if (modalCustomer) modalCustomer.textContent = fullName;
                    if (modalAddress) modalAddress.textContent = fullDeliveryAddress;
                    if (modalTotal) modalTotal.textContent = liveTotal;

                    // Save completed order record to localStorage
                    const orderRecord = {
                        orderId: orderReference,
                        orderNumber: orderReference,
                        date: verifiedOrder.createdAt || new Date().toISOString(),
                        customer: fullName,
                        address: fullDeliveryAddress,
                        total: liveTotal,
                        totalAmount: rawTotal,
                        shippingMethod: state.selectedShippingMethod,
                        paymentMethod: state.selectedPaymentMethod,
                        items: verifiedOrder.items || [...state.items]
                    };

                    try {
                        localStorage.setItem(ORDER_KEY, JSON.stringify(orderRecord));
                    } catch (err) {
                        console.error('[Checkout] Error saving order record:', err);
                    }

                    // Handle "Save this information for next time"
                    const saveCheckbox = qs('#checkoutSaveInfo');
                    if (saveCheckbox && saveCheckbox.checked) {
                        const checkoutInfo = {
                            email,
                            firstName,
                            lastName,
                            phone,
                            address: street,
                            apartment,
                            city,
                            postalCode: postal,
                            marketing: qs('#checkoutMarketing')?.checked ?? true
                        };
                        try {
                            localStorage.setItem(SAVED_INFO_KEY, JSON.stringify(checkoutInfo));
                        } catch (_) {}

                        // If authenticated, persist to address book in database
                        if (token && street && city && phone) {
                            fetch(`${API_BASE}/customer/addresses`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    name: fullName || 'Recipient',
                                    phone: phone,
                                    address: apartment ? `${street}, ${apartment}` : street,
                                    city: city,
                                    province: 'Punjab',
                                    postalCode: postal || '',
                                    isDefault: true
                                })
                            }).catch(err => console.warn('[Save address error]:', err.message));
                        }
                    } else if (saveCheckbox && !saveCheckbox.checked) {
                        try {
                            localStorage.removeItem(SAVED_INFO_KEY);
                        } catch (_) {}
                    }

                    // 6. Open confirmation modal
                    if (modal) {
                        modal.classList.add('is-active');
                    }

                    // 7. Clear shopping cart only on confirmed success
                    clearStoredCart();
                    state.items = [];
                    state.appliedCoupon = null;
                    try { sessionStorage.removeItem(COUPON_KEY); } catch (e) { }
                    resetSummaryDisplay();

                } else {
                    // Server rejection (e.g. invalid coupon, out of stock, validation failure)
                    // Cart remains safe in localStorage
                    const errMessage = data.error?.message || 'We were unable to place your order. Please review your information and try again.';
                    if (errorBanner) {
                        errorBanner.style.display = 'block';
                        errorBanner.textContent = `Order Error: ${errMessage}`;
                        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } catch (networkErr) {
                console.error('[Checkout] Network error placing order:', networkErr);
                if (errorBanner) {
                    errorBanner.style.display = 'block';
                    errorBanner.textContent = 'Connection error: Unable to reach the checkout server. Please ensure your network is connected and try again.';
                    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } finally {
                completeBtn.disabled = false;
                completeBtn.innerHTML = originalBtnHTML;
            }
        });
    }

    /* ---------- 11b. "SAVE THIS INFORMATION FOR NEXT TIME" HANDLER ---------- */
    function restoreSavedCheckoutInfo() {
        const checkbox = qs('#checkoutSaveInfo');
        try {
            const raw = localStorage.getItem(SAVED_INFO_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data) return;

            if (checkbox) checkbox.checked = true;

            const emailInput = qs('#checkoutEmail');
            if (emailInput && data.email && !emailInput.value.trim()) emailInput.value = data.email;

            const fnInput = qs('#checkoutFirstName');
            if (fnInput && data.firstName && !fnInput.value.trim()) fnInput.value = data.firstName;

            const lnInput = qs('#checkoutLastName');
            if (lnInput && data.lastName && !lnInput.value.trim()) lnInput.value = data.lastName;

            const phoneInput = qs('#checkoutPhone');
            if (phoneInput && data.phone && !phoneInput.value.trim()) phoneInput.value = data.phone;

            const addrInput = qs('#checkoutAddress');
            if (addrInput && data.address && !addrInput.value.trim()) addrInput.value = data.address;

            const aptInput = qs('#checkoutApartment');
            if (aptInput && data.apartment && !aptInput.value.trim()) aptInput.value = data.apartment;

            const cityInput = qs('#checkoutCity');
            if (cityInput && data.city && !cityInput.value.trim()) cityInput.value = data.city;

            const postalInput = qs('#checkoutPostal');
            if (postalInput && data.postalCode && !postalInput.value.trim()) postalInput.value = data.postalCode;

            const mktCheckbox = qs('#checkoutMarketing');
            if (mktCheckbox && typeof data.marketing === 'boolean') mktCheckbox.checked = data.marketing;
        } catch (e) {
            console.warn('[Checkout] Error restoring saved checkout info:', e);
        }
    }

    function initSaveInfoHandler() {
        const checkbox = qs('#checkoutSaveInfo');
        if (!checkbox) return;

        function persistIfChecked() {
            if (!checkbox.checked) {
                try { localStorage.removeItem(SAVED_INFO_KEY); } catch (_) {}
                return;
            }
            const data = {
                email: qs('#checkoutEmail')?.value.trim() || '',
                firstName: qs('#checkoutFirstName')?.value.trim() || '',
                lastName: qs('#checkoutLastName')?.value.trim() || '',
                phone: qs('#checkoutPhone')?.value.trim() || '',
                address: qs('#checkoutAddress')?.value.trim() || '',
                apartment: qs('#checkoutApartment')?.value.trim() || '',
                city: qs('#checkoutCity')?.value.trim() || '',
                postalCode: qs('#checkoutPostal')?.value.trim() || '',
                marketing: qs('#checkoutMarketing')?.checked ?? true
            };
            if (data.email || data.firstName || data.address || data.phone) {
                try {
                    localStorage.setItem(SAVED_INFO_KEY, JSON.stringify(data));
                } catch (_) {}
            }
        }

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                persistIfChecked();
            } else {
                try { localStorage.removeItem(SAVED_INFO_KEY); } catch (_) {}
            }
        });

        // Auto-save on blur/change of any delivery input
        const inputSelectors = [
            '#checkoutEmail', '#checkoutFirstName', '#checkoutLastName',
            '#checkoutAddress', '#checkoutApartment', '#checkoutCity',
            '#checkoutPostal', '#checkoutPhone'
        ];
        inputSelectors.forEach(sel => {
            const input = qs(sel);
            if (input) {
                input.addEventListener('blur', persistIfChecked);
                input.addEventListener('change', persistIfChecked);
            }
        });
    }

    /* ---------- 11c. CUSTOMER AUTHENTICATION & AUTO-FILL INTEGRATION ---------- */
    async function autoFillCustomerDetails() {
        const token = window.ShaanwearAuth && typeof window.ShaanwearAuth.getToken === 'function'
            ? window.ShaanwearAuth.getToken()
            : (localStorage.getItem('shaanwear_access_token') || localStorage.getItem('shaanwear_token'));

        const isAuth = window.ShaanwearAuth && typeof window.ShaanwearAuth.isAuthenticated === 'function'
            ? window.ShaanwearAuth.isAuthenticated()
            : Boolean(token);

        const statusEl = qs('#checkoutUserStatus') || qs('.checkout-section__login-link');

        if (!isAuth || !token) {
            if (statusEl) {
                statusEl.innerHTML = `Already have an account? <a href="#" id="checkoutLoginLink">Log in</a>`;
                const link = qs('#checkoutLoginLink', statusEl);
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const modal = qs('#checkoutLoginModal');
                        if (modal) {
                            modal.hidden = false;
                            modal.classList.add('is-active');
                        }
                    });
                }
            }
            return;
        }

        // Authenticated customer: fetch fresh profile & saved addresses
        let user = null;
        try {
            const raw = localStorage.getItem('shaanwear_user');
            if (raw) user = JSON.parse(raw);
        } catch (_) {}

        let defaultAddress = null;
        try {
            const [profileRes, addressesRes] = await Promise.allSettled([
                fetch(`${API_BASE}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                }),
                fetch(`${API_BASE}/customer/addresses`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                })
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
                const pData = await profileRes.value.json();
                if (pData.data?.user) {
                    user = pData.data.user;
                    localStorage.setItem('shaanwear_user', JSON.stringify(user));
                }
            }

            if (addressesRes.status === 'fulfilled' && addressesRes.value.ok) {
                const aData = await addressesRes.value.json();
                const addresses = aData.data?.addresses || [];
                if (addresses.length > 0) {
                    defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
                }
            }
        } catch (fetchErr) {
            console.warn('[Checkout Auto-Fill Warning]:', fetchErr.message);
        }

        // Update login header area to show logged in state with user email and logout button
        if (statusEl && user) {
            statusEl.innerHTML = `
                <span class="checkout-user-status">
                    Logged in as <strong>${user.email}</strong> · <button type="button" class="checkout-logout-btn" id="checkoutLogoutBtn">Log out</button>
                </span>
            `;
            const logoutBtn = qs('#checkoutLogoutBtn', statusEl);
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.ShaanwearAuth && typeof window.ShaanwearAuth.clearSession === 'function') {
                        window.ShaanwearAuth.clearSession();
                    } else {
                        localStorage.removeItem('shaanwear_access_token');
                        localStorage.removeItem('shaanwear_token');
                        localStorage.removeItem('shaanwear_user');
                    }
                    // Reset fields
                    ['#checkoutEmail', '#checkoutFirstName', '#checkoutLastName', '#checkoutAddress', '#checkoutApartment', '#checkoutCity', '#checkoutPostal', '#checkoutPhone'].forEach(sel => {
                        const el = qs(sel);
                        if (el) el.value = '';
                    });
                    autoFillCustomerDetails();
                });
            }
        }

        // 1. Fill Email
        const emailInput = qs('#checkoutEmail');
        if (emailInput && user?.email && !emailInput.value.trim()) {
            emailInput.value = user.email;
        }

        // 2. Resolve Name
        const fullName = defaultAddress?.name || user?.name || '';
        if (fullName) {
            const parts = fullName.trim().split(/\s+/);
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';

            const fnInput = qs('#checkoutFirstName');
            const lnInput = qs('#checkoutLastName');
            if (fnInput && !fnInput.value.trim()) fnInput.value = firstName;
            if (lnInput && !lnInput.value.trim()) lnInput.value = lastName;
        }

        // 3. Resolve Phone
        const phone = defaultAddress?.phone || user?.phone || '';
        const phoneInput = qs('#checkoutPhone');
        if (phoneInput && phone && !phoneInput.value.trim()) {
            phoneInput.value = phone;
        }

        // 4. Resolve Address fields if available
        if (defaultAddress) {
            const addressInput = qs('#checkoutAddress');
            if (addressInput && defaultAddress.address && !addressInput.value.trim()) {
                addressInput.value = defaultAddress.address;
            }

            const cityInput = qs('#checkoutCity');
            if (cityInput && defaultAddress.city && !cityInput.value.trim()) {
                cityInput.value = defaultAddress.city;
            }

            const postalInput = qs('#checkoutPostal');
            if (postalInput && defaultAddress.postalCode && !postalInput.value.trim()) {
                postalInput.value = defaultAddress.postalCode;
            }
        }
    }

    function initCustomerAuthIntegration() {
        const modal = qs('#checkoutLoginModal');
        const modalClose = qs('#checkoutLoginClose');
        const modalGuest = qs('#checkoutLoginGuestBtn');
        const loginForm = qs('#checkoutQuickLoginForm');
        const alertEl = qs('#checkoutLoginAlert');
        const emailInput = qs('#checkoutEmail');

        function openLoginModal(e) {
            if (e) e.preventDefault();
            if (!modal) return;
            const modalEmail = qs('#checkoutModalEmail');
            if (modalEmail && emailInput && emailInput.value.trim() && !modalEmail.value) {
                modalEmail.value = emailInput.value.trim();
            }
            if (alertEl) {
                alertEl.hidden = true;
                alertEl.textContent = '';
            }
            modal.hidden = false;
            modal.classList.add('is-active');
            const passInput = qs('#checkoutModalPassword');
            if (modalEmail && !modalEmail.value) {
                modalEmail.focus();
            } else if (passInput) {
                passInput.focus();
            }
        }

        function closeLoginModal() {
            if (!modal) return;
            modal.classList.remove('is-active');
            modal.hidden = true;
        }

        // Event delegation for opening login modal from any login link
        document.addEventListener('click', (e) => {
            const link = e.target.closest('#checkoutLoginLink, .checkout-section__login-link a');
            if (link && !link.id?.includes('Logout')) {
                openLoginModal(e);
            }
        });

        if (modalClose) modalClose.addEventListener('click', closeLoginModal);
        if (modalGuest) modalGuest.addEventListener('click', closeLoginModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeLoginModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
                closeLoginModal();
            }
        });

        // Form submit on Login Modal
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailVal = qs('#checkoutModalEmail')?.value.trim();
                const passwordVal = qs('#checkoutModalPassword')?.value;
                const submitBtn = qs('#checkoutLoginSubmitBtn');

                if (!emailVal || !passwordVal) {
                    if (alertEl) {
                        alertEl.hidden = false;
                        alertEl.textContent = 'Please enter both your email address and password.';
                    }
                    return;
                }

                try {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span>SIGNING IN...</span>';
                    }
                    if (alertEl) alertEl.hidden = true;

                    if (window.ShaanwearAuth && typeof window.ShaanwearAuth.login === 'function') {
                        await window.ShaanwearAuth.login(emailVal, passwordVal);
                    } else {
                        const res = await fetch(`${API_BASE}/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: emailVal, password: passwordVal })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error?.message || data.message || 'Login failed.');
                        if (data.data?.accessToken || data.data?.token) {
                            localStorage.setItem('shaanwear_access_token', data.data.accessToken || data.data.token);
                            localStorage.setItem('shaanwear_token', data.data.accessToken || data.data.token);
                        }
                        if (data.data?.user) {
                            localStorage.setItem('shaanwear_user', JSON.stringify(data.data.user));
                        }
                    }

                    closeLoginModal();
                    await autoFillCustomerDetails();
                } catch (err) {
                    if (alertEl) {
                        alertEl.hidden = false;
                        alertEl.textContent = err.message || 'Invalid email or password.';
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>SIGN IN</span>';
                    }
                }
            });
        }

        // Run auto-fill on initialization
        autoFillCustomerDetails();
    }

    /* ---------- 12. MODAL DISMISSAL LOGIC ---------- */
    /**
     * Modal can be closed by clicking the dark area outside the modal card
     * or by pressing the Escape key.
     * The Continue Shopping button navigates to the homepage.
     */
    function initModalDismissal() {
        const modal = qs('#orderSuccessModal');
        if (!modal) return;

        function closeModal() {
            modal.classList.remove('is-active');
        }

        // Backdrop click (clicking outside the modal card)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                closeModal();
            }
        });
    }

    /* ---------- 13. MOBILE SUMMARY ACCORDION TOGGLE ---------- */
    function initMobileSummaryToggle() {
        const toggleBtn = qs('#mobileSummaryToggle');
        const sidebar = qs('#checkoutSidebar');

        if (!toggleBtn || !sidebar) return;

        toggleBtn.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('is-open');
            toggleBtn.classList.toggle('is-open', isOpen);
            toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            const textSpan = qs('.mobile-summary-toggle__text', toggleBtn);
            if (textSpan) {
                textSpan.textContent = isOpen ? 'Hide order summary' : 'Show order summary';
            }
        });
    }

    // Auto initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
