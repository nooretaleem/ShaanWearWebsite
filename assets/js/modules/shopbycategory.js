/* =====================================================
   VELQOR — SHOP BY CATEGORY (Editorial Carousel Engine)
   Fixed: auto-scroll now advances reliably
   ===================================================== */

console.log('[Carousel] Script loaded');

(function () {
    'use strict';

    /* ---------- CONFIGURATION ---------- */
    const CONFIG = {
        AUTO_SCROLL_INTERVAL: 4000, // 4 seconds between steps
        RESUME_DELAY: 6000,         // 6 seconds resume after user interaction
        RESIZE_DEBOUNCE: 200,       // ms debounce for window resize
        REVEAL_MARGIN: '0px 0px -60px 0px',
        REVEAL_THRESHOLD: 0.12
    };

    /* ---------- REVEAL ANIMATIONS ---------- */
    function initReveal() {
        const targets = document.querySelectorAll('.shop-category .reveal');
        if (!targets.length) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || !('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: CONFIG.REVEAL_MARGIN,
            threshold: CONFIG.REVEAL_THRESHOLD
        });

        targets.forEach(el => observer.observe(el));
    }

    /* ---------- CAROUSEL CONTROLLER ---------- */
    function initCarousel() {
        const carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            console.warn('[Carousel] Carousel element [data-carousel] not found');
            return;
        }
        console.log('[Carousel] Carousel found');

        const track = carousel.querySelector('[data-carousel-track]');
        if (!track) {
            console.warn('[Carousel] Track element [data-carousel-track] not found');
            return;
        }
        console.log('[Carousel] Track found');

        const tiles = track.querySelectorAll('.category-tile');
        console.log('[Carousel] Tiles count:', tiles.length);
        if (!tiles.length) return;

        const prevBtn = carousel.querySelector('[data-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-carousel-next]');
        const dotsContainer = document.querySelector('[data-carousel-dots]');

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

        /* ---------- STATE ---------- */
        let autoTimer = null;
        let resumeTimer = null;
        let resizeTimer = null;
        let rafId = null;
        let isPaused = false;
        let isProgrammatic = false;   // prevents user-scroll detection from firing on auto-scroll
        let programmaticTimer = null;

        /* ---------- GEOMETRY HELPERS ---------- */
        function getStep() {
            const tile = tiles[0];
            if (!tile) return track.clientWidth * 0.8;
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            return tile.offsetWidth + gap;
        }

        function getMaxScroll() {
            return Math.max(0, track.scrollWidth - track.clientWidth);
        }

        function markProgrammatic() {
            isProgrammatic = true;
            clearTimeout(programmaticTimer);
            programmaticTimer = setTimeout(() => {
                isProgrammatic = false;
            }, 800);
        }

        /* ---------- SCROLL ACTIONS ---------- */
        function scrollNext() {
            const step = getStep();
            const max = getMaxScroll();

            if (track.scrollLeft >= max - 4) {
                console.log('[Carousel] Loop to start');
                markProgrammatic();
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                console.log('[Carousel] Next step by', step);
                markProgrammatic();
                track.scrollBy({ left: step, behavior: 'smooth' });
            }
        }

        function scrollPrev() {
            const step = getStep();
            const max = getMaxScroll();

            if (track.scrollLeft <= 4) {
                console.log('[Carousel] Loop to end');
                markProgrammatic();
                track.scrollTo({ left: max, behavior: 'smooth' });
            } else {
                console.log('[Carousel] Prev step by', step);
                markProgrammatic();
                track.scrollBy({ left: -step, behavior: 'smooth' });
            }
        }

        function scrollToIndex(i) {
            const step = getStep();
            const tileCount = tiles.length;
            const safeIndex = Math.max(0, Math.min(tileCount - 1, i));
            console.log('[Carousel] Go to index', safeIndex);
            markProgrammatic();
            track.scrollTo({ left: safeIndex * step, behavior: 'smooth' });
        }

        /* ---------- AUTO-SCROLL ENGINE ---------- */
        /* ---------- AUTO-SCROLL ENGINE ---------- */
        function startAutoScroll() {
            stopAutoScroll();

            // ===== DIAGNOSTIC LOGGING =====
            console.log('[Carousel] startAutoScroll() called');
            console.log('  prefersReduced:', prefersReduced.matches);
            console.log('  document.hidden:', document.hidden);
            console.log('  isPaused:', isPaused);

            // Block only if tab is hidden or user has paused
            if (document.hidden) {
                console.log('[Carousel] ❌ SKIPPED: tab is hidden');
                return;
            }
            if (isPaused) {
                console.log('[Carousel] ❌ SKIPPED: isPaused flag is true');
                return;
            }

            console.log('[Carousel] ✅ Auto-scroll started');
            autoTimer = setInterval(() => {
                if (isPaused || document.hidden) return;
                scrollNext();
            }, CONFIG.AUTO_SCROLL_INTERVAL);
        }
        function stopAutoScroll() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
                console.log('[Carousel] Auto-scroll stopped');
            }
        }

        function pauseAutoScroll(delay) {
            isPaused = true;
            stopAutoScroll();
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                isPaused = false;
                // startAutoScroll();
            }, delay || CONFIG.RESUME_DELAY);
        }

        /* ---------- DOT INDICATORS ---------- */
        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';

            tiles.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.setAttribute('role', 'button');
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                if (i === 0) dot.classList.add('is-active');

                dot.addEventListener('click', () => {
                    pauseAutoScroll();
                    scrollToIndex(i);
                });

                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        pauseAutoScroll();
                        scrollToIndex(i);
                    }
                });

                dotsContainer.appendChild(dot);
            });
        }

        function updateActiveDot() {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('span');
            if (!dots.length) return;

            const step = getStep();
            const max = getMaxScroll();

            // Detect active index from scroll position (never mutates state)
            let idx = Math.round(track.scrollLeft / step);
            if (max > 0 && track.scrollLeft >= max - 4) idx = tiles.length - 1;
            idx = Math.max(0, Math.min(tiles.length - 1, idx));

            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
        }

        /* ---------- SCROLL LISTENER (RAF THROTTLED) ---------- */
        function onScroll() {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                updateActiveDot();

                // Detect user-initiated scrolls (not from auto-scroll)
                if (!isProgrammatic) {
                    pauseAutoScroll();
                }

                rafId = null;
            });
        }

        /* ---------- EVENT LISTENERS ---------- */
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                pauseAutoScroll();
                scrollPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                pauseAutoScroll();
                scrollNext();
            });
        }

        carousel.addEventListener('mouseenter', () => {
            isPaused = true;
            stopAutoScroll();
        });

        carousel.addEventListener('mouseleave', () => {
            isPaused = false;
            //startAutoScroll();
        });

        carousel.addEventListener('focusin', () => {
            isPaused = true;
            stopAutoScroll();
        });

        carousel.addEventListener('focusout', (e) => {
            if (!carousel.contains(e.relatedTarget)) {
                isPaused = false;
                //startAutoScroll();
            }
        });

        track.addEventListener('touchstart', () => {
            isPaused = true;
            stopAutoScroll();
        }, { passive: true });

        track.addEventListener('touchend', () => {
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                isPaused = false;
                //startAutoScroll();
            }, 2000);
        }, { passive: true });

        track.addEventListener('scroll', onScroll, { passive: true });

        track.setAttribute('tabindex', '0');
        track.setAttribute('aria-label', 'Category carousel');
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                pauseAutoScroll();
                scrollNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                pauseAutoScroll();
                scrollPrev();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoScroll();
            } else if (!isPaused) {
                //startAutoScroll();
            }
        });

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                buildDots();
                updateActiveDot();
            }, CONFIG.RESIZE_DEBOUNCE);
        });

        /* ---------- INITIALIZATION ---------- */
        buildDots();
        updateActiveDot();

        console.log('[Carousel] Carousel ready');
        //startAutoScroll();
    }

    /* ---------- MAIN BOOTSTRAP ---------- */
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