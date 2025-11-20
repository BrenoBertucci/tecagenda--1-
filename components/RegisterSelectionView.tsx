import React from 'react';
import { ArrowLeft, User as UserIcon, Smartphone } from 'lucide-react';

interface RegisterSelectionViewProps {
    onNavigate: (view: any) => void;
}

export const RegisterSelectionView = ({ onNavigate }: RegisterSelectionViewProps) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm animate-fade-in">
            <button onClick={() => onNavigate('LOGIN')} className="mb-6 flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft size={20} className="mr-1" /> Voltar
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Criar Conta</h2>
            <p className="text-slate-500 mb-8">Como você deseja usar o TecAgenda?</p>

            <div className="space-y-4">
                <button
                    onClick={() => onNavigate('REGISTER_CLIENT')}
                    className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-primary-500 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                    <div className="bg-primary-50 p-3 rounded-full group-hover:bg-primary-100 transition-colors">
                        <UserIcon className="text-primary-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Sou Cliente</h3>
                        <p className="text-sm text-slate-500">Busco consertar meu celular</p>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('REGISTER_TECH')}
                    className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-primary-500 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                    <div className="bg-primary-50 p-3 rounded-full group-hover:bg-primary-100 transition-colors">
                        <Smartphone className="text-primary-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Sou Técnico</h3>
                        <p className="text-sm text-slate-500">Quero oferecer meus serviços</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
);
