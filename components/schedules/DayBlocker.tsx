import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Calendar, X, Plus } from 'lucide-react';

interface DayBlockerProps {
    techId: string;
    onUpdate: () => void;
}

interface BlockedDay {
    id: string;
    blockDate: string;
    reason: string | null;
}

export const DayBlocker: React.FC<DayBlockerProps> = ({ techId, onUpdate }) => {
    const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBlockedDays();
    }, [techId]);

    const loadBlockedDays = async () => {
        try {
            const { SupabaseService } = await import('../../services/SupabaseService');
            const today = new Date().toISOString().split('T')[0];
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 90);

            const data = await SupabaseService.getDayBlocks(
                techId,
                today,
                futureDate.toISOString().split('T')[0]
            );

            setBlockedDays(data.map((d: any) => ({
                id: d.id,
                blockDate: d.block_date,
                reason: d.reason
            })));
        } catch (error) {
            console.error('Error loading blocked days:', error);
        }
    };

    const blockDay = async () => {
        if (!selectedDate) {
            alert('Selecione uma data.');
            return;
        }

        const date = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) {
            alert('Não é possível bloquear datas no passado.');
            return;
        }

        try {
            setLoading(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            await SupabaseService.blockDay(techId, selectedDate, reason || null);

            await loadBlockedDays();
            setSelectedDate('');
            setReason('');
            onUpdate();
        } catch (error: any) {
            console.error('Error blocking day:', error);
            if (error.message?.includes('unique')) {
                alert('Este dia já está bloqueado.');
            } else {
                alert('Erro ao bloquear dia. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const unblockDay = async (blockDate: string) => {
        if (!confirm('Desbloquear este dia?')) return;

        try {
            setLoading(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            await SupabaseService.unblockDay(techId, blockDate);

            await loadBlockedDays();
            onUpdate();
        } catch (error) {
            console.error('Error unblocking day:', error);
            alert('Erro ao desbloquear dia. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 90);
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="space-y-6">
            {/* Add Block */}
            <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-primary-600" />
                    Bloquear Dia
                </h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            min={getMinDate()}
                            max={getMaxDate()}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Motivo (opcional)
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Férias, Feriado, Compromisso pessoal"
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <Button
                        onClick={blockDay}
                        disabled={loading || !selectedDate}
                        fullWidth
                    >
                        Bloquear Dia
                    </Button>
                </div>
            </div>

            {/* Blocked Days List */}
            <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                    📅 Dias Bloqueados ({blockedDays.length})
                </h3>

                {blockedDays.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                        <Calendar size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500">Nenhum dia bloqueado</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {blockedDays.map((block) => (
                            <div
                                key={block.id}
                                className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-start"
                            >
                                <div>
                                    <div className="font-medium text-slate-900">
                                        {new Date(block.blockDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </div>
                                    {block.reason && (
                                        <div className="text-sm text-slate-600 mt-1">
                                            {block.reason}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => unblockDay(block.blockDate)}
                                    disabled={loading}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Desbloquear"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                💡 <strong>Dica:</strong> Use esta função para marcar férias, feriados ou dias que você não estará disponível. Clientes não poderão agendar nesses dias.
            </div>
        </div>
    );
};
