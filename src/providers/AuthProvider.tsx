import { useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

interface AuthProviderProps { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('chess_token');
        if (!token) { setIsLoading(false); return; }
        
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                // Token might be invalid
                localStorage.removeItem('chess_token');
                setIsAuthenticated(false);
                console.error('Failed to fetch user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            setIsAuthenticated(true);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await authService.register(name, email, password);
            await login(email, password);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = { user, isAuthenticated, isLoading, login, register, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
