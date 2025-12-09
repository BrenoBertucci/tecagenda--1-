import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';
import { PasswordInput } from './PasswordInput';
import { Smartphone, Mail } from 'lucide-react';

interface LoginViewProps {
    onLogin: (email: string, pass: string) => Promise<void>;
    onNavigateRegister: () => void;
    onError: (msg: string) => void;
    setCurrentUser: (user: User | null) => void;
    setCurrentView: (view: any) => void;
    setNotification: (notification: { msg: string; type: 'success' | 'error' }) => void;
}

export const LoginView = ({ onLogin, onNavigateRegister, onError, setCurrentUser, setCurrentView, setNotification }: LoginViewProps) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [logoClicks, setLogoClicks] = useState(0);

    const handleLogoClick = () => {
        const newCount = logoClicks + 1;
        setLogoClicks(newCount);
        if (newCount >= 5) {
            setCurrentView('ADMIN_LOGIN');
            setLogoClicks(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onLogin(email, pass);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
            <div className="w-full max-w-sm animate-fade-in">
                <div className="text-center mb-8">
                    <button
                        onClick={handleLogoClick}
                        className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 transform rotate-3 active:scale-95 transition-transform"
                    >
                        <Smartphone className="text-inverted" size={32} />
                    </button>
                    <h2 className="text-2xl font-bold text-main">Bem-vindo de volta</h2>
                    <p className="text-muted">Acesse sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-muted" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-page text-main border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <PasswordInput
                        value={pass}
                        onChange={setPass}
                        required
                        showStrength={false}
                    />

                    <Button type="submit" fullWidth size="lg" className="mt-2 shadow-md">Entrar</Button>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-muted text-sm">
                            Não tem uma conta?{' '}
                            <button
                                onClick={onNavigateRegister}
                                className="text-primary font-medium hover:text-primary-hover transition-colors"
                            >
                                Cadastre-se
                            </button>
                        </p>
                        <button
                            onClick={() => setCurrentView('ABOUT')}
                            className="text-muted text-sm hover:text-primary transition-colors"
                        >
                            Sobre nós
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
