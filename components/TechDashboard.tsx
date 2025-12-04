import React, { useState } from 'react';
import { User, Appointment, Review, UserRole, DaySchedule, AppointmentStatus } from '../types';
import { Button } from './Button';
import { ReviewList } from './ReviewList';
import { Calendar, Clock, User as UserIcon, AlertCircle } from 'lucide-react';
import { ScheduleManager } from './schedules/ScheduleManager';
import { toggleSlotBlock } from '../core/domainLogic';

interface TechDashboardProps {
    currentUser: User;
    techSchedules: Record<string, DaySchedule[]>;
    setTechSchedules: React.Dispatch<React.SetStateAction<Record<string, DaySchedule[]>>>;
    appointments: Appointment[];
    setAppointmentToCancel: (apt: Appointment) => void;
    checkCanCancel: (date: string, time: string) => boolean;
    reviews: Review[];
    onReplyReview: (reviewId: string, text: string) => void;
    onCompleteAppointment: (aptId: string) => void;
}

export const TechDashboard = ({
    currentUser,
    techSchedules,
    setTechSchedules,
    appointments,
    setAppointmentToCancel,
    checkCanCancel,
    reviews,
    onReplyReview,
    onCompleteAppointment
}: TechDashboardProps) => {
    const [tab, setTab] = useState<'APPOINTMENTS' | 'AGENDA' | 'REVIEWS'>('APPOINTMENTS');
    const techSchedule = techSchedules[currentUser.id] || [];
    const techApts = appointments.filter((a: Appointment) => a.techId === currentUser.id && a.status !== 'CANCELLED');
    const techReviews = reviews.filter((r: Review) => r.techId === currentUser.id);

    const handleToggleSlotBlock = (date: string, time: string) => {
        setTechSchedules((prev) => {
            const techSchedule = prev[currentUser.id] ? [...prev[currentUser.id]] : [];
            const { updatedSchedules } = toggleSlotBlock(techSchedule, date, time);
            return { ...prev, [currentUser.id]: updatedSchedules };
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
            ) : tab === 'AGENDA' ? (
                <ScheduleManager
                    techId={currentUser.id}
                    onScheduleUpdate={async () => {
                        // Recarregar schedules após atualização
                        const { SupabaseService } = await import('../services/SupabaseService');
                        const schedules = await SupabaseService.getSchedules();
                        setTechSchedules(schedules);
                    }}
                />
            ) : null}
        </div>
    );
};
