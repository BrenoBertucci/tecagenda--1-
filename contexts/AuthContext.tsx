import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DbUser, UserRole } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { logService } from '../services/LogService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (newUser: DbUser) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await SupabaseService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Auth check failed', error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();

        // Optional: Listen to auth state changes if Supabase provides a listener
        // supabase.auth.onAuthStateChange(...)
    }, []);

    const signIn = async (email: string, pass: string) => {
        setLoading(true);
        try {
            const loggedUser = await SupabaseService.signIn(email, pass);
            setUser(loggedUser);
            logService.info('LOGIN_SUCCESS', loggedUser.id, loggedUser.email);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (newUser: DbUser) => {
        setLoading(true);
        try {
            const registeredUser = await SupabaseService.signUp(newUser.email, newUser.password!, newUser);
            // Auto login or wait for confirmation? implementation implies auto-login or just success
            // If the service returns a User, we might want to set it, but usually signup requires email confirmation
            // or explicit login. The original code required login after.
            // Keeping consistent with original flow: "Conta criada com sucesso! Faça login."
            // So we don't setUser here unless SupabaseService.signUp logs them in.
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await SupabaseService.signOut();
            setUser(null);
            logService.info('LOGOUT', user?.id, user?.email);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;
        setLoading(true);
        try {
            const updatedUser = { ...user, ...data };
            await SupabaseService.updateUser(updatedUser as User);
            setUser(updatedUser as User);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
