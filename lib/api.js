// lib/api.js
const API_BASE_URL = 'http://localhost:8000';

class ApiClient {
    constructor() {
        this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    }

    setToken(token) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    removeToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                if (response.status === 401) {
                    this.removeToken();
                }
                const errorData = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    async register(userData) {
        const result = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async login(credentials) {
        const result = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    async logout() {
        try {
            await this.request('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.removeToken();
        }
    }

    isAuthenticated() {
        return !!this.token;
    }
}

export const apiClient = new ApiClient();
export default apiClient;