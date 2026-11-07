/* =====================================================
   SHAANWEAR — PRODUCT DETAIL PAGE CONTROLLER
   Full dynamic PDP engine: Gallery, Swatches, Tabs, Cart,
   Recommendations, and Recently Viewed.
   ===================================================== */

(function () {
    'use strict';

    // Helper shortcuts
    const qs = (sel, parent = document) => parent.querySelector(sel);
    const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];
    const fmtPrice = (num) => 'PKR ' + Number(num || 0).toLocaleString('en-US');

    /* ---------- STATE ---------- */
    const state = {
        product: null,
        activeColorIdx: 0,
        activeImageIdx: 0,
        selectedSize: 'M',
        selectedItem: null,
        quantity: 1
    };

    /* ---------- 1. DATA INITIALIZATION ---------- */
    function getQueryParam(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    async function initProductData() {
        const catalog = window.SHAANWEAR_PRODUCTS || [];
        const rawId = getQueryParam('id');
        let product = null;

        if (rawId) {
            const numId = parseInt(rawId, 10);
            product = catalog.find(p => p.id === numId || String(p.id) === String(rawId));

            // If not found in local products list, attempt public catalog endpoint lookup
            if (!product) {
                try {
                    const config = window.SHAANWEAR_CONFIG || {};
                    const apiBase = config.apiUrl || 'https://shaan-wear-backend.vercel.app/api';
                    const res = await fetch(`${apiBase}/catalog/products/${encodeURIComponent(rawId)}`, {
                        headers: { Accept: 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.success && data.data && data.data.product) {
                            const bp = data.data.product;
                            const imageUrls = (bp.images || [])
                                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                .map(img => img.secureUrl || img.url)
                                .filter(Boolean);
                            const fallbackImg = 'assets/images/products/jackets/jacketcategory-01.jpg';
                            const primaryImg = imageUrls[0] || fallbackImg;
                            const secondaryImg = imageUrls[1] || primaryImg;

                            const colors = [];
                            const sizeSet = new Set();
                            let minPrice = bp.basePrice ? parseFloat(bp.basePrice) : 0;

                            if (Array.isArray(bp.variants) && bp.variants.length > 0) {
                                const colorMap = new Map();
                                bp.variants.forEach(v => {
                                    if (v.size) sizeSet.add(v.size);
                                    if (v.price && (!minPrice || parseFloat(v.price) < minPrice)) {
                                        minPrice = parseFloat(v.price);
                                    }
                                    const cName = v.color || 'Standard';
                                    if (!colorMap.has(cName)) {
                                        colorMap.set(cName, {
                                            name: cName,
                                            hex: v.colorHex || '#111111',
                                            images: imageUrls.length ? imageUrls : [fallbackImg],
                                            front: primaryImg,
                                            back: secondaryImg
                                        });
                                    }
                                });
                                colors.push(...colorMap.values());
                            }

                            if (colors.length === 0) {
                                colors.push({
                                    name: 'Standard',
                                    hex: '#111111',
                                    images: imageUrls.length ? imageUrls : [fallbackImg],
                                    front: primaryImg,
                                    back: secondaryImg
                                });
                            }

                            product = {
                                id: bp.id,
                                name: bp.name,
                                category: (bp.category?.name || 'Catalog').toUpperCase(),
                                categorySlug: bp.category?.slug || '',
                                sku: bp.variants?.[0]?.sku || `SW-${bp.slug || 'PRD'}`,
                                price: minPrice,
                                oldPrice: null,
                                colors: colors,
                                sizes: sizeSet.size > 0 ? Array.from(sizeSet) : ['S', 'M', 'L', 'XL'],
                                description: bp.description || '',
                                details: bp.description || 'Premium export collection surplus.',
                                fabric: 'Premium Export-Standard Construction',
                                origin: 'Surplus Authentic Export Garment'
                            };
                        }
                    }
                } catch (err) {
                    console.warn('[PDP] Public catalog lookup failed, using fallback:', err.message || err);
                }
            }
        }

        if (!product) {
            state.product = null;
            return;
        }

        state.product = product;
        state.selectedItem = (product.items && product.items[0]) || product.itemType || null;
        state.selectedSize = (product.sizes && product.sizes[0]) || 'M';
        state.activeColorIdx = 0;
        state.activeImageIdx = 0;
        state.quantity = 1;

        console.log('[PDP] Active Product:', product.name, '(ID: ' + product.id + ')');
    }

    /* ---------- 2. POPULATE DOM ---------- */
    function populateDOM() {
        const p = state.product;
        if (!p) return;

        // Document Title
        document.title = p.name + ' — SHAANWEAR';

        // Breadcrumbs
        const breadcrumbCat = qs('#breadcrumbCat');
        const breadcrumbTitle = qs('#breadcrumbTitle');
        if (breadcrumbCat) breadcrumbCat.textContent = p.category;
        if (breadcrumbTitle) breadcrumbTitle.textContent = p.name;

        // Category Label
        const categoryLabel = qs('#categoryLabel');
        if (categoryLabel) categoryLabel.textContent = p.category;

        // Title
        const productTitle = qs('#productTitle');
        if (productTitle) productTitle.textContent = p.name;

        // Price
        const priceContainer = qs('#productPrice');
        if (priceContainer) {
            priceContainer.innerHTML = '';

            const currentPrice = document.createElement('span');
            currentPrice.className = 'product-detail__price';
            currentPrice.textContent = fmtPrice(p.price);
            priceContainer.appendChild(currentPrice);

            if (p.oldPrice && p.oldPrice > p.price) {
                const oldPrice = document.createElement('span');
                oldPrice.className = 'product-detail__price-old';
                oldPrice.textContent = fmtPrice(p.oldPrice);

                const discountPct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
                const tag = document.createElement('span');
                tag.className = 'product-detail__discount-tag';
                tag.textContent = 'SAVE ' + discountPct + '%';

                priceContainer.append(oldPrice, tag);
            }
        }

        // SKU and Stock
        const skuElement = qs('#productSKU');
        if (skuElement) {
            skuElement.innerHTML = `
                <span>SKU: <strong>${p.sku || 'SW-00' + p.id}</strong></span>
                <span>•</span>
                <span class="stock-indicator">In Stock (Surplus Inventory)</span>
            `;
        }

        // Gallery Tag Badge
        const galleryBadge = qs('#galleryBadge');
        if (galleryBadge) {
            if (p.tag) {
                galleryBadge.textContent = p.tag;
                galleryBadge.hidden = false;
            } else {
                galleryBadge.hidden = true;
            }
        }

        // Render Item Section (Hidden per user request)
        // renderItemSection();

        // Render Color Swatches
        renderColorSwatches();

        // Render Size Selector
        renderSizeSelector();

        // Render Description & Tabs
        renderTabsContent();

        // Initial Gallery Render
        updateGallery(0);

        // Update Cart Header Count
        updateCartHeaderCount();
    }

    /* ---------- 3. ITEM SELECTION (Hidden) ---------- */
    function renderItemSection() {
        const itemContainer = qs('#productItem');
        if (!itemContainer) return;
        itemContainer.style.display = 'none';
        itemContainer.innerHTML = '';
    }

    /* ---------- 4. COLOR SWATCHES ---------- */
    function renderColorSwatches() {
        const colorContainer = qs('#productColor');
        if (!colorContainer) return;

        const p = state.product;
        const colors = p.colors || [];
        const currentColor = colors[state.activeColorIdx] || { name: 'Standard' };

        colorContainer.innerHTML = `
            <div class="pdp-section-label">
                <span>Color: <span class="label-val" id="activeColorName">${currentColor.name}</span></span>
            </div>
            <div class="color-swatches" id="colorSwatches"></div>
        `;

        const swatchesWrap = qs('#colorSwatches', colorContainer);
        colors.forEach((col, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'color-swatch-btn' + (idx === state.activeColorIdx ? ' is-active' : '');
            btn.setAttribute('aria-label', 'Select color ' + col.name);
            btn.setAttribute('aria-selected', idx === state.activeColorIdx ? 'true' : 'false');
            btn.title = col.name;

            const fill = document.createElement('span');
            fill.className = 'swatch-fill';
            fill.style.backgroundColor = col.hex || '#333333';
            btn.appendChild(fill);

            btn.addEventListener('click', () => {
                if (state.activeColorIdx === idx) return;
                state.activeColorIdx = idx;
                state.activeImageIdx = 0;

                qsa('.color-swatch-btn', swatchesWrap).forEach(b => {
                    b.classList.remove('is-active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');

                const nameLabel = qs('#activeColorName');
                if (nameLabel) nameLabel.textContent = col.name;

                // Refresh gallery for this color
                updateGallery(0);
            });

            swatchesWrap.appendChild(btn);
        });
    }

    /* ---------- 5. SIZE SELECTOR ---------- */
    function renderSizeSelector() {
        const sizeContainer = qs('#productSize');
        if (!sizeContainer) return;

        const p = state.product;
        const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
        if (!sizes.includes(state.selectedSize)) {
            state.selectedSize = sizes[0];
        }

        sizeContainer.innerHTML = `
            <div class="pdp-section-label">
                <span>Size: <span class="label-val" id="activeSizeName">${state.selectedSize}</span></span>
                <button type="button" class="size-guide-btn" id="sizeGuideBtn">Size Guide</button>
            </div>
            <div class="size-buttons" id="sizeButtons"></div>
        `;

        const buttonsWrap = qs('#sizeButtons', sizeContainer);
        sizes.forEach((s) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'size-btn' + (s === state.selectedSize ? ' is-active' : '');
            btn.setAttribute('aria-label', 'Select size ' + s);
            btn.textContent = s;

            btn.addEventListener('click', () => {
                state.selectedSize = s;
                qsa('.size-btn', buttonsWrap).forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                const label = qs('#activeSizeName');
                if (label) label.textContent = s;
            });

            buttonsWrap.appendChild(btn);
        });

        // Size Guide click trigger
        const guideBtn = qs('#sizeGuideBtn', sizeContainer);
        if (guideBtn) {
            guideBtn.addEventListener('click', () => {
                // Switch to description tab and scroll to measurements
                const descTabBtn = qs('[data-tab="description"]');
                if (descTabBtn) descTabBtn.click();
                const itemsTable = qs('.pdp-items-included');
                if (itemsTable) {
                    itemsTable.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    itemsTable.style.outline = '2px solid var(--accent)';
                    setTimeout(() => { itemsTable.style.outline = 'none'; }, 1800);
                }
            });
        }
    }

    /* ---------- 6. GALLERY ENGINE ---------- */
    function getActiveImages() {
        const p = state.product;
        if (!p || !p.colors || !p.colors.length) return [];
        const currentColor = p.colors[state.activeColorIdx] || p.colors[0];
        return currentColor.images && currentColor.images.length ? currentColor.images : ['assets/images/products/sweatshirts/premium-sweatshirt=03.jpg'];
    }

    function updateGallery(newIndex) {
        const images = getActiveImages();
        if (!images.length) return;

        state.activeImageIdx = ((newIndex % images.length) + images.length) % images.length;
        const currentSrc = images[state.activeImageIdx];

        // Main Image Switch with smooth fade
        const mainImage = qs('#mainImage');
        if (mainImage) {
            mainImage.classList.add('fade-out');
            setTimeout(() => {
                mainImage.src = currentSrc;
                mainImage.alt = state.product.name + ' - Photo ' + (state.activeImageIdx + 1);
                mainImage.classList.remove('fade-out');
            }, 120);
        }

        // Counter
        const counter = qs('#galleryCounter');
        if (counter) {
            counter.textContent = (state.activeImageIdx + 1) + ' / ' + images.length;
        }

        // Rebuild or update thumbnails
        renderThumbnails(images);
    }

    function renderThumbnails(images) {
        const thumbsContainer = qs('#thumbsContainer');
        if (!thumbsContainer) return;

        thumbsContainer.innerHTML = '';
        images.forEach((src, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gallery__thumb-btn' + (idx === state.activeImageIdx ? ' is-active' : '');
            btn.setAttribute('aria-label', 'View photo ' + (idx + 1));

            const img = document.createElement('img');
            img.className = 'gallery__thumb-img';
            img.src = src;
            img.alt = 'Thumbnail ' + (idx + 1);
            img.loading = 'lazy';

            btn.appendChild(img);
            btn.addEventListener('click', () => {
                if (state.activeImageIdx === idx) return;
                updateGallery(idx);
            });

            thumbsContainer.appendChild(btn);
        });
    }

    function initGalleryNavigation() {
        const prevBtn = qs('#galleryPrev');
        const nextBtn = qs('#galleryNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateGallery(state.activeImageIdx - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateGallery(state.activeImageIdx + 1);
            });
        }
    }

    /* ---------- 7. QUANTITY SELECTOR ---------- */
    function initQuantityControls() {
        const minusBtn = qs('#qtyMinus');
        const plusBtn = qs('#qtyPlus');
        const qtyInput = qs('#qtyInput');

        if (!minusBtn || !plusBtn || !qtyInput) return;

        minusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val > 1) {
                val -= 1;
                qtyInput.value = val;
                state.quantity = val;
            }
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val < 10) {
                val += 1;
                qtyInput.value = val;
                state.quantity = val;
            }
        });

        qtyInput.addEventListener('change', () => {
            let val = parseInt(qtyInput.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 10) val = 10;
            qtyInput.value = val;
            state.quantity = val;
        });
    }

    /* ---------- 8. TABS CONTROLLER ---------- */
    function renderTabsContent() {
        const p = state.product;
        if (!p) return;

        // Description Tab
        const descTab = qs('#descriptionTab');
        if (descTab) {
            const itemsList = p.itemsIncluded || [
                { item: 'Shirt / Upper', fabric: '100% Pre-Shrunk Heavy Fleece (380 GSM)', measurement: 'Chest: 42" | Length: 28" | Sleeve: 25"' },
                { item: 'Shawl / Wrap', fabric: 'Blended Wool Thermal Brushed Soft Finish', measurement: 'Length: 90" (2.5 Metres) | Width: 42"' },
                { item: 'Trouser / Bottom', fabric: 'Pre-Shrunk Heavy Cotton French Terry with Drawstring', measurement: 'Waist: 32-36" | Length: 40.5" | Inseam: 30"' }
            ];

            let itemsHTML = itemsList.map(item => `
                <div class="pdp-item-row">
                    <div class="pdp-item-row__title">
                        <span>${item.item}</span>
                        <span style="font-size: 11px; color: var(--accent); letter-spacing: 0.05em;">INCLUDED</span>
                    </div>
                    <div class="pdp-item-row__fabric"><strong>Fabric:</strong> ${item.fabric}</div>
                    <div class="pdp-item-row__measure"><strong>Specs:</strong> ${item.measurement}</div>
                </div>
            `).join('');

            descTab.innerHTML = `
                <p class="pdp-desc__text">${p.description}</p>
                
            `;

        }

        // Disclaimer Tab
        const disclaimerTab = qs('#disclaimerTab');
        if (disclaimerTab) {
            disclaimerTab.innerHTML = `
                <div class="pdp-disclaimer-card">
                    <h4>Authenticity & Surplus Disclaimer</h4>
                    <p>At SHAANWEAR, we curate genuine export leftovers, overstock, and factory surplus garments sourced directly from verified wholesale manufacturing channels.</p>
                    <p><strong>Official Distributor Notice:</strong> SHAANWEAR is an independent surplus curator and is not an authorized representative, official agent, or licensee for third-party licensed brands. All brand trademarks and logos belong exclusively to their respective owners.</p>
                    <p><strong>Care Instructions:</strong> Machine wash cold with like colors inside out. Tumble dry on gentle cycle or hang dry to preserve fleece fiber integrity. Do not bleach. Warm iron if necessary.</p>
                </div>
            `;
        }
    }

    function initTabs() {
        const tabButtons = qsa('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                tabButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                const allPanels = qsa('.product-detail__tab-content');
                allPanels.forEach(panel => panel.classList.add('hidden'));

                const activePanel = qs('#' + targetTab + 'Tab');
                if (activePanel) {
                    activePanel.classList.remove('hidden');
                }
            });
        });
    }

    /* ---------- 9. ADD TO CART LOGIC ---------- */
    function getStoredCart() {
        try {
            const raw = localStorage.getItem('shaanwear_cart');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('[Cart] Parse error', e);
            return [];
        }
    }

    function saveStoredCart(cart) {
        try {
            localStorage.setItem('shaanwear_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('[Cart] Storage error', e);
        }
    }

    function updateCartHeaderCount() {
        const cart = getStoredCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        const countBadge = qs('#cartCount');
        if (countBadge) {
            countBadge.textContent = totalItems;
            countBadge.hidden = totalItems === 0;
        }
    }

    function renderMiniCartContent() {
        const body = qs('#minicart .minicart__body');
        if (!body) return;

        const cart = getStoredCart();
        const subtotalEl = qs('#minicartSubtotal');
        const subtotalRow = qs('#minicartSubtotalRow');
        const actionsWrap = qs('#minicartFoot .minicart__actions') || qs('.minicart__actions');

        body.innerHTML = '';

        if (!cart.length) {
            const empty = document.createElement('p');
            empty.className = 'minicart__empty';
            empty.textContent = 'Your bag is currently empty.';
            body.appendChild(empty);
            if (subtotalRow) subtotalRow.style.display = 'none';
            if (actionsWrap) actionsWrap.style.display = 'none';
            if (subtotalEl) subtotalEl.textContent = 'PKR 0';
            return;
        }

        if (subtotalRow) subtotalRow.style.display = '';
        if (actionsWrap) actionsWrap.style.display = '';

        let subtotal = 0;

        cart.forEach((item, index) => {
            const lineTotal = (item.price || 0) * (item.qty || 1);
            subtotal += lineTotal;

            const row = document.createElement('div');
            row.className = 'minicart-item';
            row.style.display = 'flex';
            row.style.gap = '14px';
            row.style.padding = '14px 0';
            row.style.borderBottom = '1px solid var(--border)';
            row.style.alignItems = 'center';

            row.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 2px; flex-shrink: 0;" />
                <div style="flex: 1; min-width: 0;">
                    <p style="font-size: 13.5px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</p>
                    <p style="font-size: 11.5px; color: var(--text-gray); margin-bottom: 4px;">${item.color} / ${item.size} / Qty: ${item.qty}</p>
                    <p style="font-size: 13px; font-weight: 700; color: var(--black);">${fmtPrice(lineTotal)}</p>
                </div>
                <button type="button" class="minicart-remove-btn" aria-label="Remove item" data-index="${index}" style="color: #999; font-size: 18px; padding: 4px; cursor: pointer; background: none; border: none;">&times;</button>
            `;

            body.appendChild(row);
        });

        if (subtotalEl) {
            subtotalEl.textContent = fmtPrice(subtotal);
        }

        // Remove button handlers
        qsa('.minicart-remove-btn', body).forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const currentCart = getStoredCart();
                currentCart.splice(idx, 1);
                saveStoredCart(currentCart);
                updateCartHeaderCount();
                renderMiniCartContent();
            });
        });
    }

    function showToast(msg) {
        let toast = qs('#pdpToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pdpToast';
            toast.className = 'pdp-toast';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            <span>${msg}</span>
        `;
        toast.classList.add('is-visible');

        setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 3200);
    }

    function initAddToCart() {
        const addBtn = qs('#addToCartBtn');
        if (!addBtn) return;

        addBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const p = state.product;
            const currentColor = (p.colors && p.colors[state.activeColorIdx]) || { name: 'Standard', images: [] };
            const currentImg = (currentColor.images && currentColor.images[0]) || 'assets/images/products/sweatshirts/premium-sweatshirt=03.jpg';

            const cartItem = {
                id: p.id,
                name: p.name,
                price: p.price,
                color: currentColor.name,
                size: state.selectedSize,
                qty: state.quantity,
                image: currentImg
            };
            if (state.selectedItem) {
                cartItem.item = state.selectedItem;
            }

            // Log to console as specified
            console.log('Added to cart:', cartItem);

            // Save to localStorage
            const cart = getStoredCart();
            const existingIdx = cart.findIndex(i => i.id === cartItem.id && i.color === cartItem.color && i.size === cartItem.size);

            if (existingIdx > -1) {
                cart[existingIdx].qty += cartItem.qty;
            } else {
                cart.push(cartItem);
            }

            saveStoredCart(cart);
            updateCartHeaderCount();
            renderMiniCartContent();

            // Button visual feedback
            const originalText = addBtn.innerHTML;
            addBtn.classList.add('is-added');
            addBtn.innerHTML = `
                <svg viewBox="0 0 24 24" style="stroke: #fff;"><path d="M20 6L9 17l-5-5"/></svg>
                <span>ADDED TO BAG</span>
            `;

            setTimeout(() => {
                addBtn.classList.remove('is-added');
                addBtn.innerHTML = originalText;
            }, 1400);

            // Toast feedback
            showToast(`${cartItem.qty}× ${p.name} added to your bag`);

            // Open the Mini Cart Drawer
            const minicart = qs('#minicart');
            const backdrop = qs('#backdrop');
            const cartToggle = qs('#cartToggle');
            if (minicart && backdrop) {
                minicart.hidden = false;
                backdrop.hidden = false;
                if (cartToggle) cartToggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    /* ---------- 10. RECENTLY VIEWED PRODUCTS ---------- */
    const RECENT_KEY = 'shaanwear_recently_viewed';

    function trackRecentlyViewed() {
        if (!state.product) return;
        const currentId = state.product.id;

        try {
            let list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
            list = list.filter(id => id !== currentId);
            list.unshift(currentId);
            if (list.length > 12) list = list.slice(0, 12);
            localStorage.setItem(RECENT_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('[RecentlyViewed] Error saving', e);
        }
    }

    function renderRecentlyViewed() {
        const grid = qs('#recentlyGrid');
        if (!grid) return;

        const catalog = window.SHAANWEAR_PRODUCTS || [];
        let storedIds = [];
        try {
            storedIds = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        } catch (e) {
            storedIds = [];
        }

        // Filter out current product (only real backend products in catalog)
        const currentId = state.product ? state.product.id : null;
        const filteredIds = storedIds.filter(id => String(id) !== String(currentId));
        const itemsToRender = filteredIds
            .map(id => catalog.find(p => String(p.id) === String(id)))
            .filter(Boolean);

        grid.innerHTML = '';
        itemsToRender.slice(0, 4).forEach(item => {
            grid.appendChild(buildProductCard(item));
        });
    }

    /* ---------- 11. YOU MAY ALSO LIKE ---------- */
    function renderRelatedProducts() {
        const grid = qs('#relatedGrid');
        if (!grid) return;

        const catalog = window.SHAANWEAR_PRODUCTS || [];
        const related = (window.getRelatedProducts && window.getRelatedProducts(state.product, 4)) || catalog.slice(0, 4);

        grid.innerHTML = '';
        related.forEach(item => {
            grid.appendChild(buildProductCard(item));
        });
    }

    function buildProductCard(p) {
        const li = document.createElement('li');
        const firstColor = (p.colors && p.colors[0]) || { images: [] };
        const imgUrl = (firstColor.images && firstColor.images[0]) || 'assets/images/products/sweatshirts/premium-sweatshirt=03.jpg';

        li.innerHTML = `
            <article class="pdp-card">
                <div class="pdp-card__media">
                    <img class="pdp-card__img" src="${imgUrl}" alt="${p.name}" loading="lazy" />
                    <a href="product-detail.html?id=${p.id}" class="pdp-card__link" aria-label="View ${p.name}"></a>
                    ${p.tag ? `<span class="pdp-card__tag">${p.tag}</span>` : ''}
                </div>
                <div class="pdp-card__info">
                    <span class="pdp-card__category">${p.category}</span>
                    <h4 class="pdp-card__name">
                        <a href="product-detail.html?id=${p.id}">${p.name}</a>
                    </h4>
                    <div class="pdp-card__price-row">
                        <span class="pdp-card__price">${fmtPrice(p.price)}</span>
                        ${p.oldPrice ? `<span class="pdp-card__price-old">${fmtPrice(p.oldPrice)}</span>` : ''}
                    </div>
                </div>
            </article>
        `;

        return li;
    }

    /* ---------- INITIALIZATION ---------- */
    async function init() {
        await initProductData();
        populateDOM();
        initGalleryNavigation();
        initQuantityControls();
        initTabs();
        initAddToCart();
        trackRecentlyViewed();
        renderRecentlyViewed();
        renderRelatedProducts();
        renderMiniCartContent();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
