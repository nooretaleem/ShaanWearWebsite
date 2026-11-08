/**
 * SHAANWEAR — Storefront Authentication Service
 * Manages JWT tokens, customer session state, and auth API interactions.
 */
(function () {
    'use strict';

    const TOKEN_KEY = 'shaanwear_access_token';
    const REFRESH_TOKEN_KEY = 'shaanwear_refresh_token';
    const USER_KEY = 'shaanwear_user';

    const getApiUrl = () => {
        if (window.SHAANWEAR_CONFIG && window.SHAANWEAR_CONFIG.apiUrl) {
            return window.SHAANWEAR_CONFIG.apiUrl.replace(/\/+$/, '');
        }
        const isLocal = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:'
        );
        const host = (typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'))
            ? window.location.hostname
            : 'localhost';

        return isLocal ? `http://${host}:5000/api` : 'https://shaan-wear-backend.vercel.app/api';
    };

    /**
     * Decode JWT token payload (client-side verification)
     */
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (_) {
            return null;
        }
    };

    /**
     * Check if a token is present and not expired
     */
    const isTokenValid = (token) => {
        if (!token || typeof token !== 'string') return false;
        const decoded = parseJwt(token);
        if (!decoded || !decoded.exp) return false;
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    };

    const ShaanwearAuth = {
        getToken: () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('shaanwear_token'),

        getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

        getUser: () => {
            try {
                const userStr = localStorage.getItem(USER_KEY);
                return userStr ? JSON.parse(userStr) : null;
            } catch (_) {
                return null;
            }
        },

        isAuthenticated: function () {
            const token = this.getToken();
            return isTokenValid(token);
        },

        setSession: function (data) {
            if (!data) return;
            const accessToken = data.accessToken || data.token;
            const refreshToken = data.refreshToken;
            const user = data.user;

            if (accessToken) {
                localStorage.setItem(TOKEN_KEY, accessToken);
                // Also store under legacy key for backwards compatibility
                localStorage.setItem('shaanwear_token', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            }
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
            }

            // Dispatch global event for header/UI reactive updates
            window.dispatchEvent(new CustomEvent('shaanwear:auth-changed', {
                detail: { isAuthenticated: true, user }
            }));
        },

        clearSession: function () {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('shaanwear_token');
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);

            window.dispatchEvent(new CustomEvent('shaanwear:auth-changed', {
                detail: { isAuthenticated: false, user: null }
            }));
        },

        /**
         * POST /api/auth/register
         */
        register: async function (name, email, password) {
            const url = `${getApiUrl()}/auth/register`;
            let res;
            try {
                res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
            } catch (networkErr) {
                const err = new Error(`Cannot reach backend server at ${getApiUrl()}. Please check that your server is running.`);
                err.isNetworkError = true;
                throw err;
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error?.message || data.message || `Registration failed (status ${res.status}).`);
            }

            if (data.data) {
                this.setSession(data.data);
            }
            return data;
        },

        /**
         * POST /api/auth/login
         */
        login: async function (email, password) {
            const url = `${getApiUrl()}/auth/login`;
            let res;
            try {
                res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
            } catch (networkErr) {
                const err = new Error(`Cannot reach backend server at ${getApiUrl()}. Please check that your server is running.`);
                err.isNetworkError = true;
                throw err;
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error?.message || data.message || 'Invalid email or password.');
            }

            if (data.data) {
                this.setSession(data.data);
            }
            return data;
        },

        /**
         * GET /api/auth/me (Protected Route)
         */
        fetchProfile: async function () {
            const token = this.getToken();
            if (!token) {
                this.clearSession();
                const err = new Error('No authentication token found.');
                err.isAuthError = true;
                err.status = 401;
                throw err;
            }

            let res;
            try {
                res = await fetch(`${getApiUrl()}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            } catch (networkErr) {
                const err = new Error(`Cannot reach authentication server at ${getApiUrl()}. Please check your connection or server status.`);
                err.isNetworkError = true;
                err.originalError = networkErr;
                throw err;
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    this.clearSession();
                }
                const err = new Error(data.error?.message || data.message || `Profile request failed (${res.status}).`);
                err.status = res.status;
                err.isAuthError = (res.status === 401 || res.status === 403);
                throw err;
            }

            if (data.data?.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
            }
            return data.data?.user;
        },

        /**
         * POST /api/auth/logout
         */
        logout: async function () {
            const token = this.getToken();
            try {
                if (token) {
                    await fetch(`${getApiUrl()}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                }
            } catch (err) {
                console.warn('[ShaanwearAuth Logout Error]:', err.message);
            } finally {
                this.clearSession();
            }
        },

        /**
         * Handler for the Person icon click:
         * If logged in -> redirect to account/profile page.
         * If not logged in -> redirect to login page.
         * Prevents self-redirects/bounces when already on target page.
         */
        handleAccountClick: function (e) {
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
            const path = (window.location.pathname || '').toLowerCase();
            if (this.isAuthenticated()) {
                if (!path.endsWith('account.html')) {
                    window.location.href = 'account.html';
                }
            } else {
                if (!path.endsWith('login.html')) {
                    window.location.href = 'login.html';
                } else {
                    const emailInput = document.getElementById('loginEmail');
                    if (emailInput) emailInput.focus();
                }
            }
        }
    };

    window.ShaanwearAuth = ShaanwearAuth;
})();

