import toast from 'react-hot-toast';

export interface DecodedToken {
    id?: string;
    email?: string;
    role: 'merchandiser' | 'buyer';
    fullName?: string;
    exp?: number;
    iat?: number;
}

export const getToken = (): string | null => {
    return localStorage.getItem('merch_token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('merch_token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('merch_token');
    localStorage.removeItem('merch_user');
};

export const logout = (): void => {
    removeToken();
    toast.success('Logged out successfully');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

export const setUser = (user: unknown): void => {
    localStorage.setItem('merch_user', JSON.stringify(user));
};

export const getUser = (): Record<string, unknown> | null => {
    const user = localStorage.getItem('merch_user');
    try {
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export const getDecodedToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) return null;

    try {
        // Since we are mocking, we can store JSON in the token or do a split decode.
        // Let's support both real JWT and basic base64/JSON tokens.
        if (token.includes('.')) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        }
        // Fallback for simple mock tokens
        return JSON.parse(token);
    } catch (error) {
        console.error('[auth] Invalid token format:', error);
        return null;
    }
};

export const isTokenValid = (): boolean => {
    const token = getToken();
    if (!token) return false;
    const decoded = getDecodedToken();
    if (!decoded) return false;

    if (decoded.exp) {
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            return false;
        }
    }

    return true;
};

export const getUserRole = (): 'merchandiser' | 'buyer' | null => {
    const decoded = getDecodedToken();
    const role = decoded?.role ?? null;
    return role ? (role.toLowerCase() as 'merchandiser' | 'buyer') : null;
};

export const getUserId = (): string | null => {
    const decoded = getDecodedToken();
    return decoded?.id ?? null;
};
