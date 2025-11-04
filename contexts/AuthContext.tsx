import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as xanoLogin, signup as xanoSignup, getMe, XanoUser } from '../services/xanoService';

interface AuthContextType {
    user: XanoUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<XanoUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    setToken(storedToken);
                    const userData = await getMe(storedToken);
                    setUser(userData);
                } catch (error) {
                    console.error("Session validation failed", error);
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { authToken } = await xanoLogin(email, password);
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        const userData = await getMe(authToken);
        setUser(userData);
    };
    
    const signup = async (name: string, email: string, password: string) => {
        const { authToken } = await xanoSignup(name, email, password);
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        const userData = await getMe(authToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
