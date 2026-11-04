/**
 * SHAANWEAR — Storefront Global Environment Configuration
 * Centralized API endpoint and shipping rule configuration.
 */
(function () {
    'use strict';

    window.SHAANWEAR_CONFIG = {
        //apiUrl: window.SHAANWEAR_API_URL || 'https://shaan-wear-backend.vercel.app/api',
        apiUrl: window.SHAANWEAR_API_URL || 'https://shaan-wear-backend.vercel.app/api',
        currency: 'PKR',
        freeShippingThreshold: 4999,
        standardShippingFee: 250
    };
})();
