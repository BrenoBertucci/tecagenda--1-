import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Technician, AppointmentStatus } from '../types';
import { isSlotAvailable, createAppointmentObject, updateTechScheduleWithBooking } from '../core/domainLogic';
import { SupabaseService } from '../services/SupabaseService';
import { logService } from '../services/LogService';
import { Button } from '../components/Button';
import { ChevronLeft, Calendar } from 'lucide-react';
import { LoadingOverlay } from '../components/LoadingOverlay';

export const ClientBooking = () => {
    const { techId } = useParams<{ techId: string }>();
    const [searchParams] = useSearchParams();
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const navigate = useNavigate();

    const { user } = useAuth();
    const { usersDb, techSchedules, setTechSchedules, setAppointments } = useData();

    const [deviceModel, setDeviceModel] = useState('');
    const [issueDesc, setIssueDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tech = usersDb.find(u => u.id === techId) as Technician;

    if (!tech || !date || !time) return <div>Dados inválidos para agendamento.</div>;

    const handleConfirm = async () => {
        if (!user) return;
        setError(null);

        const techSchedule = techSchedules[tech.id] || [];

        if (!isSlotAvailable(techSchedule, date, time)) {
            setError('Este horário não está mais disponível. Por favor, escolha outro.');
            return;
        }

        setLoading(true);

        const newAppointment = createAppointmentObject(
            user,
            tech,
            date,
            time,
            deviceModel,
            issueDesc
        );

        try {
            const { updatedSchedules, updatedDay } = updateTechScheduleWithBooking(
                techSchedule,
                date,
                time,
                true
            );

            await SupabaseService.createAppointment(newAppointment);

            if (updatedDay) {
                await SupabaseService.updateSchedule(tech.id, updatedDay);
            }

            setTechSchedules(prev => ({ ...prev, [tech.id]: updatedSchedules }));
            setAppointments(prev => [newAppointment, ...prev]);

            logService.info(
                'APPOINTMENT_CREATED',
                user.id,
                user.email,
                { techId: tech.id, date, time }
            );

            navigate('/client/appointments');
        } catch (error) {
            console.error('Booking error:', error);
            setError('Erro ao confirmar agendamento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
            <LoadingOverlay isVisible={loading} />
            <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <span className="font-semibold text-slate-900">Confirmar Agendamento</span>
            </div>

            <div className="p-6 flex-1">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

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

                <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="space-y-5">
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
                        <Button type="submit" fullWidth size="lg" loading={loading}>
                            Confirmar Agendamento
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
