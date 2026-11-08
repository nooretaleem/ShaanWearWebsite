/**
 * SHAANWEAR — Storefront Global Environment Configuration
 * Centralized API endpoint and shipping rule configuration.
 */
(function () {
    'use strict';

    // Auto-detect local development vs deployed production environment
    const isLocal = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
    );

    const host = (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'))
        ? window.location.hostname
        : 'localhost';

    const defaultApiUrl = isLocal 
        ? `http://${host}:5000/api`
        : 'https://shaan-wear-backend.vercel.app/api';

    window.SHAANWEAR_CONFIG = {
        apiUrl: window.SHAANWEAR_API_URL || defaultApiUrl,
        currency: 'PKR',
        freeShippingThreshold: 4999,
        standardShippingFee: 250
    };
})();
