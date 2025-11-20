import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginViewProps {
    onLoginSuccess: (user: User) => void;
    onBack: () => void;
}

export const AdminLoginView = ({ onLoginSuccess, onBack }: AdminLoginViewProps) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);

        // Simulate secure check delay
        setTimeout(() => {
            if (code === '100731594') {
                const adminUser: User = {
                    id: 'admin-master',
                    name: 'Administrador',
                    email: 'admin@tecagenda.com',
                    role: UserRole.ADMIN
                };
                onLoginSuccess(adminUser);
            } else {
                setError('ACESSO NEGADO');
                setIsChecking(false);
                setCode('');
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 relative overflow-hidden">
            {/* Background Effects - Simplified */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black opacity-90"></div>

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-full border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse">
                        <Shield className="text-red-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-mono font-bold text-white tracking-widest uppercase">Acesso Master</h2>
                    <p className="text-red-400/60 text-xs mt-2 font-mono tracking-[0.2em]">SISTEMA DE SEGURANÇA ATIVO</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 backdrop-blur-sm bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">Código de Segurança</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-500 transition-colors" size={20} />
                            <input
                                type="password"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    setError('');
                                }}
                                className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-500/50 outline-none transition-all text-white font-mono text-lg tracking-widest placeholder-slate-600 text-center"
                                placeholder="•••••••••"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 text-red-500 text-xs font-mono tracking-wide animate-shake">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isChecking}
                        className={`w-full py-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-all duration-300 ${isChecking
                            ? 'bg-slate-800 text-slate-500 cursor-wait'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]'
                            }`}
                    >
                        {isChecking ? 'Verificando...' : 'Desbloquear Sistema'}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <button
                        onClick={onBack}
                        className="text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-2 mx-auto text-xs font-mono uppercase tracking-widest"
                    >
                        <ArrowLeft size={14} /> Cancelar Acesso
                    </button>
                </div>
            </div>
        </div>
    );
};
