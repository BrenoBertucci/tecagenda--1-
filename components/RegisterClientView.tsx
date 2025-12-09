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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
            <div className="w-full max-w-sm animate-fade-in">
                <button onClick={onBack} className="mb-6 flex items-center text-muted hover:text-main transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Voltar
                </button>
                <h2 className="text-2xl font-bold text-main mb-6">Cadastro de Cliente</h2>
                <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Nome Completo</label>
                        <input required type="text" className="w-full p-2.5 bg-page text-main border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                        <input required type="email" className="w-full p-2.5 bg-page text-main border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} />
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
                            className="mt-1 rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="consent-client" className="text-xs text-muted">
                            Li e concordo com os <span className="text-primary font-medium">Termos de Uso</span> e <span className="text-primary font-medium">Política de Privacidade</span>.
                        </label>
                    </div>

                    <Button type="submit" fullWidth size="lg" className="mt-2" disabled={!consent}>Criar Conta</Button>
                </form>
            </div>
        </div>
    );
};
