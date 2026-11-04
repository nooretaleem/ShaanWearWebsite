/**
 * SHAANWEAR — Storefront Global Environment Configuration
 * Centralized API endpoint and shipping rule configuration.
 */
(function () {
    'use strict';

    window.SHAANWEAR_CONFIG = {
        apiUrl: window.SHAANWEAR_API_URL || 'http://localhost:5000/api',
        currency: 'PKR',
        freeShippingThreshold: 4999,
        standardShippingFee: 250
    };
})();
