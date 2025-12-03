import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { AppointmentStatus, UserRole } from '../types';
import { canClientCancel, updateTechScheduleWithBooking } from '../core/domainLogic';
import { SupabaseService } from '../services/SupabaseService';
import { logService } from '../services/LogService';
import { Button } from '../components/Button';
import { Calendar, Smartphone, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

export const ClientAppointments = () => {
    const { user } = useAuth();
    const { appointments, setAppointments, techSchedules, setTechSchedules } = useData();
    const navigate = useNavigate();

    const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null); // storing ID
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const myAppointments = appointments.filter(a => a.clientId === user.id);

    const handleCancel = async () => {
        if (!appointmentToCancel) return;

        const apt = appointments.find(a => a.id === appointmentToCancel);
        if (!apt) return;

        setLoading(true);
        try {
            const techSchedule = techSchedules[apt.techId] || [];
            const { updatedSchedules, updatedDay } = updateTechScheduleWithBooking(
                techSchedule,
                apt.date,
                apt.time,
                false
            );

            await SupabaseService.updateAppointmentStatus(apt.id, AppointmentStatus.CANCELLED);

            if (updatedDay) {
                await SupabaseService.updateSchedule(apt.techId, updatedDay);
            }

            setTechSchedules(prev => ({ ...prev, [apt.techId]: updatedSchedules }));
            setAppointments(prev => prev.map(a =>
                a.id === apt.id ? { ...a, status: AppointmentStatus.CANCELLED } : a
            ));

            logService.warning(
                'APPOINTMENT_CANCELLED',
                user.id,
                user.email,
                { appointmentId: apt.id, techId: apt.techId }
            );
        } catch (error) {
            console.error(error);
            alert('Erro ao cancelar agendamento');
        } finally {
            setLoading(false);
            setAppointmentToCancel(null);
        }
    };

    return (
        <div className="pb-24 px-4 pt-6 max-w-md mx-auto min-h-screen relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Meus Agendamentos</h2>

            {myAppointments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Nenhum agendamento</h3>
                    <p className="text-slate-500 mt-1 mb-6">Você ainda não tem serviços agendados.</p>
                    <Button onClick={() => navigate('/client/home')}>Buscar Técnico</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {myAppointments.map(apt => {
                        const canCancel = canClientCancel(apt.date, apt.time);
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
                                        onClick={() => { if (canCancel) setAppointmentToCancel(apt.id); }}
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

            <ConfirmationModal
                isOpen={!!appointmentToCancel}
                title="Cancelar Agendamento"
                message="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
                confirmLabel="Sim, Cancelar"
                variant="danger"
                onConfirm={handleCancel}
                onCancel={() => setAppointmentToCancel(null)}
                isLoading={loading}
            />
        </div>
    );
};
