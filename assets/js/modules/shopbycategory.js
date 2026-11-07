/* =====================================================
   SHAANWEAR — SHOP BY CATEGORY (Dynamic & Infinite Carousel)
   
   Architecture:
   1. Initial state: Skeletons shimmer in the carousel track (no image flash).
   2. Backend hydration: tshirts.js fetches API and calls window.__renderCategoryCarousel(categories).
   3. Single-pass render: Real category tiles are injected with their final backend images.
   4. Auto-scroll engine: Clones generated, layout measured, continuous RAF scroll started.
   5. Fallback timer: If backend takes >4.5s or fails, default curated categories render safely.
   ===================================================== */

(function () {
    'use strict';

    /* ─── DEFAULT CURATED CATEGORIES CONFIGURATION ─────────── */
    const DEFAULT_CATEGORIES = [
        {
            key:          'sweatshirts',
            href:         'sweatshirts.html',
            label:        'Shop Sweatshirts',
            name:         'Sweatshirts',
            defaultImage: 'assets/images/products/sweatshirts/premium-sweatshirt=03.jpg',
            alt:          'Model wearing a premium contemporary sweatshirt'
        },
        {
            key:          'jackets',
            href:         'jackets.html',
            label:        'Shop Jackets',
            name:         'Jackets',
            defaultImage: 'assets/images/products/jackets/jacketcategory-01.jpg',
            alt:          'Model wearing a premium jacket'
        },
        {
            key:          'casual-shirts',
            href:         'casual-shirts.html',
            label:        'Shop Casual Shirts',
            name:         'Casual Shirts',
            defaultImage: 'assets/images/products/casual-shirts/classic-casual-shirt-01.jpg',
            alt:          'Model wearing a tailored casual shirt'
        },
        {
            key:          'trousers',
            href:         'trousers.html',
            label:        'Shop Trousers',
            name:         'Trousers',
            defaultImage: 'assets/images/products/trousers/slim-fit-trousers-01.jpg',
            alt:          'Model wearing modern tailored trousers'
        },
        {
            key:          'belts',
            href:         'belts.html',
            label:        'Shop Belts',
            name:         'Belts',
            defaultImage: 'assets/images/products/belts/belts.jpeg',
            alt:          'Close-up of a premium handcrafted leather belt'
        }
    ];

    /* ─── TIMING & SCROLL CONFIGURATION ────────────────────── */
    const CFG = {
        SCROLL_SPEED:       0.8,    // px per frame (~48px/s at 60fps)
        RESUME_DELAY:       3000,   // ms pause after manual interaction
        TOUCH_RESUME_DELAY: 2000,   // ms pause after mobile swipe/touch
        RESIZE_DEBOUNCE:    250,
        FALLBACK_TIMEOUT:   4500,   // ms to wait for backend before rendering defaults
        REVEAL_MARGIN:      '0px 0px -60px 0px',
        REVEAL_THRESHOLD:   0.12
    };

    /* ─── REVEAL ANIMATIONS ─────────────────────────────────── */
    function initReveal() {
        const targets = document.querySelectorAll('.shop-category .reveal');
        if (!targets.length) return;

        const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (noMotion || !('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                o.unobserve(entry.target);
            });
        }, { rootMargin: CFG.REVEAL_MARGIN, threshold: CFG.REVEAL_THRESHOLD });

        targets.forEach(el => obs.observe(el));
    }

    /* ─── SKELETON GENERATOR ─────────────────────────────────── */
    function renderSkeletons(track) {
        track.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 5; i++) {
            const skel = document.createElement('div');
            skel.className = 'category-tile category-tile--skeleton';

            const media = document.createElement('div');
            media.className = 'category-tile__media';

            const name = document.createElement('div');
            name.className = 'category-tile__name';

            skel.append(media, name);
            frag.appendChild(skel);
        }
        track.appendChild(frag);
    }

    /* ─── TILE FACTORY ────────────────────────────────────────── */
    function createTileElement(cat, index) {
        const a = document.createElement('a');
        const href = cat.href || (cat.key ? `${cat.key}.html` : '#');
        a.href = href;
        a.className = 'category-tile reveal is-visible';
        a.setAttribute('aria-label', cat.label || `Shop ${cat.name || 'Category'}`);
        if (cat.key) a.setAttribute('data-category', cat.key);
        a.style.setProperty('--reveal-delay', `${index * 60 + 40}ms`);

        const media = document.createElement('div');
        media.className = 'category-tile__media';

        const img = document.createElement('img');
        const imgSrc = cat.backendImage || cat.defaultImage || '';
        img.src = imgSrc;
        img.alt = cat.alt || `Shop ${cat.name || 'Category'}`;
        img.loading = 'lazy';
        img.onerror = function () {
            if (cat.defaultImage && this.src !== cat.defaultImage) {
                this.src = cat.defaultImage;
            } else {
                this.onerror = null;
            }
        };

        media.appendChild(img);

        const h3 = document.createElement('h3');
        h3.className = 'category-tile__name';
        h3.textContent = cat.name || '';

        a.append(media, h3);
        return a;
    }

    /* ─── CAROUSEL ENGINE ───────────────────────────────────── */
    function initCarousel() {
        const carousel = document.querySelector('[data-carousel]');
        if (!carousel) return;

        const track = carousel.querySelector('[data-carousel-track]');
        if (!track) return;

        const prevBtn  = carousel.querySelector('[data-carousel-prev]');
        const nextBtn  = carousel.querySelector('[data-carousel-next]');
        const dotsWrap = document.querySelector('[data-carousel-dots]');
        const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Render skeleton state immediately
        renderSkeletons(track);

        /* ── Carousel Engine State ── */
        let isPaused       = false;
        let rafId          = null;
        let resumeTimer    = null;
        let resizeTimer    = null;
        let originWidth    = 0;
        let isHydrated     = false;
        let fallbackTimer  = null;

        function getOriginals() {
            return Array.from(track.querySelectorAll('.category-tile:not(.category-tile--clone):not(.category-tile--skeleton)'));
        }

        function getGap() {
            const style = getComputedStyle(track);
            return parseFloat(style.columnGap || style.gap) || 0;
        }

        function getStep() {
            const originals = getOriginals();
            return (originals[0]?.offsetWidth ?? track.clientWidth * 0.8) + getGap();
        }

        /* ── Clones for seamless infinite looping ── */
        function buildClones() {
            track.querySelectorAll('.category-tile--clone').forEach(el => el.remove());

            const originals = getOriginals();
            originals.forEach(tile => {
                const clone = tile.cloneNode(true);
                clone.classList.add('category-tile--clone');
                clone.setAttribute('aria-hidden', 'true');
                clone.querySelectorAll('[href],[tabindex],button,input,select,textarea').forEach(el => {
                    el.setAttribute('tabindex', '-1');
                });
                track.appendChild(clone);
            });
        }

        function measureOriginWidth() {
            const originals = getOriginals();
            if (!originals.length) { originWidth = 0; return; }

            const clones = Array.from(track.querySelectorAll('.category-tile--clone'));
            if (clones.length > 0 && clones[0].offsetLeft > 0) {
                originWidth = clones[0].offsetLeft;
            } else {
                const gap = getGap();
                const n   = originals.length;
                originWidth = originals.reduce((s, t) => s + t.offsetWidth, 0) + gap * (n - 1);
            }
        }

        /* ── Auto-Scroll via requestAnimationFrame ── */
        function tick() {
            rafId = requestAnimationFrame(tick);

            if (isPaused || noMotion || document.hidden || !isHydrated) return;

            track.scrollLeft += CFG.SCROLL_SPEED;

            // Seamless loop reset when boundary is reached
            if (originWidth > 0 && track.scrollLeft >= originWidth) {
                track.scrollLeft -= originWidth;
            }

            syncDot();
        }

        function startAutoScroll() {
            if (rafId !== null || noMotion || !isHydrated) return;
            track.dataset.autoscrolling = '1';
            rafId = requestAnimationFrame(tick);
        }

        function stopAutoScroll() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            delete track.dataset.autoscrolling;
        }

        function pause() {
            isPaused = true;
            clearTimeout(resumeTimer);
            delete track.dataset.autoscrolling;
        }

        function resume(delay) {
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                isPaused = false;
                if (isHydrated) track.dataset.autoscrolling = '1';
            }, delay ?? CFG.RESUME_DELAY);
        }

        /* ── Manual Navigation ── */
        function safeLeft(val) {
            return Math.max(0, Math.min(originWidth > 0 ? originWidth - 1 : val, val));
        }

        function manualScrollTo(left) {
            track.scrollTo({ left: safeLeft(left), behavior: 'smooth' });
        }

        function goNext() {
            const step = getStep();
            const dest = track.scrollLeft + step >= originWidth ? 0 : track.scrollLeft + step;
            manualScrollTo(dest);
        }

        function goPrev() {
            const step = getStep();
            const dest = track.scrollLeft <= step / 2 ? Math.max(0, originWidth - step) : track.scrollLeft - step;
            manualScrollTo(dest);
        }

        function goToIndex(i) {
            manualScrollTo(i * getStep());
        }

        /* ── Dot Indicators ── */
        function buildDots() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';

            const originals = getOriginals();
            originals.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.setAttribute('role', 'button');
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === 0) dot.classList.add('is-active');

                const handler = () => { pause(); goToIndex(i); resume(); };
                dot.addEventListener('click', handler);
                dot.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
                });

                dotsWrap.appendChild(dot);
            });
        }

        function syncDot() {
            if (!dotsWrap || originWidth <= 0) return;
            const dots = dotsWrap.querySelectorAll('span');
            if (!dots.length) return;

            const step = getStep();
            const pos  = track.scrollLeft % (originWidth || 1);
            let   idx  = Math.round(pos / (step || 1));
            idx = Math.max(0, Math.min(getOriginals().length - 1, idx));

            dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }

        /* ── Full Rebuild (on resize or dynamic update) ── */
        function rebuild() {
            if (!isHydrated) return;
            const savedPos = originWidth > 0 ? track.scrollLeft % originWidth : 0;
            buildClones();
            measureOriginWidth();
            buildDots();
            syncDot();
            track.scrollLeft = Math.min(savedPos, Math.max(0, originWidth - 1));
        }

        /* ── Hydrate Tiles & Start Engine ── */
        function renderRealCategories(categoriesList) {
            if (isHydrated) {
                // If already hydrated, update images and rebuild
                rebuild();
                return;
            }

            clearTimeout(fallbackTimer);
            track.innerHTML = '';

            const items = (Array.isArray(categoriesList) && categoriesList.length > 0)
                ? categoriesList
                : DEFAULT_CATEGORIES;

            const frag = document.createDocumentFragment();
            items.forEach((cat, idx) => {
                // Match with defaults if needed for missing properties
                const fallbackMatch = DEFAULT_CATEGORIES.find(d => d.key === cat.key) || {};
                const merged = Object.assign({}, fallbackMatch, cat);
                frag.appendChild(createTileElement(merged, idx));
            });

            track.appendChild(frag);
            isHydrated = true;

            buildClones();
            buildDots();

            requestAnimationFrame(() => {
                setTimeout(() => {
                    measureOriginWidth();
                    syncDot();
                    startAutoScroll();

                    setTimeout(() => {
                        const prev = originWidth;
                        measureOriginWidth();
                        if (Math.abs(originWidth - prev) > 2) syncDot();
                    }, 600);
                }, 30);
            });

            initReveal();
        }

        /* ── Event Listeners ── */
        carousel.addEventListener('mouseenter', () => {
            isPaused = true;
            clearTimeout(resumeTimer);
            delete track.dataset.autoscrolling;
        });
        carousel.addEventListener('mouseleave', () => {
            isPaused = false;
            if (rafId !== null && isHydrated) track.dataset.autoscrolling = '1';
        });

        carousel.addEventListener('focusin', () => {
            isPaused = true;
            clearTimeout(resumeTimer);
            delete track.dataset.autoscrolling;
        });
        carousel.addEventListener('focusout', e => {
            if (!carousel.contains(e.relatedTarget)) {
                isPaused = false;
                if (rafId !== null && isHydrated) track.dataset.autoscrolling = '1';
            }
        });

        track.addEventListener('touchstart', () => pause(), { passive: true });
        track.addEventListener('touchend',   () => resume(CFG.TOUCH_RESUME_DELAY), { passive: true });

        prevBtn?.addEventListener('click', () => { pause(); goPrev(); resume(); });
        nextBtn?.addEventListener('click', () => { pause(); goNext(); resume(); });

        track.setAttribute('tabindex', '0');
        track.setAttribute('aria-label', 'Category carousel. Use arrow keys to navigate.');
        track.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); pause(); goNext(); resume(); }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); pause(); goPrev(); resume(); }
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && rafId === null && isHydrated) startAutoScroll();
        });

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                rebuild();
                if (track.scrollLeft >= originWidth && originWidth > 0) track.scrollLeft = 0;
            }, CFG.RESIZE_DEBOUNCE);
        });

        /* ── Public API Hooks ── */
        window.__renderCategoryCarousel = function (categories) {
            renderRealCategories(categories);
        };

        window.__carouselRebuild = function () {
            requestAnimationFrame(() => { setTimeout(rebuild, 60); });
        };

        // Safety fallback timer if API fails or is offline
        fallbackTimer = setTimeout(() => {
            if (!isHydrated) {
                console.log('[Carousel] API hydration timeout — rendering curated defaults');
                renderRealCategories(DEFAULT_CATEGORIES);
            }
        }, CFG.FALLBACK_TIMEOUT);
    }

    /* ─── BOOTSTRAP ─────────────────────────────────────────── */
    function init() {
        initReveal();
        initCarousel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
