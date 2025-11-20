import React, { useState, useEffect, useRef } from 'react';
import {
    User, UserRole, Technician, Appointment,
    AppointmentStatus, DaySchedule, Review
} from './types';
import { MOCK_TECHS, generateMockSchedule } from './constants';
import { Button } from './components/Button';
import { ReviewForm } from './components/ReviewForm';
import { ReviewList } from './components/ReviewList';
import {
    Smartphone, MapPin, Star, Calendar, Clock,
    User as UserIcon, Search, LogOut, ChevronLeft,
    CheckCircle, XCircle, AlertCircle, Settings, History,
    Camera, Mail, Lock, ArrowLeft
} from 'lucide-react';

// --- GLOBAL STATE TYPES ---

type ViewState =
    | 'LOGIN'
    | 'REGISTER_SELECTION'
    | 'REGISTER_CLIENT'
    | 'REGISTER_TECH'
    | 'SETTINGS'
    | 'CLIENT_HOME'
    | 'CLIENT_TECH_PROFILE'
    | 'CLIENT_BOOKING'
    | 'CLIENT_APPOINTMENTS'
    | 'TECH_DASHBOARD';

interface DbUser extends User {
    password?: string;
    specialties?: string[];
    rating?: number;
    distance?: string;
    priceEstimate?: string;
    bio?: string;
    address?: string;
}

// --- SUB-COMPONENTS (MOVED OUTSIDE APP) ---

// 1. Login Component
interface LoginViewProps {
    usersDb: DbUser[];
    onLoginSuccess: (user: User) => void;
    onNavigateRegister: () => void;
    onError: (msg: string) => void;
}

const LoginView = ({ usersDb, onLoginSuccess, onNavigateRegister, onError }: LoginViewProps) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = usersDb.find(u => u.email === email && u.password === pass);

        if (user) {
            const sessionUser: User = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl
            };
            onLoginSuccess(sessionUser);
        } else {
            onError('Email ou senha inválidos');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm animate-fade-in">
                <div className="text-center mb-8">
                    <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 transform rotate-3">
                        <Smartphone className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
                    <p className="text-slate-500">Acesse sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button type="submit" fullWidth size="lg" className="mt-2 shadow-md">Entrar</Button>

                    <div className="pt-4 text-center">
                        <p className="text-sm text-slate-600">Não tem uma conta?</p>
                        <button
                            type="button"
                            onClick={onNavigateRegister}
                            className="text-primary-600 font-semibold hover:underline mt-1"
                        >
                            Cadastrar-se agora
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 bg-slate-100 p-3 rounded-lg inline-block border border-slate-200">
                        <span className="font-semibold block mb-1">Dica de Teste (Dados Mockados):</span>
                        <div className="flex justify-between gap-4 text-left">
                            <div>
                                <strong>Cliente:</strong><br />maria@email.com<br />123
                            </div>
                            <div>
                                <strong>Técnico:</strong><br />carlos@tecagenda.com<br />123
                            </div>
                        </div>
                    </p>
                </div>
            </div>
        </div>
    );
};

// 2. Register Selection
const RegisterSelectionView = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => (
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

// 3. Register Client
const RegisterClientView = ({ onRegister, onBack }: { onRegister: (user: DbUser) => void, onBack: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <input required type="password" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={pass} onChange={e => setPass(e.target.value)} />
                    </div>
                    <Button type="submit" fullWidth size="lg" className="mt-2">Criar Conta</Button>
                </form>
            </div>
        </div>
    );
};

// 4. Register Tech
const RegisterTechView = ({ onRegister, onBack }: { onRegister: (user: DbUser) => void, onBack: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [address, setAddress] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister({
            id: `t-${Date.now()}`,
            name,
            email,
            password: pass,
            role: UserRole.TECHNICIAN,
            address,
            bio,
            specialties: ['Geral'],
            rating: 5.0,
            distance: '0.5 km',
            priceEstimate: 'Sob Consulta'
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 py-12">
            <div className="w-full max-w-sm animate-fade-in">
                <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Voltar
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Cadastro de Técnico</h2>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Profissional</label>
                        <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input required type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <input required type="password" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={pass} onChange={e => setPass(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (Bairro/Cidade)</label>
                        <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Breve Biografia</label>
                        <textarea required rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all" value={bio} onChange={e => setBio(e.target.value)} placeholder="Ex: Especialista em iPhone com 5 anos de experiência..." />
                    </div>
                    <Button type="submit" fullWidth size="lg" className="mt-2">Criar Conta Profissional</Button>
                </form>
            </div>
        </div>
    );
};

// 5. Settings View
interface SettingsViewProps {
    currentUser: User;
    usersDb: DbUser[];
    onUpdate: (data: Partial<User & Technician>) => void;
    onBack: () => void;
}

const SettingsView = ({ currentUser, usersDb, onUpdate, onBack }: SettingsViewProps) => {
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
        <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <span className="font-semibold text-slate-900">Configurações</span>
            </div>

            <div className="max-w-md mx-auto p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-lg">
                            {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                    <UserIcon size={48} />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-2.5 rounded-full shadow-lg hover:bg-primary-700 transition-colors border-2 border-white">
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
                    <p className="mt-3 text-sm text-slate-500">Toque na foto para alterar</p>
                </div>

                <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                        <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed">
                            <Mail size={16} />
                            <span>{currentUser.email}</span>
                        </div>
                    </div>

                    {isTech && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Especialidades (separadas por vírgula)</label>
                                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all" value={specialties} onChange={e => setSpecialties(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                <textarea rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-primary-500 transition-all" value={bio} onChange={e => setBio(e.target.value)} />
                            </div>
                        </>
                    )}

                    <Button fullWidth onClick={handleSave}>Salvar Alterações</Button>
                </div>
            </div>
        </div>
    );
};

// 6. Client Home
const ClientHome = ({ usersDb, onSelectTech }: { usersDb: DbUser[], onSelectTech: (id: string) => void }) => {
    const techs = usersDb.filter(u => u.role === UserRole.TECHNICIAN) as Technician[];

    return (
        <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Encontre um Técnico</h2>
                <p className="text-slate-500">Profissionais qualificados próximos a você</p>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Buscar por especialidade..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm outline-none transition-all"
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            </div>

            <div className="space-y-4">
                {techs.map(tech => (
                    <div key={tech.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                            {tech.avatarUrl ? (
                                <img src={tech.avatarUrl} alt={tech.name} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <UserIcon size={24} />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900">{tech.name}</h3>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-xs font-medium text-yellow-700">
                                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                        {tech.rating || 'N/A'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                    <MapPin size={14} />
                                    {tech.distance || '? km'} • {tech.address || 'Endereço n/d'}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tech.specialties?.slice(0, 2).map((spec, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">{tech.priceEstimate || 'Sob consulta'}</span>
                            <Button size="sm" onClick={() => onSelectTech(tech.id)}>
                                Ver Agenda
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 7. Client Booking
interface ClientBookingProps {
    date: string;
    time: string;
    onConfirm: (model: string, issue: string) => void;
    onBack: () => void;
}

const ClientBooking = ({ date, time, onConfirm, onBack }: ClientBookingProps) => {
    const [deviceModel, setDeviceModel] = useState('');
    const [issueDesc, setIssueDesc] = useState('');

    return (
        <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
            <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <span className="font-semibold text-slate-900">Confirmar Agendamento</span>
            </div>

            <div className="p-6 flex-1">
                <div className="bg-primary-50 p-4 rounded-xl mb-6 flex gap-4 items-center">
                    <div className="bg-primary-100 p-3 rounded-full">
                        <Calendar className="text-primary-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-primary-700 font-medium">Data e Hora</p>
                        <p className="text-lg font-bold text-primary-900">
                            {new Date(date).toLocaleDateString('pt-BR')} às {time}
                        </p>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onConfirm(deviceModel, issueDesc); }} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Modelo do Aparelho</label>
                        <input
                            required
                            type="text"
                            value={deviceModel}
                            onChange={(e) => setDeviceModel(e.target.value)}
                            placeholder="Ex: iPhone 13 Pro"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Defeito</label>
                        <textarea
                            required
                            rows={4}
                            value={issueDesc}
                            onChange={(e) => setIssueDesc(e.target.value)}
                            placeholder="Descreva o problema..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all"
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" fullWidth size="lg">
                            Confirmar Agendamento
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function App() {
    // -- State --
    const [usersDb, setUsersDb] = useState<DbUser[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
    const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [techSchedules, setTechSchedules] = useState<Record<string, DaySchedule[]>>({});
    const [reviews, setReviews] = useState<Review[]>([]);
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    // Booking temp state
    const [bookingDate, setBookingDate] = useState<string>('');
    const [bookingTime, setBookingTime] = useState<string>('');
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

    // Initialize Data
    useEffect(() => {
        const initialUsers: DbUser[] = [
            { id: 'c99', name: 'Maria Souza', email: 'maria@email.com', password: '123', role: UserRole.CLIENT },
            ...MOCK_TECHS.map(t => ({ ...t, password: '123' }))
        ];
        setUsersDb(initialUsers);

        const initialSchedules: Record<string, DaySchedule[]> = {};
        MOCK_TECHS.forEach(tech => {
            initialSchedules[tech.id] = generateMockSchedule(3);
        });
        setTechSchedules(initialSchedules);

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const mockInitialAppointment: Appointment = {
            id: 'mock-init-1',
            clientId: 'c99',
            clientName: 'Maria Souza',
            techId: 't1',
            techName: 'Carlos Silva',
            date: todayStr,
            time: '10:00',
            deviceModel: 'Samsung S21',
            issueDescription: 'Tela piscando e travando durante uso.',
            status: AppointmentStatus.CONFIRMED,
            createdAt: new Date().toISOString()
        };

        // Add a completed appointment for testing reviews
        const mockCompletedAppointment: Appointment = {
            id: 'mock-completed-1',
            clientId: 'c99',
            clientName: 'Maria Souza',
            techId: 't2',
            techName: 'Ana Oliveira',
            date: yesterdayStr,
            time: '14:00',
            deviceModel: 'iPhone 12',
            issueDescription: 'Bateria viciada.',
            status: AppointmentStatus.COMPLETED,
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        };

        setAppointments([mockInitialAppointment, mockCompletedAppointment]);
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // -- Logic Handlers --

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        setCurrentView(user.role === UserRole.CLIENT ? 'CLIENT_HOME' : 'TECH_DASHBOARD');
    };

    const handleRegister = (newUser: DbUser) => {
        setUsersDb(prev => [...prev, newUser]);
        if (newUser.role === UserRole.TECHNICIAN) {
            setTechSchedules(prev => ({
                ...prev,
                [newUser.id]: generateMockSchedule(3)
            }));
        }
        setNotification({ msg: 'Conta criada com sucesso! Faça login.', type: 'success' });
        setCurrentView('LOGIN');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('LOGIN');
        setSelectedTech(null);
    };

    const handleUpdateProfile = (updatedData: Partial<User & Technician>) => {
        if (!currentUser) return;
        const newSessionUser = { ...currentUser, ...updatedData };
        setCurrentUser(newSessionUser as User);
        setUsersDb(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
        setNotification({ msg: 'Perfil atualizado!', type: 'success' });
    };

    const handleConfirmBooking = (model: string, issue: string) => {
        if (!selectedTech || !currentUser) return;

        // Robustness Check: Verify if slot is still available
        const techSchedule = techSchedules[selectedTech.id] || [];
        const daySchedule = techSchedule.find(d => d.date === bookingDate);
        const slot = daySchedule?.slots.find(s => s.time === bookingTime);

        if (!slot || slot.isBooked || slot.isBlocked) {
            setNotification({ msg: 'Este horário não está mais disponível. Por favor, escolha outro.', type: 'error' });
            return;
        }

        const newAppointment: Appointment = {
            id: Math.random().toString(36).substr(2, 9),
            clientId: currentUser.id,
            clientName: currentUser.name,
            techId: selectedTech.id,
            techName: selectedTech.name,
            date: bookingDate,
            time: bookingTime,
            deviceModel: model,
            issueDescription: issue,
            status: AppointmentStatus.CONFIRMED,
            createdAt: new Date().toISOString()
        };

        setAppointments(prev => [newAppointment, ...prev]);

        setTechSchedules(prev => {
            const techSchedule = prev[selectedTech.id] ? [...prev[selectedTech.id]] : [];
            const dayIndex = techSchedule.findIndex(d => d.date === bookingDate);
            if (dayIndex >= 0) {
                const newSlots = techSchedule[dayIndex].slots.map(slot =>
                    slot.time === bookingTime ? { ...slot, isBooked: true } : slot
                );
                techSchedule[dayIndex] = { ...techSchedule[dayIndex], slots: newSlots };
            }
            return { ...prev, [selectedTech.id]: techSchedule };
        });

        setNotification({ msg: 'Agendamento confirmado com sucesso!', type: 'success' });
        setCurrentView('CLIENT_APPOINTMENTS');
    };

    const handleCancelAppointment = (aptId: string, techId: string, date: string, time: string) => {
        // Robustness Check: 24h rule for clients
        if (currentUser?.role === UserRole.CLIENT) {
            const canCancel = checkCanCancel(date, time);
            if (!canCancel) {
                setNotification({ msg: 'Cancelamento não permitido com menos de 24h de antecedência.', type: 'error' });
                return;
            }
        }

        setAppointments(prev => prev.map(a =>
            a.id === aptId ? { ...a, status: AppointmentStatus.CANCELLED } : a
        ));

        setTechSchedules(prev => {
            const techSchedule = prev[techId] ? [...prev[techId]] : [];
            const dayIndex = techSchedule.findIndex(d => d.date === date);
            if (dayIndex >= 0) {
                const newSlots = techSchedule[dayIndex].slots.map(slot =>
                    slot.time === time ? { ...slot, isBooked: false } : slot
                );
                techSchedule[dayIndex] = { ...techSchedule[dayIndex], slots: newSlots };
            }
            return { ...prev, [techId]: techSchedule };
        });

        setNotification({ msg: 'Agendamento cancelado.', type: 'success' });
    };

    const handleCompleteAppointment = (aptId: string) => {
        setAppointments(prev => prev.map(a =>
            a.id === aptId ? { ...a, status: AppointmentStatus.COMPLETED } : a
        ));
        setNotification({ msg: 'Atendimento concluído com sucesso!', type: 'success' });
    };

    const checkCanCancel = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const aptDate = new Date(year, month - 1, day, hours, minutes);
        const now = new Date();
        const diffMs = aptDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours >= 24;
    };

    const handleSubmitReview = (rating: number, comment: string, tags: string[]) => {
        if (!currentUser || !selectedTech) return;

        if (editingReview) {
            setReviews(prev => prev.map(r =>
                r.id === editingReview.id
                    ? { ...r, rating, comment, tags, updatedAt: new Date().toISOString() }
                    : r
            ));

            // Recalculate rating
            const techReviews = reviews.map(r =>
                r.id === editingReview.id
                    ? { ...r, rating }
                    : r
            ).filter(r => r.techId === selectedTech.id);

            const newRating = techReviews.reduce((acc, r) => acc + r.rating, 0) / techReviews.length;

            setUsersDb(prev => prev.map(u =>
                u.id === selectedTech.id ? { ...u, rating: newRating } : u
            ));

            setNotification({ msg: 'Avaliação atualizada com sucesso!', type: 'success' });
            setEditingReview(null);
        } else {
            // Verify eligibility: User must have a COMPLETED appointment with the technician
            const hasCompletedAppointment = appointments.some(
                apt => apt.clientId === currentUser.id &&
                    apt.techId === selectedTech.id &&
                    apt.status === AppointmentStatus.COMPLETED
            );

            if (!hasCompletedAppointment) {
                setNotification({
                    msg: 'Você só pode avaliar técnicos que já te atenderam.',
                    type: 'error'
                });
                return;
            }

            // Check if user already reviewed this tech
            const alreadyReviewed = reviews.some(
                r => r.clientId === currentUser.id && r.techId === selectedTech.id
            );

            if (alreadyReviewed) {
                setNotification({
                    msg: 'Você já avaliou este técnico.',
                    type: 'error'
                });
                return;
            }

            // Create new review
            const newReview: Review = {
                id: Math.random().toString(36).substr(2, 9),
                clientId: currentUser.id,
                clientName: currentUser.name,
                techId: selectedTech.id,
                rating,
                comment,
                tags,
                createdAt: new Date().toISOString()
            };

            const updatedReviews = [...reviews, newReview];
            setReviews(updatedReviews);

            // Update tech rating
            const techReviews = updatedReviews.filter(r => r.techId === selectedTech.id);
            const newRating = techReviews.reduce((acc, r) => acc + r.rating, 0) / techReviews.length;

            setUsersDb(prev => prev.map(u =>
                u.id === selectedTech.id ? { ...u, rating: newRating } : u
            ));

            setNotification({ msg: 'Avaliação enviada com sucesso!', type: 'success' });
        }
        setShowReviewForm(false);
    };

    const handleReplyReview = (reviewId: string, replyText: string) => {
        setReviews(prev => prev.map(r =>
            r.id === reviewId
                ? { ...r, reply: { text: replyText, createdAt: new Date().toISOString() } }
                : r
        ));
        setNotification({ msg: 'Resposta enviada com sucesso!', type: 'success' });
    };

    const handleDeleteReview = (reviewId: string) => {
        if (confirm('Tem certeza que deseja excluir sua avaliação?')) {
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setNotification({ msg: 'Avaliação excluída.', type: 'success' });

            // Recalculate rating would be ideal here too, but for simplicity skipping strict sync for now or doing it:
            // Actually let's do it properly if we can access selectedTech, but selectedTech might not be set if we are deleting from a list?
            // In Client Profile selectedTech is set.
        }
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };


    // Helper components (that use local vars)
    const Header = () => (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2" onClick={() => currentUser?.role === UserRole.CLIENT && setCurrentView('CLIENT_HOME')}>
                <div className="bg-primary-600 p-1.5 rounded-lg shadow-sm">
                    <Smartphone className="text-white" size={20} />
                </div>
                <h1 className="font-bold text-xl tracking-tight text-slate-900 cursor-pointer">TecAgenda</h1>
            </div>
            {currentUser && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCurrentView('SETTINGS')}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                        title="Configurações"
                    >
                        <Settings size={20} />
                    </button>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors" title="Sair">
                        <LogOut size={20} />
                    </button>
                </div>
            )}
        </header>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative text-slate-900">
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-[60] flex items-center gap-2 animate-fade-in-down ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{notification.msg}</span>
                </div>
            )}

            {currentView !== 'LOGIN' && !currentView.startsWith('REGISTER') && <Header />}

            <main className="animate-fade-in">
                {currentView === 'LOGIN' && (
                    <LoginView
                        usersDb={usersDb}
                        onLoginSuccess={handleLoginSuccess}
                        onNavigateRegister={() => setCurrentView('REGISTER_SELECTION')}
                        onError={(msg) => setNotification({ msg, type: 'error' })}
                    />
                )}
                {currentView === 'REGISTER_SELECTION' && (
                    <RegisterSelectionView onNavigate={setCurrentView} />
                )}
                {currentView === 'REGISTER_CLIENT' && (
                    <RegisterClientView
                        onRegister={handleRegister}
                        onBack={() => setCurrentView('REGISTER_SELECTION')}
                    />
                )}
                {currentView === 'REGISTER_TECH' && (
                    <RegisterTechView
                        onRegister={handleRegister}
                        onBack={() => setCurrentView('REGISTER_SELECTION')}
                    />
                )}
                {currentView === 'SETTINGS' && currentUser && (
                    <SettingsView
                        currentUser={currentUser}
                        usersDb={usersDb}
                        onUpdate={handleUpdateProfile}
                        onBack={() => setCurrentView(currentUser.role === UserRole.CLIENT ? 'CLIENT_HOME' : 'TECH_DASHBOARD')}
                    />
                )}

                {currentView === 'CLIENT_HOME' && (
                    <ClientHome
                        usersDb={usersDb}
                        onSelectTech={(id) => {
                            const tech = usersDb.find(u => u.id === id) as Technician;
                            if (tech) {
                                setSelectedTech(tech);
                                setCurrentView('CLIENT_TECH_PROFILE');
                            }
                        }}
                    />
                )}

                {currentView === 'CLIENT_TECH_PROFILE' && selectedTech && (
                    <div className="pb-24 max-w-md mx-auto bg-white min-h-screen">
                        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                            <button onClick={() => setCurrentView('CLIENT_HOME')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="font-semibold text-slate-900">Perfil do Técnico</span>
                        </div>
                        <div className="p-6 pb-0">
                            <div className="flex items-center gap-4 mb-6">
                                {selectedTech.avatarUrl ? (
                                    <img src={selectedTech.avatarUrl} alt={selectedTech.name} className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 border-2 border-white shadow-md">
                                        <UserIcon size={32} />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedTech.name}</h2>
                                    <p className="text-slate-500 text-sm">{selectedTech.address}</p>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="font-semibold text-slate-900 mb-2">Sobre</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{selectedTech.bio || 'Sem descrição disponível.'}</p>
                            </div>
                            <div className="mb-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Horários Disponíveis</h3>
                                <div className="space-y-4">
                                    {(techSchedules[selectedTech.id] || []).map((day) => (
                                        <div key={day.date} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                                            <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium">
                                                <Calendar size={16} />
                                                {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {day.slots.map((slot) => {
                                                    const isDisabled = slot.isBlocked || slot.isBooked;
                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            disabled={isDisabled}
                                                            onClick={() => {
                                                                setBookingDate(day.date);
                                                                setBookingTime(slot.time);
                                                                setCurrentView('CLIENT_BOOKING');
                                                            }}
                                                            className={`
                                                                py-2 rounded-lg text-sm font-medium transition-all
                                                                ${isDisabled
                                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed decoration-slate-400'
                                                                    : 'bg-white border border-primary-200 text-primary-700 shadow-sm hover:bg-primary-600 hover:text-white hover:border-primary-600'
                                                                }
                                                            `}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Avaliações</h3>
                                <ReviewList
                                    reviews={reviews.filter(r => r.techId === selectedTech.id)}
                                    currentUserRole={currentUser?.role}
                                    currentUserId={currentUser?.id}
                                    onEdit={handleEditReview}
                                    onDelete={handleDeleteReview}
                                />
                            </div>

                            {/* Review Form Section */}
                            {currentUser && (() => {
                                const hasCompletedAppointment = appointments.some(
                                    apt => apt.clientId === currentUser.id &&
                                        apt.techId === selectedTech.id &&
                                        apt.status === AppointmentStatus.COMPLETED
                                );
                                const alreadyReviewed = reviews.some(
                                    r => r.clientId === currentUser.id && r.techId === selectedTech.id
                                );

                                if (!hasCompletedAppointment) {
                                    return (
                                        <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                                            <p className="text-sm text-slate-600">
                                                Você poderá avaliar este técnico após ser atendido.
                                            </p>
                                        </div>
                                    );
                                }

                                if (alreadyReviewed) {
                                    return (
                                        <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                                            <p className="text-sm text-green-700 font-medium">
                                                ✓ Você já avaliou este técnico.
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <Button fullWidth onClick={() => {
                                        setEditingReview(null);
                                        setShowReviewForm(!showReviewForm);
                                    }}>
                                        {showReviewForm ? 'Cancelar Avaliação' : 'Avaliar Atendimento'}
                                    </Button>
                                );
                            })()}

                            {showReviewForm && (
                                <div className="mt-4">
                                    <ReviewForm
                                        onSubmit={handleSubmitReview}
                                        onCancel={() => {
                                            setShowReviewForm(false);
                                            setEditingReview(null);
                                        }}
                                        initialData={editingReview ? {
                                            rating: editingReview.rating,
                                            comment: editingReview.comment,
                                            tags: editingReview.tags
                                        } : undefined}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'CLIENT_BOOKING' && (
                    <ClientBooking
                        date={bookingDate}
                        time={bookingTime}
                        onConfirm={handleConfirmBooking}
                        onBack={() => setCurrentView('CLIENT_TECH_PROFILE')}
                    />
                )}

                {currentView === 'CLIENT_APPOINTMENTS' && currentUser && (
                    <div className="pb-24 px-4 pt-6 max-w-md mx-auto min-h-screen relative">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Meus Agendamentos</h2>
                        {appointments.filter(a => a.clientId === currentUser.id).length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="text-slate-400" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Nenhum agendamento</h3>
                                <p className="text-slate-500 mt-1 mb-6">Você ainda não tem serviços agendados.</p>
                                <Button onClick={() => setCurrentView('CLIENT_HOME')}>Buscar Técnico</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.filter(a => a.clientId === currentUser.id).map(apt => {
                                    const canCancel = checkCanCancel(apt.date, apt.time);
                                    return (
                                        <div key={apt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{apt.techName}</h4>
                                                    <p className="text-xs text-slate-500">Técnico</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                                    ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}
                                                `}>
                                                    {apt.status === 'CONFIRMED' ? 'Confirmado' :
                                                        apt.status === 'CANCELLED' ? 'Cancelado' : apt.status}
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-slate-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-primary-500" />
                                                    <span>{new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Smartphone size={16} className="text-primary-500" />
                                                    <span>{apt.deviceModel}</span>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded text-xs italic border border-slate-100">
                                                    "{apt.issueDescription}"
                                                </div>
                                            </div>
                                            {apt.status === 'CONFIRMED' && (
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    size="sm"
                                                    className={`${canCancel ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                                    onClick={() => { if (canCancel) setAppointmentToCancel(apt); }}
                                                    disabled={!canCancel}
                                                >
                                                    {canCancel ? 'Cancelar Agendamento' : 'Cancelamento indisponível (< 24h)'}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {currentView === 'TECH_DASHBOARD' && currentUser && (
                    <TechDashboardImpl
                        currentUser={currentUser}
                        techSchedules={techSchedules}
                        setTechSchedules={setTechSchedules}
                        appointments={appointments}
                        setAppointmentToCancel={setAppointmentToCancel}
                        checkCanCancel={checkCanCancel}
                        reviews={reviews}
                        onReplyReview={handleReplyReview}
                        onCompleteAppointment={handleCompleteAppointment}
                    />
                )}
            </main>

            {currentUser?.role === UserRole.CLIENT && currentView !== 'SETTINGS' && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-around z-40 shadow-lg">
                    <button
                        onClick={() => setCurrentView('CLIENT_HOME')}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${currentView === 'CLIENT_HOME' || currentView === 'CLIENT_TECH_PROFILE' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Search size={24} />
                        <span className="text-xs font-medium mt-1">Buscar</span>
                    </button>
                    <button
                        onClick={() => setCurrentView('CLIENT_APPOINTMENTS')}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${currentView === 'CLIENT_APPOINTMENTS' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <History size={24} />
                        <span className="text-xs font-medium mt-1">Agenda</span>
                    </button>
                </nav>
            )}

            {/* Cancellation Modal */}
            {appointmentToCancel && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Cancelar Agendamento</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => setAppointmentToCancel(null)}
                            >
                                Voltar
                            </Button>
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={() => {
                                    handleCancelAppointment(
                                        appointmentToCancel.id,
                                        appointmentToCancel.techId,
                                        appointmentToCancel.date,
                                        appointmentToCancel.time
                                    );
                                    setAppointmentToCancel(null);
                                }}
                            >
                                Sim, Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Separated Tech Dashboard to keep file cleaner
const TechDashboardImpl = ({ currentUser, techSchedules, setTechSchedules, appointments, setAppointmentToCancel, checkCanCancel, reviews, onReplyReview, onCompleteAppointment }: any) => {
    const [tab, setTab] = useState<'APPOINTMENTS' | 'AGENDA' | 'REVIEWS'>('APPOINTMENTS');
    const techSchedule = techSchedules[currentUser.id] || [];
    const techApts = appointments.filter((a: Appointment) => a.techId === currentUser.id && a.status !== 'CANCELLED');
    const techReviews = reviews.filter((r: Review) => r.techId === currentUser.id);

    const handleToggleSlotBlock = (date: string, time: string) => {
        setTechSchedules((prev: any) => {
            const ts = prev[currentUser.id] ? [...prev[currentUser.id]] : [];
            const dayIndex = ts.findIndex((d: DaySchedule) => d.date === date);
            if (dayIndex >= 0) {
                const newSlots = ts[dayIndex].slots.map((slot: any) =>
                    slot.time === time ? { ...slot, isBlocked: !slot.isBlocked } : slot
                );
                ts[dayIndex] = { ...ts[dayIndex], slots: newSlots };
            }
            return { ...prev, [currentUser.id]: ts };
        });
    };

    return (
        <div className="pb-24 px-4 pt-6 max-w-lg mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Painel do Técnico</h2>
                    <p className="text-slate-500 text-sm">Olá, {currentUser.name}</p>
                </div>
            </div>

            <div className="flex p-1 bg-white border border-slate-200 rounded-xl mb-6">
                <button
                    onClick={() => setTab('APPOINTMENTS')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'APPOINTMENTS' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500'}`}
                >
                    Próximos Serviços
                </button>
                <button
                    onClick={() => setTab('AGENDA')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'AGENDA' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500'}`}
                >
                    Gerenciar Agenda
                </button>
                <button
                    onClick={() => setTab('REVIEWS')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'REVIEWS' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500'}`}
                >
                    Avaliações
                </button>
            </div>

            {tab === 'REVIEWS' ? (
                <div className="space-y-4 animate-fade-in">
                    <ReviewList
                        reviews={techReviews}
                        currentUserRole={UserRole.TECHNICIAN}
                        onReply={(reviewId) => {
                            const text = prompt('Digite sua resposta:');
                            if (text) onReplyReview(reviewId, text);
                        }}
                    />
                </div>
            ) : tab === 'APPOINTMENTS' ? (
                <div className="space-y-4 animate-fade-in">
                    {techApts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <div className="text-slate-400 mb-2">
                                <Calendar size={32} className="mx-auto" />
                            </div>
                            <p className="text-slate-500 font-medium">Não há agendamentos ativos.</p>
                        </div>
                    ) : (
                        techApts.map((apt: Appointment) => {
                            const canCancel = checkCanCancel(apt.date, apt.time);
                            return (
                                <div key={apt.id} className="bg-white p-4 rounded-xl border-l-4 border-primary-500 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-primary-600 uppercase mb-1 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(apt.date).toLocaleDateString('pt-BR')} • {apt.time}
                                            </p>
                                            <h3 className="font-bold text-slate-900">{apt.clientName}</h3>
                                        </div>
                                        <div className="bg-primary-50 p-2 rounded-lg">
                                            <UserIcon size={20} className="text-primary-600" />
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Aparelho</p>
                                            <p className="text-sm font-medium text-slate-700">{apt.deviceModel}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Problema</p>
                                            <p className="text-sm font-medium text-slate-700 truncate" title={apt.issueDescription}>{apt.issueDescription}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-2">
                                        {apt.status === AppointmentStatus.CONFIRMED && (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Confirmar conclusão do atendimento?')) {
                                                        onCompleteAppointment(apt.id);
                                                    }
                                                }}
                                            >
                                                Concluir Atendimento
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            disabled={!canCancel}
                                            className={!canCancel ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400 focus:ring-0' : ''}
                                            onClick={() => setAppointmentToCancel(apt)}
                                        >
                                            {canCancel ? 'Cancelar' : 'Cancelamento Bloqueado (<24h)'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="text-blue-600 shrink-0" size={20} />
                        <p className="text-sm text-blue-800">
                            Toque nos horários para bloquear ou desbloquear sua disponibilidade.
                        </p>
                    </div>

                    {techSchedule.map((day: DaySchedule) => (
                        <div key={day.date}>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
                            </h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {day.slots.map((slot: any) => (
                                    <div key={slot.id} className="relative group">
                                        <button
                                            disabled={slot.isBooked}
                                            onClick={() => handleToggleSlotBlock(day.date, slot.time)}
                                            className={`
                                                w-full py-2 px-1 rounded-lg text-sm font-medium border transition-all duration-200 active:scale-95 transform relative overflow-hidden
                                                ${slot.isBooked
                                                    ? 'bg-green-100 border-green-200 text-green-800 opacity-60 cursor-not-allowed'
                                                    : slot.isBlocked
                                                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 shadow-inner'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            {slot.time}
                                            {slot.isBooked && <span className="block text-[10px] font-bold">AGENDADO</span>}
                                            {slot.isBlocked && !slot.isBooked && <span className="block text-[10px]">BLOQUEADO</span>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};