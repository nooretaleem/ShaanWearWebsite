/* =====================================================
   SHAANWEAR — Master Product Catalog Store
   All default/sample products removed; populated exclusively from backend API.
   ===================================================== */

(function () {
    'use strict';

    // Populated dynamically from the backend API at runtime
    window.SHAANWEAR_PRODUCTS = [];

    window.getProductById = function (id) {
        const catalog = window.SHAANWEAR_PRODUCTS || [];
        return catalog.find(p => String(p.id) === String(id)) || null;
    };

    window.getRelatedProducts = function (product, limit = 4) {
        const catalog = window.SHAANWEAR_PRODUCTS || [];
        if (!product || catalog.length === 0) return [];
        const sameCategory = catalog.filter(
            p => String(p.id) !== String(product.id) &&
                 ((p.categorySlug && p.categorySlug === product.categorySlug) || p.category === product.category)
        );
        const others = catalog.filter(
            p => String(p.id) !== String(product.id) && !sameCategory.includes(p)
        );
        return sameCategory.concat(others).slice(0, limit);
    };
})();
