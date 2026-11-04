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

    const FREE_SHIPPING_THRESHOLD = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.freeShippingThreshold) || 4999;
    const STANDARD_SHIPPING_FEE = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.standardShippingFee) || 250;
    const API_BASE = (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.apiUrl) || 'http://localhost:5000/api';

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
            try { sessionStorage.removeItem(COUPON_KEY); } catch (e) {}
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
                try { sessionStorage.setItem(COUPON_KEY, disc.code); } catch (e) {}

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
        try { sessionStorage.removeItem(COUPON_KEY); } catch (e) {}
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
            const orderPayload = {
                customer: {
                    firstName,
                    lastName,
                    email,
                    phone
                },
                shippingAddress: {
                    street,
                    apartment,
                    city,
                    postalCode: postal,
                    country: 'Pakistan'
                },
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
                const response = await fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });

                const data = await response.json();

                if (response.ok && data.success && data.data?.order) {
                    const verifiedOrder = data.data.order;
                    const orderReference = verifiedOrder.orderNumber;
                    const liveTotal = fmtPrice(verifiedOrder.totalAmount);

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
                        totalAmount: verifiedOrder.totalAmount,
                        shippingMethod: state.selectedShippingMethod,
                        paymentMethod: state.selectedPaymentMethod,
                        items: verifiedOrder.items || [...state.items]
                    };

                    try {
                        localStorage.setItem(ORDER_KEY, JSON.stringify(orderRecord));
                    } catch (err) {
                        console.error('[Checkout] Error saving order record:', err);
                    }

                    // 6. Open confirmation modal
                    if (modal) {
                        modal.classList.add('is-active');
                    }

                    // 7. Clear shopping cart only on confirmed success
                    clearStoredCart();
                    state.items = [];
                    state.appliedCoupon = null;
                    try { sessionStorage.removeItem(COUPON_KEY); } catch (e) {}
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
