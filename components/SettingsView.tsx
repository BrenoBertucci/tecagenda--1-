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
        <div className="min-h-screen bg-page pb-20 animate-fade-in transition-colors">
            <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm transition-colors">
                <button onClick={onBack} className="p-2 hover:bg-hover rounded-full transition-colors text-muted">
                    <ArrowLeft size={24} />
                </button>
                <span className="font-semibold text-main">Configurações</span>
            </div>

            <div className="max-w-md mx-auto p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-subtle border-4 border-border shadow-lg">
                            {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted bg-subtle">
                                    <UserIcon size={48} />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-inverted p-2.5 rounded-full shadow-lg hover:bg-primary-hover transition-colors border-2 border-card">
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
                    <p className="mt-3 text-sm text-muted">Toque na foto para alterar</p>
                </div>

                {/* Accessibility Settings */}
                <div className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm mb-6 transition-colors">
                    <h3 className="text-sm font-bold text-main mb-2">Acessibilidade</h3>

                    <div className="flex items-center justify-between">
                        <span className="text-secondary">Modo Escuro</span>
                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-subtle'}`}
                            aria-label="Alternar Modo Escuro"
                        >
                            <div className={`w-4 h-4 rounded-full bg-card shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-secondary">Modo Daltonismo (Alto Contraste)</span>
                        <button
                            onClick={toggleColorblind}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isColorblind ? 'bg-primary' : 'bg-subtle'}`}
                            aria-label="Alternar Modo Daltonismo"
                        >
                            <div className={`w-4 h-4 rounded-full bg-card shadow-sm transform transition-transform ${isColorblind ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm transition-colors">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Nome</label>
                        <input type="text" className="w-full p-2.5 bg-page border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-main" value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-subtle border border-border rounded-lg text-muted cursor-not-allowed">
                            <Mail size={16} />
                            <span>{currentUser.email}</span>
                        </div>
                    </div>

                    {isTech && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Endereço</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-muted" size={18} />
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-page border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all text-main" value={address} onChange={e => setAddress(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Especialidades (separadas por vírgula)</label>
                                <input type="text" className="w-full p-2.5 bg-page border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all text-main" value={specialties} onChange={e => setSpecialties(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Bio</label>
                                <textarea rows={3} className="w-full p-2.5 bg-page border border-border rounded-lg outline-none resize-none focus:ring-2 focus:ring-primary transition-all text-main" value={bio} onChange={e => setBio(e.target.value)} />
                            </div>
                        </>
                    )}

                    <Button fullWidth onClick={handleSave}>Salvar Alterações</Button>

                    <div className="pt-6 border-t border-border mt-6">
                        <h3 className="text-sm font-bold text-main mb-2">Privacidade e Dados (LGPD)</h3>
                        <p className="text-xs text-muted mb-4">Você pode solicitar a exclusão permanente dos seus dados pessoais do nosso sistema.</p>
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
