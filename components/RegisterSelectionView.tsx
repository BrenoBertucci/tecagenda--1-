import React from 'react';
import { ArrowLeft, User as UserIcon, Smartphone } from 'lucide-react';

interface RegisterSelectionViewProps {
    onNavigate: (view: any) => void;
}

export const RegisterSelectionView = ({ onNavigate }: RegisterSelectionViewProps) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
        <div className="w-full max-w-sm animate-fade-in">
            <button onClick={() => onNavigate('LOGIN')} className="mb-6 flex items-center text-muted hover:text-main transition-colors">
                <ArrowLeft size={20} className="mr-1" /> Voltar
            </button>
            <h2 className="text-2xl font-bold text-main mb-2">Criar Conta</h2>
            <p className="text-muted mb-8">Como você deseja usar o TecAgenda?</p>

            <div className="space-y-4">
                <button
                    onClick={() => onNavigate('REGISTER_CLIENT')}
                    className="w-full bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                    <div className="bg-primary-light p-3 rounded-full group-hover:bg-primary-light/80 transition-colors">
                        <UserIcon className="text-primary" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-main group-hover:text-primary transition-colors">Sou Cliente</h3>
                        <p className="text-sm text-muted">Busco consertar meu celular</p>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('REGISTER_TECH')}
                    className="w-full bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                    <div className="bg-primary-light p-3 rounded-full group-hover:bg-primary-light/80 transition-colors">
                        <Smartphone className="text-primary" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-main group-hover:text-primary transition-colors">Sou Técnico</h3>
                        <p className="text-sm text-muted">Quero oferecer meus serviços</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
);
