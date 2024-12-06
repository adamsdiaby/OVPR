const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/api/admin/login',
    VERIFY: '/api/admin/verify',
    
    // Admin endpoints
    ADMIN_STATISTICS: '/admin/statistics/overview',
    ADMIN_NOTIFICATIONS: '/admin/notifications',
    ADMIN_STATUS: '/admin/status'
};

export const createApiClient = (token = null) => {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const getFullUrl = (endpoint) => {
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }
        return `${API_BASE_URL}${endpoint}`;
    };

    const handleResponse = async (response) => {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            if (isJson) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return isJson ? response.json() : null;
    };

    const request = async (url, method, data = null) => {
        const options = {
            method,
            headers: { ...defaultHeaders },
            credentials: 'include'
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        console.log(`[API] ${method} ${url}`, { headers: options.headers, data });
        
        try {
            const response = await fetch(getFullUrl(url), options);
            const result = await handleResponse(response);
            console.log(`[API] Success for ${method} ${url}:`, result);
            return result;
        } catch (error) {
            console.log(`[API] Error for ${method} ${url}:`, error);
            throw error;
        }
    };

    return {
        get: (url) => request(url, 'GET'),
        post: (url, data) => request(url, 'POST', data),
        put: (url, data) => request(url, 'PUT', data),
        delete: (url) => request(url, 'DELETE')
    };
};

export default API_ENDPOINTS;
