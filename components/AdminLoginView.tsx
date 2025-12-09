import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { Shield, Lock, AlertCircle, ArrowLeft, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface AdminLoginViewProps {
    onLoginSuccess: (user: User) => void;
    onBack: () => void;
}

export const AdminLoginView = ({ onLoginSuccess, onBack }: AdminLoginViewProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        setError('');

        try {
            // Use Supabase Auth instead of hardcoded string
            const user = await SupabaseService.signIn(email, password);

            if (user.role === UserRole.ADMIN) {
                onLoginSuccess(user);
            } else {
                setError('ACESSO NEGADO: Usuário não é administrador.');
                await SupabaseService.signOut();
            }
        } catch (err: any) {
            console.error('Admin login error:', err);
            setError('Credenciais inválidas ou erro no servidor.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-page relative overflow-hidden">
            {/* Background Effects - Simplified */}
            <div className="absolute inset-0 bg-gradient-to-b from-page to-card opacity-90"></div>

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-full border-2 border-error/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse">
                        <Shield className="text-error" size={40} />
                    </div>
                    <h2 className="text-3xl font-mono font-bold text-main tracking-widest uppercase">Acesso Master</h2>
                    <p className="text-error-fg/60 text-xs mt-2 font-mono tracking-[0.2em]">SISTEMA DE SEGURANÇA ATIVO</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 backdrop-blur-sm bg-card/90 p-8 rounded-2xl border border-border shadow-2xl">
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-wider">Email Administrativo</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-error transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-page border border-border rounded-xl focus:ring-2 focus:ring-error-bg focus:border-error/50 outline-none transition-all text-main font-mono text-sm tracking-widest placeholder-muted"
                                placeholder="admin@tecagenda.com"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-wider">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-error transition-colors" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-page border border-border rounded-xl focus:ring-2 focus:ring-error-bg focus:border-error/50 outline-none transition-all text-main font-mono text-lg tracking-widest placeholder-muted"
                                placeholder="•••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-error transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-error-bg border border-error/20 rounded-lg flex items-center justify-center gap-2 text-error text-xs font-mono tracking-wide animate-shake">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isChecking}
                        className={`w-full py-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-all duration-300 ${isChecking
                            ? 'bg-subtle text-muted cursor-wait'
                            : 'bg-error hover:bg-error-fg text-inverted shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]'
                            }`}
                    >
                        {isChecking ? 'Verificando...' : 'Acessar Painel'}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <button
                        onClick={onBack}
                        className="text-muted hover:text-main transition-colors flex items-center justify-center gap-2 mx-auto text-xs font-mono uppercase tracking-widest"
                    >
                        <ArrowLeft size={14} /> Cancelar Acesso
                    </button>
                </div>
            </div>
        </div>
    );
};
