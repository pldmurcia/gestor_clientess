// This is a mock Xano service. Replace with your actual Xano API endpoints and logic.

const XANO_API_BASE_URL = 'https://your-xano-instance.xano.io/api:your-api-group';

export interface XanoUser {
    id: number;
    name: string;
    email: string;
}

interface AuthResponse {
    authToken: string;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${XANO_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${XANO_API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
};

export const getMe = async (token: string): Promise<XanoUser> => {
    const response = await fetch(`${XANO_API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    return handleResponse(response);
};
