import React, { useState } from 'react';
import { UserRole } from '../types';
import { Button } from './Button';
import { PasswordInput, isPasswordStrong } from './PasswordInput';
import { ArrowLeft } from 'lucide-react';

interface RegisterClientViewProps {
    onRegister: (user: any) => void;
    onBack: () => void;
}

export const RegisterClientView = ({ onRegister, onBack }: RegisterClientViewProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [consent, setConsent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
            return;
        }
        if (!isPasswordStrong(pass)) {
            alert('Por favor, crie uma senha mais forte seguindo os requisitos indicados.');
            return;
        }
        onRegister({
            id: `c-${Date.now()}`,
            name,
            email,
            password: pass,
            role: UserRole.CLIENT
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm animate-fade-in">
                <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Voltar
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Cadastro de Cliente</h2>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input required type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <PasswordInput
                        value={pass}
                        onChange={setPass}
                        required
                        showStrength={true}
                    />

                    <div className="flex items-start gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="consent-client"
                            checked={consent}
                            onChange={e => setConsent(e.target.checked)}
                            className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="consent-client" className="text-xs text-slate-600">
                            Li e concordo com os <span className="text-primary-600 font-medium">Termos de Uso</span> e <span className="text-primary-600 font-medium">Política de Privacidade</span>.
                        </label>
                    </div>

                    <Button type="submit" fullWidth size="lg" className="mt-2" disabled={!consent}>Criar Conta</Button>
                </form>
            </div>
        </div>
    );
};
