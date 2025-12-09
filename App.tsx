import React, { useState, useEffect, useRef } from 'react';
import { User, Technician, Appointment, Review, UserRole, AppointmentStatus, DaySchedule, StructuredLog, DbUser } from './types';
import { logService } from './services/LogService';
import { SupabaseService } from './services/SupabaseService';
import {
    isSlotAvailable,
    createAppointmentObject,
    canClientCancel,
    updateTechScheduleWithBooking,
    validateReviewEligibility,
    createReviewObject,
    calculateAverageRating
} from './core/domainLogic';
import { generateMockSchedule } from './constants';
import { Button } from './components/Button';
import {
    Shield, Lock, AlertCircle, User as UserIcon, ArrowLeft,
    Calendar, MapPin, Star, Search, Filter, ChevronLeft,
    Clock, CheckCircle, History, Smartphone, LogOut, Menu, X, FileText, Settings
} from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LoginView } from './components/LoginView';
import { RegisterSelectionView } from './components/RegisterSelectionView';
import { RegisterClientView } from './components/RegisterClientView';
import { RegisterTechView } from './components/RegisterTechView';
import { SettingsView } from './components/SettingsView';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminDashboard } from './components/AdminDashboard';
import { ReviewForm } from './components/ReviewForm';
import { ReviewList } from './components/ReviewList';
import { TermsView, PrivacyView } from './components/LegalDocs';

import { Footer } from './components/Footer';
import { TechDashboard } from './components/TechDashboard';
import { AboutView } from './components/AboutView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ThemeProvider } from './contexts/ThemeContext';
import { FloatingAccessibilityMenu } from './components/FloatingAccessibilityMenu';


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
    | 'TECH_DASHBOARD'
    | 'ADMIN_DASHBOARD'
    | 'ADMIN_LOGIN'
    | 'TERMS'
    | 'PRIVACY'
    | 'ABOUT'




// --- SUB-COMPONENTS (MOVED OUTSIDE APP) ---

// 6. Client Home
const ClientHome = ({ usersDb, onSelectTech }: { usersDb: DbUser[], onSelectTech: (id: string) => void }) => {
    const techs = usersDb.filter(u => u.role === UserRole.TECHNICIAN) as Technician[];

    return (
        <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-main">Encontre um Técnico</h2>
                <p className="text-muted">Profissionais qualificados próximos a você</p>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Buscar por especialidade..."
                    className="w-full pl-10 pr-4 py-3 bg-card text-main placeholder-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-all"
                />
                <Search className="absolute left-3 top-3.5 text-muted" size={20} aria-hidden="true" tabIndex={-1} />
            </div>

            <div className="space-y-4">
                {techs.map(tech => (
                    <div key={tech.id} className="bg-card p-4 rounded-xl border border-subtle shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                            {tech.avatarUrl ? (
                                <img src={tech.avatarUrl} alt={tech.name} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-subtle flex items-center justify-center text-muted">
                                    <UserIcon size={24} />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-main">{tech.name}</h3>
                                    <div className="flex items-center gap-1 bg-warning-bg px-2 py-0.5 rounded text-xs font-medium text-warning-fg">
                                        <Star size={12} className="fill-warning text-warning" />
                                        {tech.rating || 'N/A'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted mt-1">
                                    <MapPin size={14} />
                                    {tech.distance || '? km'} • {tech.address || 'Endereço n/d'}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tech.specialties?.slice(0, 2).map((spec, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-subtle text-secondary rounded-md font-medium">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-subtle flex justify-between items-center">
                            <span className="text-sm font-semibold text-secondary">{tech.priceEstimate || 'Sob consulta'}</span>
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
        <div className="min-h-screen bg-card max-w-md mx-auto flex flex-col">
            <div className="sticky top-0 z-30 bg-card border-b border-subtle px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-hover rounded-full transition-colors" aria-label="Voltar">
                    <ChevronLeft size={24} />
                </button>
                <span className="font-semibold text-main">Confirmar Agendamento</span>
            </div>

            <div className="p-6 flex-1">
                <div className="bg-primary-light p-4 rounded-xl mb-6 flex gap-4 items-center">
                    <div className="bg-primary-light p-3 rounded-full border border-primary/20">
                        <Calendar className="text-primary" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-primary font-medium">Data e Hora</p>
                        <p className="text-lg font-bold text-primary">
                            {new Date(date).toLocaleDateString('pt-BR')} às {time}
                        </p>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onConfirm(deviceModel, issueDesc); }} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Modelo do Aparelho</label>
                        <input
                            required
                            type="text"
                            value={deviceModel}
                            onChange={(e) => setDeviceModel(e.target.value)}
                            placeholder="Ex: iPhone 13 Pro"
                            className="w-full p-3 bg-page text-main border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Descrição do Defeito</label>
                        <textarea
                            required
                            rows={4}
                            value={issueDesc}
                            onChange={(e) => setIssueDesc(e.target.value)}
                            placeholder="Descreva o problema..."
                            className="w-full p-3 bg-page text-main border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
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
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Inner App Component to use Theme Context if needed, or just wrap everything
    // For simplicity, we'll wrap the return JSX


    // Modal states
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [logoutConfirmation, setLogoutConfirmation] = useState<boolean>(false);

    // Session Loading State
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

    // Initialize Data & Session
    useEffect(() => {
        const initApp = async () => {
            try {
                // 1. Check Session
                const user = await SupabaseService.getCurrentUser();

                if (user) {
                    setCurrentUser(user);
                    logService.info('SESSION_RESTORED', user.id, user.email);

                    // Restore last view if available
                    const lastView = localStorage.getItem('lastView') as ViewState;
                    if (lastView && lastView !== 'LOGIN' && !lastView.startsWith('REGISTER')) {
                        setCurrentView(lastView);
                    } else {
                        setCurrentView(user.role === UserRole.CLIENT ? 'CLIENT_HOME' : user.role === UserRole.ADMIN ? 'ADMIN_DASHBOARD' : 'TECH_DASHBOARD');
                    }
                }

                // 2. Fetch Data (only if we have a user or just generic data if needed, 
                // but original code fetched everything. We keep it consistent but maybe optimize later)
                // For now, let's fetch data regardless to ensure app is ready, or maybe only if user exists?
                // The original code fetched everything on mount. Let's keep it but handle loading correctly.

                setIsLoading(true);
                const [users, apts, revs, schedules] = await Promise.all([
                    SupabaseService.getUsers(),
                    SupabaseService.getAppointments(),
                    SupabaseService.getReviews(),
                    SupabaseService.getSchedules()
                ]);

                setUsersDb(users as DbUser[]);
                setAppointments(apts);
                setReviews(revs);
                setTechSchedules(schedules);

                logService.info('APP_INITIALIZED', undefined, undefined, { version: '1.0.0', source: 'Supabase' });
            } catch (error) {
                console.error('Error initializing app:', error);
                setNotification({ msg: 'Erro ao carregar dados do servidor.', type: 'error' });
            } finally {
                setIsLoading(false);
                setIsSessionLoading(false); // Session check done
            }
        };

        initApp();
        logService.initialize();
    }, []);

    // Persist View
    useEffect(() => {
        if (currentView !== 'LOGIN' && !currentView.startsWith('REGISTER')) {
            localStorage.setItem('lastView', currentView);
        }
    }, [currentView]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // -- Logic Handlers --

    const handleLogin = async (email: string, pass: string) => {
        try {
            setIsLoading(true);
            const user = await SupabaseService.signIn(email, pass);

            setCurrentUser(user);
            logService.info('LOGIN_SUCCESS', user.id, user.email);

            setCurrentView(user.role === UserRole.CLIENT ? 'CLIENT_HOME' : user.role === UserRole.ADMIN ? 'ADMIN_DASHBOARD' : 'TECH_DASHBOARD');
        } catch (error) {
            console.error('Login error:', error);
            setNotification({ msg: 'Email ou senha incorretos.', type: 'error' });
            logService.warning('LOGIN_FAILED', undefined, email);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (newUser: DbUser) => {
        try {
            setIsLoading(true);
            console.log('🔵 Iniciando registro:', { email: newUser.email, role: newUser.role });

            if (!newUser.password) throw new Error('Password required');

            await SupabaseService.signUp(newUser.email, newUser.password, newUser);

            console.log('✅ Registro bem-sucedido!');
            setNotification({ msg: 'Conta criada com sucesso! Faça login.', type: 'success' });
            setCurrentView('LOGIN');
        } catch (error: any) {
            console.error('❌ ERRO NO REGISTRO:');
            console.error('Mensagem:', error?.message);
            console.error('Código:', error?.code);
            console.error('Status:', error?.status);
            console.error('Erro completo:', error);

            let errorMsg = 'Erro ao criar conta. ';
            if (error?.message) {
                errorMsg += error.message;
            }

            setNotification({ msg: errorMsg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setLogoutConfirmation(false);
        try {
            setIsLoading(true);
            await SupabaseService.signOut();
            setCurrentUser(null);
            setCurrentView('LOGIN');
            localStorage.removeItem('lastView'); // Clear saved view
            logService.info('LOGOUT', currentUser?.id, currentUser?.email);
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleResolveDispute = (appointmentId: string, resolution: 'COMPLETED' | 'CANCELLED') => {
        logService.warning(
            'DISPUTE_RESOLVED',
            currentUser?.id,
            currentUser?.email,
            { appointmentId, resolution }
        );
        setAppointments(prev => prev.map(apt => {
            if (apt.id === appointmentId) {
                return { ...apt, status: AppointmentStatus[resolution] };
            }
            return apt;
        }));
        setNotification({
            msg: `Disputa resolvida: Serviço ${resolution === 'COMPLETED' ? 'Validado' : 'Cancelado'}`,
            type: 'success'
        });
    };

    const handleUpdateProfile = async (updatedData: Partial<User & Technician>) => {
        if (!currentUser) return;

        try {
            setIsLoading(true);
            const newSessionUser = { ...currentUser, ...updatedData };

            await SupabaseService.updateUser(newSessionUser as User);

            setCurrentUser(newSessionUser as User);
            setUsersDb(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
            setNotification({ msg: 'Perfil atualizado!', type: 'success' });
            logService.info('PROFILE_UPDATED', currentUser.id, currentUser.email, { fields: Object.keys(updatedData) });
        } catch (error) {
            console.error('Update profile error:', error);
            setNotification({ msg: 'Erro ao atualizar perfil.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check for admin URL param
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true') {
            setCurrentView('ADMIN_LOGIN');
        }
    }, []);

    const handleConfirmBooking = async (model: string, issue: string) => {
        if (!selectedTech || !currentUser) return;

        const techSchedule = techSchedules[selectedTech.id] || [];

        if (!isSlotAvailable(techSchedule, bookingDate, bookingTime)) {
            setNotification({ msg: 'Este horário não está mais disponível. Por favor, escolha outro.', type: 'error' });
            return;
        }

        const newAppointment = createAppointmentObject(
            currentUser,
            selectedTech,
            bookingDate,
            bookingTime,
            model,
            issue
        );

        try {
            // Calculate new schedule locally
            const { updatedSchedules, updatedDay } = updateTechScheduleWithBooking(
                techSchedule,
                bookingDate,
                bookingTime,
                true
            );

            setIsLoading(true);
            await SupabaseService.createAppointment(newAppointment);

            if (updatedDay) {
                await SupabaseService.updateSchedule(selectedTech.id, updatedDay);
            }

            setTechSchedules(prev => ({ ...prev, [selectedTech.id]: updatedSchedules }));
            setAppointments(prev => [newAppointment, ...prev]);
            setNotification({ msg: 'Agendamento confirmado com sucesso!', type: 'success' });
            setCurrentView('CLIENT_APPOINTMENTS');

            logService.info(
                'APPOINTMENT_CREATED',
                currentUser.id,
                currentUser.email,
                { techId: selectedTech.id, date: bookingDate, time: bookingTime }
            );
        } catch (error: any) {
            console.error('Booking error:', error);
            const msg = error?.message || 'Erro ao confirmar agendamento.';
            setNotification({ msg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelAppointment = async (aptId: string, techId: string, date: string, time: string) => {
        // Robustness Check: 24h rule for clients
        if (currentUser?.role === UserRole.CLIENT) {
            if (!canClientCancel(date, time)) {
                setNotification({ msg: 'Cancelamento não permitido com menos de 24h de antecedência.', type: 'error' });
                return;
            }
        }

        try {
            const techSchedule = techSchedules[techId] || [];
            const { updatedSchedules, updatedDay } = updateTechScheduleWithBooking(
                techSchedule,
                date,
                time,
                false
            );

            setIsLoading(true);
            await SupabaseService.updateAppointmentStatus(aptId, AppointmentStatus.CANCELLED);

            if (updatedDay) {
                await SupabaseService.updateSchedule(techId, updatedDay);
            }

            setTechSchedules(prev => ({ ...prev, [techId]: updatedSchedules }));

            setAppointments(prev => prev.map(a =>
                a.id === aptId ? { ...a, status: AppointmentStatus.CANCELLED } : a
            ));

            setNotification({ msg: 'Agendamento cancelado.', type: 'success' });

            logService.warning(
                'APPOINTMENT_CANCELLED',
                currentUser?.id,
                currentUser?.email,
                { appointmentId: aptId, techId, date, time }
            );
        } catch (error: any) {
            console.error('Cancel error:', error);
            const msg = error?.message || 'Erro ao cancelar agendamento.';
            setNotification({ msg, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteAppointment = async (aptId: string) => {
        try {
            await SupabaseService.updateAppointmentStatus(aptId, AppointmentStatus.COMPLETED);
            setAppointments(prev => prev.map(a =>
                a.id === aptId ? { ...a, status: AppointmentStatus.COMPLETED } : a
            ));
            setNotification({ msg: 'Atendimento concluído com sucesso!', type: 'success' });
            logService.info('APPOINTMENT_COMPLETED', currentUser?.id, currentUser?.email, { appointmentId: aptId });
        } catch (error) {
            setNotification({ msg: 'Erro ao atualizar status.', type: 'error' });
        }
    };

    const handleReportIssue = async (aptId: string, reason: string) => {
        try {
            await SupabaseService.updateAppointmentStatus(aptId, AppointmentStatus.DISPUTED, reason);
            setAppointments(prev => prev.map(a =>
                a.id === aptId ? { ...a, status: AppointmentStatus.DISPUTED, issueDescription: reason } : a
            ));
            setNotification({ msg: 'Problema reportado. Entraremos em contato.', type: 'info' });
            logService.error('ISSUE_REPORTED', currentUser?.id, currentUser?.email, { appointmentId: aptId, reason });
        } catch (error) {
            setNotification({ msg: 'Erro ao reportar problema.', type: 'error' });
        }
    };

    const handleReportNoShow = async (aptId: string) => {
        try {
            await SupabaseService.updateAppointmentStatus(aptId, AppointmentStatus.NO_SHOW);
            setAppointments(prev => prev.map(a =>
                a.id === aptId ? { ...a, status: AppointmentStatus.NO_SHOW } : a
            ));
            setNotification({ msg: 'No-show registrado.', type: 'info' });
            logService.warning('NO_SHOW_REPORTED', currentUser?.id, currentUser?.email, { appointmentId: aptId });
        } catch (error) {
            setNotification({ msg: 'Erro ao registrar no-show.', type: 'error' });
        }
    };

    const checkCanCancel = (dateStr: string, timeStr: string) => {
        return canClientCancel(dateStr, timeStr);
    };

    const handleSubmitReview = async (rating: number, comment: string, tags: string[]) => {
        if (!currentUser || !selectedTech) return;

        try {
            setIsLoading(true);
            let updatedReviews = [...reviews];
            let reviewToProcess: Review;

            if (editingReview) {
                reviewToProcess = {
                    ...editingReview,
                    rating,
                    comment,
                    tags,
                    updatedAt: new Date().toISOString()
                };

                await SupabaseService.updateReview(reviewToProcess);
                updatedReviews = reviews.map(r => r.id === editingReview.id ? reviewToProcess : r);
                setEditingReview(null);
                setNotification({ msg: 'Avaliação atualizada com sucesso!', type: 'success' });

            } else {
                const eligibility = validateReviewEligibility(appointments, reviews, currentUser.id, selectedTech.id);
                if (!eligibility.allowed) {
                    setNotification({ msg: eligibility.reason || 'Erro na validação.', type: 'error' });
                    return;
                }

                reviewToProcess = createReviewObject(currentUser, selectedTech.id, rating, comment, tags);

                await SupabaseService.createReview(reviewToProcess);
                updatedReviews = [...reviews, reviewToProcess];
                setNotification({ msg: 'Avaliação enviada com sucesso!', type: 'success' });
            }

            setReviews(updatedReviews);

            // Recalculate rating
            const techReviews = updatedReviews.filter(r => r.techId === selectedTech.id);
            const newRating = calculateAverageRating(techReviews);
            const updatedTech = { ...selectedTech, rating: newRating };

            await SupabaseService.updateUser(updatedTech);
            setUsersDb(prev => prev.map(u => u.id === selectedTech.id ? { ...u, rating: newRating } : u));
            setShowReviewForm(false);

        } catch (error) {
            console.error('Review error:', error);
            setNotification({ msg: 'Erro ao salvar avaliação.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReplyReview = async (reviewId: string, replyText: string) => {
        try {
            const review = reviews.find(r => r.id === reviewId);
            if (review) {
                const updatedReview = {
                    ...review,
                    reply: { text: replyText, createdAt: new Date().toISOString() }
                };
                await SupabaseService.updateReview(updatedReview);

                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? updatedReview : r
                ));
                setNotification({ msg: 'Resposta enviada com sucesso!', type: 'success' });
            }
        } catch (error) {
            setNotification({ msg: 'Erro ao enviar resposta.', type: 'error' });
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        setReviewToDelete(reviewId);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            setIsLoading(true);
            await SupabaseService.deleteReview(reviewToDelete);
            setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
            setNotification({ msg: 'Avaliação excluída.', type: 'success' });
        } catch (error) {
            setNotification({ msg: 'Erro ao excluir avaliação.', type: 'error' });
        } finally {
            setIsLoading(false);
            setReviewToDelete(null);
        }
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };


    // Helper components (that use local vars)
    const ActionRequiredBanner = ({ appointments, currentUser, onConfirm, onReportIssue, onReportNoShow }: any) => {
        const pendingActionApts = appointments.filter((apt: Appointment) => {
            if (apt.status !== AppointmentStatus.CONFIRMED) return false;

            const [year, month, day] = apt.date.split('-').map(Number);
            const [hours, minutes] = apt.time.split(':').map(Number);
            const aptDate = new Date(year, month - 1, day, hours, minutes);
            const now = new Date();

            // Check if appointment time has passed
            return now > aptDate;
        });

        if (pendingActionApts.length === 0) return null;

        const apt = pendingActionApts[0]; // Handle one at a time
        const isClient = currentUser.role === UserRole.CLIENT;

        return (
            <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
                <div className="bg-card rounded-xl shadow-2xl border border-warning-bg p-4 max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                        <div className="bg-warning-bg p-2 rounded-full shrink-0">
                            <AlertCircle className="text-warning-fg" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-main">Confirmação Pendente</h3>
                            <p className="text-sm text-muted mt-1">
                                O agendamento de <strong>{apt.date} às {apt.time}</strong> foi realizado?
                            </p>
                            <div className="flex gap-2 mt-3">
                                <Button size="sm" onClick={() => onConfirm(apt.id)}>
                                    Sim, Concluído
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => {
                                    if (isClient) {
                                        const reason = prompt('Qual foi o problema?');
                                        if (reason) onReportIssue(apt.id, reason);
                                    } else {
                                        if (confirm('O cliente não compareceu?')) {
                                            onReportNoShow(apt.id);
                                        }
                                    }
                                }}>
                                    {isClient ? 'Não, tive um problema' : 'Não, Cliente não foi'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const Header = () => (
        <header className="bg-card border-b border-border sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm transition-colors">
            <div className="flex items-center gap-2" onClick={() => currentUser?.role === UserRole.CLIENT && setCurrentView('CLIENT_HOME')}>
                <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                    <Smartphone className="text-inverted" size={20} />
                </div>
                <h1 className="font-bold text-xl tracking-tight text-main cursor-pointer">TecAgenda</h1>
            </div>
            {currentUser && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCurrentView('SETTINGS')}
                        className="p-2 text-muted hover:bg-hover rounded-full transition-colors"
                        title="Configurações"
                        aria-label="Configurações"
                    >
                        <Settings size={20} />
                    </button>
                    <button onClick={() => setLogoutConfirmation(true)} className="text-muted hover:text-error transition-colors" title="Sair" aria-label="Sair">
                        <LogOut size={20} />
                    </button>
                </div>
            )}
        </header>
    );

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-page font-sans relative text-main pb-safe transition-colors">
                <SpeedInsights />
                <FloatingAccessibilityMenu />
                {currentUser && (
                    <ActionRequiredBanner
                        appointments={appointments.filter(a =>
                            currentUser.role === UserRole.CLIENT ? a.clientId === currentUser.id : a.techId === currentUser.id
                        )}
                        currentUser={currentUser}
                        onConfirm={handleCompleteAppointment}
                        onReportIssue={handleReportIssue}
                        onReportNoShow={handleReportNoShow}
                    />
                )}

                {/* Notification Toast */}
                {
                    notification && (
                        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-[60] flex items-center gap-2 animate-fade-in-down ${notification.type === 'success' ? 'bg-success text-inverted' : 'bg-error text-inverted'
                            }`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{notification.msg}</span>
                        </div>
                    )
                }

                {currentView !== 'LOGIN' && !currentView.startsWith('REGISTER') && <Header />}

                <main className="animate-fade-in">
                    {currentView === 'LOGIN' && (
                        <LoginView
                            onLogin={handleLogin}
                            onNavigateRegister={() => setCurrentView('REGISTER_SELECTION')}
                            onError={(msg) => setNotification({ msg, type: 'error' })}
                            setCurrentUser={setCurrentUser}
                            setCurrentView={setCurrentView}
                            setNotification={setNotification}
                        />
                    )}
                    {currentView === 'ADMIN_LOGIN' && (
                        <AdminLoginView
                            onLoginSuccess={(user) => {
                                setCurrentUser(user);
                                setCurrentView('ADMIN_DASHBOARD');
                            }}
                            onBack={() => setCurrentView('LOGIN')}
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
                    {currentView === 'ABOUT' && (
                        <AboutView onBack={() => setCurrentView('LOGIN')} />
                    )}



                    {currentView === 'SETTINGS' && currentUser && (
                        <SettingsView
                            currentUser={currentUser}
                            usersDb={usersDb}
                            onUpdate={handleUpdateProfile}
                            onDeleteRequest={() => {
                                logService.critical('DATA_DELETION_REQUEST', currentUser.id, currentUser.email, { reason: 'LGPD user request' });
                                alert('Sua solicitação foi recebida. Seus dados serão excluídos em até 15 dias conforme a LGPD.');
                                handleLogout();
                            }}
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
                                <button onClick={() => setCurrentView('CLIENT_HOME')} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Voltar">
                                    <ChevronLeft size={24} />
                                </button>
                                <span className="font-semibold text-slate-900">Perfil do Técnico</span>
                            </div>
                            <div className="p-6 pb-0">
                                <div className="flex items-center gap-4 mb-6">
                                    {selectedTech.avatarUrl ? (
                                        <img src={selectedTech.avatarUrl} alt={selectedTech.name} className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white shadow-md">
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
                                        <Calendar className="text-slate-500" size={32} />
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
                                            <div key={apt.id} className="bg-card p-4 rounded-xl border border-subtle shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-main">{apt.techName}</h4>
                                                        <p className="text-xs text-muted">Técnico</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                                    ${apt.status === 'CONFIRMED' ? 'bg-success-bg text-success-fg' :
                                                            apt.status === 'CANCELLED' ? 'bg-error-bg text-error-fg' : 'bg-subtle text-muted'}
                                                `}>
                                                        {apt.status === 'CONFIRMED' ? 'Confirmado' :
                                                            apt.status === 'CANCELLED' ? 'Cancelado' : apt.status}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm text-secondary mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} className="text-primary" />
                                                        <span>{new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone size={16} className="text-primary" />
                                                        <span>{apt.deviceModel}</span>
                                                    </div>
                                                    <div className="bg-subtle p-2 rounded text-xs italic border border-border">
                                                        "{apt.issueDescription}"
                                                    </div>
                                                </div>
                                                {apt.status === 'CONFIRMED' && (
                                                    <Button
                                                        variant="secondary"
                                                        fullWidth
                                                        size="sm"
                                                        className={`${canCancel ? 'text-error border-error-bg hover:bg-error-bg' : 'text-muted border-border bg-subtle cursor-not-allowed'}`}
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
                        <TechDashboard
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

                {
                    currentView === 'ADMIN_DASHBOARD' && (
                        <AdminDashboard
                            users={usersDb}
                            appointments={appointments}
                            reviews={reviews}
                            logService={logService}
                            onLogout={handleLogout}
                            onResolveDispute={handleResolveDispute}
                        />
                    )
                }

                {currentView === 'TERMS' && <TermsView onBack={() => setCurrentView(currentUser ? 'SETTINGS' : 'LOGIN')} />}
                {currentView === 'PRIVACY' && <PrivacyView onBack={() => setCurrentView(currentUser ? 'SETTINGS' : 'LOGIN')} />}

                {/* Global Footer (visible on most pages) */}
                {
                    !['LOGIN', 'ADMIN_LOGIN', 'REGISTER_SELECTION', 'REGISTER_CLIENT', 'REGISTER_TECH'].includes(currentView) && (
                        <Footer onNavigate={setCurrentView} />
                    )
                }
                {/* Special lightweight footer for auth pages if needed, or just omit */}
                {
                    ['LOGIN', 'REGISTER_SELECTION'].includes(currentView) && (
                        <div className="py-4 text-center text-xs text-slate-600">
                            <button onClick={() => setCurrentView('TERMS')} className="hover:underline mr-4">Termos de Uso</button>
                            <button onClick={() => setCurrentView('PRIVACY')} className="hover:underline">Política de Privacidade</button>
                        </div>
                    )
                }

                {
                    currentUser?.role === UserRole.CLIENT && currentView !== 'SETTINGS' && (
                        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe pt-2 px-6 flex justify-around z-40 shadow-lg transition-colors">
                            <button
                                onClick={() => setCurrentView('CLIENT_HOME')}
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${currentView === 'CLIENT_HOME' || currentView === 'CLIENT_TECH_PROFILE' ? 'text-primary' : 'text-muted hover:text-main'}`}
                            >
                                <Search size={24} />
                                <span className="text-xs font-medium mt-1">Buscar</span>
                            </button>
                            <button
                                onClick={() => setCurrentView('CLIENT_APPOINTMENTS')}
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${currentView === 'CLIENT_APPOINTMENTS' ? 'text-primary' : 'text-muted hover:text-main'}`}
                            >
                                <History size={24} />
                                <span className="text-xs font-medium mt-1">Agenda</span>
                            </button>
                        </nav>
                    )
                }

                {/* Global Loading Overlay */}
                <LoadingOverlay isVisible={isSessionLoading || (isLoading && (currentView === 'LOGIN' || currentView.startsWith('REGISTER')))} />

                {/* Modals */}
                <ConfirmationModal
                    isOpen={!!appointmentToCancel}
                    title="Cancelar Agendamento"
                    message="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
                    confirmLabel="Sim, Cancelar"
                    variant="danger"
                    onCancel={() => setAppointmentToCancel(null)}
                    onConfirm={() => {
                        if (appointmentToCancel) {
                            handleCancelAppointment(
                                appointmentToCancel.id,
                                appointmentToCancel.techId,
                                appointmentToCancel.date,
                                appointmentToCancel.time
                            );
                            setAppointmentToCancel(null);
                        }
                    }}
                    isLoading={isLoading}
                />

                <ConfirmationModal
                    isOpen={!!reviewToDelete}
                    title="Excluir Avaliação"
                    message="Tem certeza que deseja excluir sua avaliação permanentemente?"
                    confirmLabel="Excluir"
                    variant="danger"
                    onCancel={() => setReviewToDelete(null)}
                    onConfirm={confirmDeleteReview}
                    isLoading={isLoading}
                />

                <ConfirmationModal
                    isOpen={logoutConfirmation}
                    title="Sair do Sistema"
                    message="Deseja realmente sair da sua conta?"
                    confirmLabel="Sair"
                    variant="primary"
                    onCancel={() => setLogoutConfirmation(false)}
                    onConfirm={handleLogout}
                />

            </div >
        </ThemeProvider >
    );
}
