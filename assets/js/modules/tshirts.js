/* =====================================================
   SHAANWEAR — CATEGORY & PRODUCT ENGINE
   Dynamic category rendering, backend API integration,
   Cloudinary image support, swatches, wishlist, and cart.
   ===================================================== */

(function () {
    'use strict';

    const SIZES = ['S', 'M', 'L', 'XL'];
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const HEART = 'M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l8.8 8.8 8.8-8.8a5.4 5.4 0 0 0 0-7.6z';

    /* ---------- STOREFRONT CATEGORIES CONFIGURATION ---------- */
    const CATEGORIES = [
        {
            key: 'sweatshirts',
            name: 'Sweatshirts',
            slugs: ['sweatshirts', 'sweats', 'sweatshirt'],
            sectionId: 'sweats',
            gridId: 'sweatsGrid',
            defaultPdpId: 101,
            defaultImage: 'assets/images/products/sweatshirts/premium-sweatshirt=03.jpg',
            alt: 'Model wearing a premium contemporary sweatshirt',
            backendId: null,
            backendSlug: null,
            backendImage: null
        },
        {
            key: 'jackets',
            name: 'Jackets',
            slugs: ['jackets', 'jacket', 'jackets-coats', 'jackets-and-coats'],
            sectionId: 'tshirts',
            gridId: 'tshirtsGrid',
            defaultPdpId: 1,
            defaultImage: 'assets/images/products/jackets/jacketcategory-01.jpg',
            alt: 'Model wearing a premium jacket',
            backendId: null,
            backendSlug: null,
            backendImage: null
        },
        {
            key: 'casual-shirts',
            name: 'Casual Shirts',
            slugs: ['casual-shirts', 'casualshirts', 'shirts', 'casual-shirt', 'casual_shirts'],
            sectionId: 'casualShirts',
            gridId: 'casualShirtsGrid',
            defaultPdpId: 301,
            defaultImage: 'assets/images/products/casual-shirts/classic-casual-shirt-01.jpg',
            alt: 'Model wearing a modern casual shirt',
            backendId: null,
            backendSlug: null,
            backendImage: null
        },
        {
            key: 'trousers',
            name: 'Trousers',
            slugs: ['trousers', 'trouser', 'pants'],
            sectionId: 'trousers',
            gridId: 'trousersGrid',
            defaultPdpId: 201,
            defaultImage: 'assets/images/products/trousers/slim-fit-trousers-01.jpg',
            alt: 'Model wearing modern tailored trousers',
            backendId: null,
            backendSlug: null,
            backendImage: null
        },
        {
            key: 'belts',
            name: 'Belts',
            slugs: ['belts', 'belt', 'leather-belts'],
            sectionId: 'belts',
            gridId: 'beltsGrid',
            defaultPdpId: 401,
            defaultImage: 'assets/images/products/belts/belts.jpeg',
            alt: 'Close-up of a premium handcrafted leather belt',
            backendId: null,
            backendSlug: null,
            backendImage: null
        }
    ];

    /* ---------- STATE (in-memory) ---------- */
    const wished = new Set();
    const fmt = (n) => 'PKR ' + Number(n || 0).toLocaleString('en-US');

    /* ---------- DOM UTILITIES ---------- */
    function el(tag, className, attrs) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
        return node;
    }

    function svg(paths, extraClass) {
        const s = document.createElementNS(SVG_NS, 'svg');
        s.setAttribute('viewBox', '0 0 24 24');
        s.setAttribute('aria-hidden', 'true');
        if (extraClass) s.setAttribute('class', extraClass);
        paths.forEach((d) => {
            const p = document.createElementNS(SVG_NS, 'path');
            p.setAttribute('d', d);
            s.appendChild(p);
        });
        return s;
    }

    /* ---------- SKELETON LOADING ---------- */
    function renderSkeletons() {
        CATEGORIES.forEach((cat) => {
            const grid = document.getElementById(cat.gridId);
            if (!grid) return;
            grid.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                const li = el('li', 'tshirt-skeleton');
                const media = el('div', 'tshirt-skeleton__media');
                const lines = el('div', 'tshirt-skeleton__lines');
                const l1 = el('div', 'tshirt-skeleton__line');
                const l2 = el('div', 'tshirt-skeleton__line tshirt-skeleton__line--short');
                lines.append(l1, l2);
                li.append(media, lines);
                grid.appendChild(li);
            }
        });
    }

    /* ---------- BACKEND PRODUCT ADAPTER ---------- */
    function adaptBackendProduct(bp, categoryName, categorySlug) {
        // Collect sorted Cloudinary / image URLs
        let imageUrls = [];
        if (Array.isArray(bp.images) && bp.images.length > 0) {
            const sorted = [...bp.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            imageUrls = sorted.map((img) => img.secureUrl || img.url).filter(Boolean);
        }

        const fallbackImg = 'assets/images/products/jackets/jacketcategory-01.jpg';
        const primaryImg = imageUrls[0] || fallbackImg;
        const secondaryImg = imageUrls[1] || primaryImg;

        // Extract variants for colors, sizes, and pricing
        const colors = [];
        const sizeSet = new Set();
        let minPrice = bp.basePrice ? parseFloat(bp.basePrice) : 0;

        if (Array.isArray(bp.variants) && bp.variants.length > 0) {
            const colorMap = new Map();
            bp.variants.forEach((v) => {
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

        const sizes = sizeSet.size > 0 ? Array.from(sizeSet) : SIZES;

        return {
            id: bp.id,
            backendId: bp.id,
            sku: bp.variants?.[0]?.sku || `SW-${bp.slug || 'PRD'}`,
            name: bp.name,
            slug: bp.slug,
            category: categoryName || bp.category?.name || 'Catalog',
            categorySlug: categorySlug || bp.category?.slug || '',
            categoryId: bp.categoryId,
            price: minPrice,
            oldPrice: null,
            tag: bp.status === 'PUBLISHED' ? 'NEW' : null,
            colors: colors,
            sizes: sizes,
            desc: bp.description ? bp.description.slice(0, 120) : '',
            primaryImg: primaryImg,
            secondaryImg: secondaryImg
        };
    }

    /* ---------- PRODUCT CARD BUILDER ---------- */
    function buildCard(p) {
        const state = { colorIdx: 0 };
        const first = (p.colors && p.colors[0]) || {
            name: 'Standard',
            front: p.primaryImg || 'assets/images/products/jackets/jacketcategory-01.jpg',
            back: p.secondaryImg || p.primaryImg || 'assets/images/products/jackets/jacketcategory-01.jpg'
        };

        const li = el('li');
        const card = el('article', 'tshirt-card has-back reveal');

        /* media */
        const media = el('div', 'tshirt-card__media');

        const frontSrc = first.front || (first.images && first.images[0]) || '';
        const backSrc = first.back || (first.images && first.images[1]) || frontSrc;

        const front = el('img', 'tshirt-card__img tshirt-card__img--front', {
            src: frontSrc,
            alt: p.name + ' in ' + (first.name || 'standard') + ', front view',
            loading: 'lazy',
            width: '800',
            height: '1000'
        });
        front.onerror = function () {
            this.onerror = null;
            this.src = 'assets/images/products/jackets/jacketcategory-01.jpg';
        };

        const back = el('img', 'tshirt-card__img tshirt-card__img--back', {
            src: backSrc,
            alt: p.name + ' in ' + (first.name || 'standard') + ', alternate view',
            loading: 'lazy',
            width: '800',
            height: '1000'
        });
        back.onerror = function () {
            this.onerror = null;
            this.src = front.src;
        };

        const link = el('a', 'tshirt-card__link', {
            href: 'product-detail.html?id=' + encodeURIComponent(p.id),
            'aria-label': 'View ' + p.name + ', ' + fmt(p.price)
        });

        media.append(front, back, link);

        if (p.tag) {
            const tag = el('span', 'tshirt-card__tag');
            tag.textContent = p.tag;
            media.appendChild(tag);
        }

        /* wishlist */
        const wish = el('button', 'tshirt-card__wish', {
            type: 'button',
            'aria-label': 'Add ' + p.name + ' to wishlist',
            'aria-pressed': wished.has(p.id) ? 'true' : 'false'
        });
        if (wished.has(p.id)) wish.classList.add('is-active');
        wish.appendChild(svg([HEART]));
        wish.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWish(p.id, wish, p.name);
        });
        media.appendChild(wish);

        /* quick add */
        const quickId = 'quick-' + String(p.id).replace(/[^a-zA-Z0-9_-]/g, '');
        const quick = el('div', 'tshirt-card__quick', { id: quickId, role: 'group', 'aria-label': 'Quick add ' + p.name });
        const label = el('button', 'tshirt-card__quick-label', { type: 'button', 'aria-label': 'Quick add ' + p.name });
        label.textContent = 'Quick Add';
        label.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(p, p.colors[state.colorIdx], 'M');
            card.classList.add('is-added');
            setTimeout(() => card.classList.remove('is-added'), 1400);
        });
        quick.appendChild(label);

        const cardSizes = p.sizes && p.sizes.length ? p.sizes : SIZES;
        cardSizes.forEach((size) => {
            const b = el('button', 'tshirt-card__size', {
                type: 'button',
                'aria-label': 'Add size ' + size + ' of ' + p.name + ' to bag'
            });
            b.textContent = size;
            b.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(p, p.colors[state.colorIdx], size);
                card.classList.add('is-added');
                setTimeout(() => card.classList.remove('is-added'), 1400);
                quick.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
            quick.appendChild(b);
        });
        media.appendChild(quick);

        const toggle = el('button', 'tshirt-card__quick-toggle', {
            type: 'button',
            'aria-label': 'Quick add ' + p.name,
            'aria-expanded': 'false',
            'aria-controls': quickId
        });
        toggle.appendChild(svg(['M12 5v14', 'M5 12h14']));
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(p, p.colors[state.colorIdx], 'M');
            card.classList.add('is-added');
            setTimeout(() => card.classList.remove('is-added'), 1400);
        });
        media.appendChild(toggle);

        /* info */
        const info = el('div', 'tshirt-card__info');

        const h3 = el('h3', 'tshirt-card__name');
        const nameLink = el('a', 'tshirt-card__name-link', {
            href: 'product-detail.html?id=' + encodeURIComponent(p.id)
        });
        nameLink.textContent = p.name;
        h3.appendChild(nameLink);

        const desc = el('p', 'tshirt-card__desc');
        desc.textContent = p.desc || '';

        const price = el('p', 'tshirt-card__price');
        const now = el('span', 'tshirt-card__price-now');
        now.textContent = fmt(p.price);
        price.appendChild(now);
        if (p.oldPrice && p.oldPrice > p.price) {
            const old = el('s', 'tshirt-card__price-old');
            old.textContent = fmt(p.oldPrice);
            price.appendChild(old);
        }

        const category = el('p', 'tshirt-card__category');
        category.textContent = (p.category || 'COLLECTION').toUpperCase();
        category.style.fontSize = '10px';
        category.style.color = 'var(--text-gray)';
        category.style.letterSpacing = '0.15em';
        category.style.textTransform = 'uppercase';
        category.style.marginBottom = '4px';

        info.append(category, h3, desc, price);
        card.append(media, info);
        li.appendChild(card);
        return li;
    }

    /* ---------- WISHLIST ---------- */
    function toggleWish(id, btn, name) {
        const on = !wished.has(id);
        if (on) wished.add(id); else wished.delete(id);
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + name + (on ? ' from wishlist' : ' to wishlist'));

        const badge = document.getElementById('wishCount');
        if (badge) {
            badge.textContent = wished.size;
            badge.hidden = wished.size === 0;
        }
    }

    /* ---------- CART (Synced with LocalStorage) ---------- */
    function getStoredCart() {
        try {
            const raw = localStorage.getItem('shaanwear_cart');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveStoredCart(items) {
        try {
            localStorage.setItem('shaanwear_cart', JSON.stringify(items));
        } catch (e) { }
    }

    function addToCart(p, color, size) {
        const colorName = (color && color.name) || 'Standard';
        const imgUrl = (color && (color.front || (color.images && color.images[0]))) || p.primaryImg || '';
        const stored = getStoredCart();
        const existing = stored.find(i => String(i.id) === String(p.id) && i.color === colorName && i.size === size);

        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            stored.push({
                id: p.id,
                name: p.name,
                price: p.price,
                color: colorName,
                size: size,
                item: '1 Piece',
                qty: 1,
                image: imgUrl
            });
        }
        saveStoredCart(stored);
        renderCart();

        const cartToggle = document.getElementById('cartToggle');
        const minicart = document.getElementById('minicart');
        if (minicart && minicart.hidden && cartToggle) {
            cartToggle.click();
        }
    }

    function renderCart() {
        const stored = getStoredCart();
        let total = 0;
        stored.forEach((i) => { total += (i.qty || 1); });

        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = total;
            badge.hidden = total === 0;
        }

        const body = document.querySelector('#minicart .minicart__body');
        const subtotalEl = document.getElementById('minicartSubtotal');
        const subtotalRow = document.getElementById('minicartSubtotalRow');
        const actionsWrap = document.querySelector('#minicartFoot .minicart__actions') || document.querySelector('.minicart__actions');

        if (!body) return;
        body.textContent = '';

        if (!stored.length) {
            const empty = el('p', 'minicart__empty');
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

        stored.forEach((i) => {
            const lineTotal = (i.price || 0) * (i.qty || 1);
            subtotal += lineTotal;

            const row = el('div', 'minicart-item');
            const img = el('img', 'minicart-item__img', {
                src: i.image || '',
                alt: i.name || 'Product',
                loading: 'lazy'
            });
            img.onerror = function () {
                this.onerror = null;
                this.src = 'assets/images/products/jackets/jacketcategory-01.jpg';
            };

            const txt = el('div');
            const n = el('p', 'minicart-item__name');
            n.textContent = i.name;
            const m = el('p', 'minicart-item__meta');
            m.textContent = (i.color || 'Standard') + ' / ' + i.size + ' / Qty ' + i.qty;
            const note = el('p', 'minicart-item__note');
            note.style.fontSize = '11px';
            note.style.color = '#b79a68';
            note.style.marginTop = '4px';
            note.style.lineHeight = '1.3';
            note.textContent = 'Note: This item is sourced as an export leftover/factory surplus.';
            const pr = el('p', 'minicart-item__price');
            pr.textContent = fmt(lineTotal);
            txt.append(n, m, note, pr);
            row.append(img, txt);
            body.appendChild(row);
        });

        if (subtotalEl) {
            subtotalEl.textContent = fmt(subtotal);
        }
    }

    /* ---------- REVEAL ANIMATIONS ---------- */
    function initReveal(root) {
        const targets = root.querySelectorAll('.reveal');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced || !('IntersectionObserver' in window)) {
            targets.forEach((t) => t.classList.add('is-visible'));
            return;
        }
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.12 });
        targets.forEach((t) => io.observe(t));
    }

    /* ---------- CATEGORY CAROUSEL SYNCHRONIZATION ---------- */
    function syncCategoryCarousel() {
        const track = document.getElementById('categoryCarouselTrack') || document.querySelector('[data-carousel-track]');
        if (!track) return;

        CATEGORIES.forEach((cat) => {
            const tile = track.querySelector(`.category-tile[data-category="${cat.key}"]`);
            if (!tile) return;

            const img = tile.querySelector('.category-tile__media img');
            const nameEl = tile.querySelector('.category-tile__name');

            // Category display name
            if (nameEl && cat.name) {
                nameEl.textContent = cat.name;
            }

            // Category image: prioritize backend image if available, else default verified image
            const targetSrc = cat.backendImage || cat.defaultImage;
            if (img && targetSrc) {
                if (img.getAttribute('src') !== targetSrc) {
                    img.src = targetSrc;
                }
                img.alt = cat.alt || `Shop ${cat.name}`;
                img.onerror = function () {
                    this.onerror = null;
                    this.src = cat.defaultImage;
                };
            }
        });
    }

    /* ---------- LOCAL CATALOG FALLBACK RENDERING ---------- */
    function renderLocalCatalog() {
        const catalog = window.SHAANWEAR_PRODUCTS || [];

        CATEGORIES.forEach((cat) => {
            const grid = document.getElementById(cat.gridId);
            const section = document.getElementById(cat.sectionId);
            if (!grid) return;

            grid.innerHTML = '';
            const frag = document.createDocumentFragment();

            const filtered = catalog.filter((p) => {
                const pSlug = (p.categorySlug || '').toLowerCase();
                const pCat = (p.category || '').toLowerCase();
                return cat.slugs.includes(pSlug) || cat.slugs.some(s => pCat.includes(s)) || pCat === cat.name.toLowerCase();
            });

            if (filtered.length > 0) {
                filtered.forEach((p, idx) => frag.appendChild(buildCard(p, idx)));
            } else {
                const empty = el('li', 'tshirts__empty');
                empty.textContent = 'No products currently available in this collection.';
                frag.appendChild(empty);
            }

            grid.appendChild(frag);
            if (section) initReveal(section);
        });

        syncCategoryCarousel();
    }

    /* ---------- API INTEGRATION & DATA HYDRATION ---------- */
    async function loadCatalogData() {
        const config = window.SHAANWEAR_CONFIG || {};
        const apiBase = config.apiUrl || 'https://shaan-wear-backend.vercel.app/api';

        // Render skeleton loading state initially
        renderSkeletons();

        let backendCategories = [];
        let backendProducts = [];
        let apiConnected = false;

        // 1. Fetch Categories via dedicated Public Catalog endpoint
        try {
            const catRes = await fetch(`${apiBase}/catalog/categories?limit=100`, {
                headers: { Accept: 'application/json' }
            });
            if (catRes.ok) {
                const catData = await catRes.json();
                if (catData && catData.success && catData.data && Array.isArray(catData.data.categories)) {
                    backendCategories = catData.data.categories;
                    console.log('[SHAANWEAR Public Catalog] Categories API returned', backendCategories.length, 'records');
                }
            } else {
                console.warn(`[SHAANWEAR Catalog] Categories endpoint returned HTTP ${catRes.status}.`);
            }
        } catch (err) {
            console.warn('[SHAANWEAR Catalog] Categories fetch error:', err.message || err);
        }

        // Map backend category records to storefront categories
        backendCategories.forEach((bCat) => {
            const bSlug = (bCat.slug || '').toLowerCase();
            const bName = (bCat.name || '').toLowerCase();

            const match = CATEGORIES.find((c) =>
                c.slugs.some((s) => bSlug.includes(s) || bName.includes(s))
            );

            if (match) {
                match.backendId = bCat.id;
                match.backendSlug = bCat.slug;
                // Preserve clean display name
                if (bCat.name && !/\d{8,}/.test(bCat.name)) {
                    match.name = bCat.name;
                }
                // Assigned category image from backend model takes precedence
                if (bCat.imageUrl || bCat.image || bCat.secureUrl) {
                    match.backendImage = bCat.imageUrl || bCat.image || bCat.secureUrl;
                }
            }
        });

        // 2. Fetch Products via dedicated Public Catalog endpoint
        try {
            const prodRes = await fetch(`${apiBase}/catalog/products?limit=100`, {
                headers: { Accept: 'application/json' }
            });
            if (prodRes.ok) {
                const prodData = await prodRes.json();
                if (prodData && prodData.success && prodData.data && Array.isArray(prodData.data.products)) {
                    backendProducts = prodData.data.products;
                    apiConnected = true;
                    console.log('[SHAANWEAR Public Catalog] Products API returned', backendProducts.length, 'published products');
                }
            } else {
                console.warn(`[SHAANWEAR Catalog] Products endpoint returned HTTP ${prodRes.status}.`);
            }
        } catch (err) {
            console.warn('[SHAANWEAR Catalog] Products fetch error:', err.message || err);
        }

        // 3. Render Results: Backend API vs Graceful Intentional Fallback
        if (apiConnected && backendProducts.length > 0) {
            // Group backend products by category
            CATEGORIES.forEach((cat) => {
                const grid = document.getElementById(cat.gridId);
                const section = document.getElementById(cat.sectionId);
                if (!grid) return;

                grid.innerHTML = '';
                const frag = document.createDocumentFragment();

                const matchedProducts = backendProducts.filter((bp) => {
                    if (cat.backendId && bp.categoryId === cat.backendId) return true;
                    const pCatSlug = (bp.category?.slug || '').toLowerCase();
                    const pCatName = (bp.category?.name || '').toLowerCase();
                    return cat.slugs.some((s) => pCatSlug.includes(s) || pCatName.includes(s));
                });

                if (matchedProducts.length > 0) {
                    matchedProducts.forEach((bp) => {
                        const adapted = adaptBackendProduct(bp, cat.name, cat.key);
                        frag.appendChild(buildCard(adapted));
                    });

                    // If category has no backend image, borrow the first product's primary Cloudinary image
                    if (!cat.backendImage && matchedProducts[0]?.images?.[0]?.secureUrl) {
                        cat.backendImage = matchedProducts[0].images[0].secureUrl;
                    }
                } else {
                    // Empty category state (strictly avoid mixing local hardcoded data with live backend data)
                    const empty = el('li', 'tshirts__empty');
                    empty.textContent = 'No products currently available in this collection.';
                    frag.appendChild(empty);
                }

                grid.appendChild(frag);
                if (section) initReveal(section);
            });

            syncCategoryCarousel();
        } else {
            // Either API is unauthenticated / unreachable, or database has 0 products
            console.log('[SHAANWEAR Catalog] Utilizing verified catalog data for storefront display.');
            renderLocalCatalog();
        }

        // Sync stored cart
        renderCart();
    }

    /* ---------- BOOTSTRAP ---------- */
    function init() {
        loadCatalogData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
