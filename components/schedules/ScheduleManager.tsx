import React, { useState } from 'react';
import { WeeklyTemplate } from './WeeklyTemplate';
import { DayBlocker } from './DayBlocker';
import { Button } from '../Button';
import { Calendar, Clock, Ban, Sparkles } from 'lucide-react';

interface ScheduleManagerProps {
    techId: string;
    onScheduleUpdate: () => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ techId, onScheduleUpdate }) => {
    const [tab, setTab] = useState<'template' | 'blocks'>('template');
    const [generating, setGenerating] = useState(false);

    const handleSaveTemplate = () => {
        // Template salvo, pode gerar horários
        setGenerating(false);
    };

    const generateSchedule = async () => {
        if (!confirm('Isso irá gerar seus horários para os próximos 30 dias baseado no seu template. Continuar?')) {
            return;
        }

        try {
            setGenerating(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            const slotsCreated = await SupabaseService.generateScheduleFromTemplate(techId);

            alert(`✅ ${slotsCreated} horários gerados com sucesso!`);
            onScheduleUpdate();
        } catch (error) {
            console.error('Error generating schedule:', error);
            alert('Erro ao gerar horários. Verifique se você configurou seu template semanal.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header com botão de gerar */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-lg mb-1">⚙️ Gerenciamento de Agenda</h3>
                        <p className="text-sm text-primary-100">Configure seus horários de trabalho</p>
                    </div>
                    <Sparkles size={24} className="text-primary-200" />
                </div>

                <Button
                    onClick={generateSchedule}
                    disabled={generating}
                    variant="secondary"
                    size="sm"
                    className="bg-white text-primary-700 hover:bg-primary-50"
                >
                    <Clock size={16} className="mr-2" />
                    {generating ? 'Gerando...' : 'Gerar Próximos 30 Dias'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
                <button
                    onClick={() => setTab('template')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'template'
                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Calendar size={16} />
                    Template Semanal
                </button>
                <button
                    onClick={() => setTab('blocks')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'blocks'
                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Ban size={16} />
                    Bloquear Dias
                </button>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {tab === 'template' ? (
                    <WeeklyTemplate
                        techId={techId}
                        onSave={handleSaveTemplate}
                    />
                ) : (
                    <DayBlocker
                        techId={techId}
                        onUpdate={onScheduleUpdate}
                    />
                )}
            </div>
        </div>
    );
};
