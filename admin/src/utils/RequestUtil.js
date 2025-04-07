export const API_BASE_URL = '/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : ''
});

export const setToken = (token) => {
    if (token) {
        localStorage.setItem('adminToken', token);
    } else {
        localStorage.removeItem('adminToken');
    }
};

export const login = async (password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({password})
    });

    if (!response.ok) {
        throw new Error('Invalid password');
    }

    const data = await response.json();
    setToken(data.token);
    return data;
};

export const get = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) {
            setToken(null);
            throw new Error('Unauthorized');
        }
        throw new Error('Request failed');
    }

    return response.json();
};

export const post = async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        if (response.status === 401) {
            setToken(null);
            throw new Error('Unauthorized');
        }
        throw new Error('Request failed');
    }

    return response.json();
};

export const put = async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        if (response.status === 401) {
            setToken(null);
            throw new Error('Unauthorized');
        }
        throw new Error('Request failed');
    }

    return response.json();
};

export const del = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (!response.ok) {
        if (response.status === 401) {
            setToken(null);
            throw new Error('Unauthorized');
        }
        throw new Error('Request failed');
    }

    return response.json();
};