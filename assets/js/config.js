/**
 * SHAANWEAR — Storefront Global Environment Configuration
 * Centralized API endpoint, proxy/direct mode toggles, and shipping rules.
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

    // Check for explicit environment variable overrides
    // (supports standard frontend bundler env vars and runtime globals)
    const envApiBase = (typeof window !== 'undefined') && (
        window.NEXT_PUBLIC_API_BASE_URL ||
        window.VITE_API_BASE_URL ||
        window.SHAANWEAR_API_URL ||
        (window.__ENV__ && window.__ENV__.API_BASE_URL)
    );

    // Check toggle preference: 'proxy' (default when deployed on Vercel) vs 'direct'
    const storedMode = typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('shaanwear_api_mode')
        : null;

    const forcedMode = (typeof window !== 'undefined')
        ? (window.SHAANWEAR_API_MODE || storedMode)
        : null;

    let computedApiUrl;
    if (envApiBase) {
        // Direct override via env variable (e.g. NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL)
        computedApiUrl = envApiBase.replace(/\/+$/, '');
    } else if (isLocal) {
        // Local Node backend server
        computedApiUrl = `http://${host}:5000/api`;
    } else if (forcedMode === 'direct') {
        // Explicitly forced direct mode to cross-origin backend
        computedApiUrl = 'https://shaan-wear-backend.vercel.app/api';
    } else {
        // Default on Vercel deployment: relative '/api' proxy via vercel.json rewrite (same-origin, no CORS)
        computedApiUrl = '/api';
    }

    window.SHAANWEAR_CONFIG = {
        apiUrl: computedApiUrl,
        apiMode: (computedApiUrl === '/api') ? 'proxy' : 'direct',
        currency: 'PKR',
        freeShippingThreshold: 4999,
        standardShippingFee: 250
    };
})();
