import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { User, Technician, UserRole } from '../types';
import { Button } from './Button';
import { ArrowLeft, User as UserIcon, Camera, Mail, MapPin } from 'lucide-react';

interface SettingsViewProps {
    currentUser: User;
    usersDb: any[];
    onUpdate: (data: Partial<User & Technician>) => void;
    onDeleteRequest?: () => void;
    onBack: () => void;
}

export const SettingsView = ({ currentUser, usersDb, onUpdate, onDeleteRequest, onBack }: SettingsViewProps) => {
    const { theme, toggleTheme, isColorblind, toggleColorblind } = useTheme();
    const isTech = currentUser.role === UserRole.TECHNICIAN;
    const techData = isTech ? (usersDb.find(u => u.id === currentUser.id) as Technician) : null;

    const [name, setName] = useState(currentUser.name);
    const [bio, setBio] = useState(isTech ? (techData?.bio || '') : '');
    const [address, setAddress] = useState(isTech ? (techData?.address || '') : '');
    const [specialties, setSpecialties] = useState(isTech ? (techData?.specialties?.join(', ') || '') : '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const updates: any = { name };
        if (isTech) {
            updates.bio = bio;
            updates.address = address;
            updates.specialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
        }
        onUpdate(updates);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 animate-fade-in transition-colors">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm transition-colors">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                    <ArrowLeft size={24} />
                </button>
                <span className="font-semibold text-slate-900 dark:text-white">Configurações</span>
            </div>

            <div className="max-w-md mx-auto p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg">
                            {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500">
                                    <UserIcon size={48} />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-2.5 rounded-full shadow-lg hover:bg-primary-700 transition-colors border-2 border-white dark:border-slate-800">
                            <Camera size={18} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Toque na foto para alterar</p>
                </div>

                {/* Accessibility Settings */}
                <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 transition-colors">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Acessibilidade</h3>

                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300">Modo Escuro</span>
                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            aria-label="Alternar Modo Escuro"
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300">Modo Daltonismo (Alto Contraste)</span>
                        <button
                            onClick={toggleColorblind}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isColorblind ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            aria-label="Alternar Modo Daltonismo"
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isColorblind ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                        <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed">
                            <Mail size={16} />
                            <span>{currentUser.email}</span>
                        </div>
                    </div>

                    {isTech && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white" value={address} onChange={e => setAddress(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Especialidades (separadas por vírgula)</label>
                                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white" value={specialties} onChange={e => setSpecialties(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                                <textarea rows={3} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none resize-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white" value={bio} onChange={e => setBio(e.target.value)} />
                            </div>
                        </>
                    )}

                    <Button fullWidth onClick={handleSave}>Salvar Alterações</Button>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Privacidade e Dados (LGPD)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Você pode solicitar a exclusão permanente dos seus dados pessoais do nosso sistema.</p>
                        <Button
                            variant="danger"
                            fullWidth
                            onClick={() => {
                                if (confirm('ATENÇÃO: Tem certeza que deseja solicitar a exclusão dos seus dados? Esta ação é irreversível.')) {
                                    if (onDeleteRequest) onDeleteRequest();
                                }
                            }}
                        >
                            Solicitar Exclusão de Dados
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
