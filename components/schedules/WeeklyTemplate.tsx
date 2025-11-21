import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Clock, Save, Trash2, Plus } from 'lucide-react';

interface WeeklyTemplateProps {
    techId: string;
    onSave: () => void;
}

interface DayTemplate {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

const DAYS = [
    { value: 0, label: 'Domingo', short: 'Dom' },
    { value: 1, label: 'Segunda', short: 'Seg' },
    { value: 2, label: 'Terça', short: 'Ter' },
    { value: 3, label: 'Quarta', short: 'Qua' },
    { value: 4, label: 'Quinta', short: 'Qui' },
    { value: 5, label: 'Sexta', short: 'Sex' },
    { value: 6, label: 'Sábado', short: 'Sáb' }
];

const PRESETS = {
    commercial: {
        name: 'Comercial (Seg-Sex 8h-18h)',
        days: [1, 2, 3, 4, 5],
        start: '08:00',
        end: '18:00'
    },
    flexible: {
        name: 'Flexível (Seg-Sáb 9h-17h)',
        days: [1, 2, 3, 4, 5, 6],
        start: '09:00',
        end: '17:00'
    }
};

export const WeeklyTemplate: React.FC<WeeklyTemplateProps> = ({ techId, onSave }) => {
    const [templates, setTemplates] = useState<DayTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');

    useEffect(() => {
        loadTemplate();
    }, [techId]);

    const loadTemplate = async () => {
        try {
            setLoading(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            const data = await SupabaseService.getWeeklyTemplate(techId);
            setTemplates(data.map((t: any) => ({
                dayOfWeek: t.day_of_week,
                startTime: t.start_time,
                endTime: t.end_time,
                isActive: t.is_active
            })));
        } catch (error) {
            console.error('Error loading template:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = async (preset: keyof typeof PRESETS) => {
        try {
            setLoading(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            const p = PRESETS[preset];

            for (const day of p.days) {
                await SupabaseService.saveWeeklyTemplate(techId, day, p.start, p.end);
            }

            await loadTemplate();
            onSave();
        } catch (error) {
            console.error('Error applying preset:', error);
            alert('Erro ao aplicar modelo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const saveDayTemplate = async () => {
        if (selectedDay === null) return;

        if (startTime >= endTime) {
            alert('Horário de término deve ser após o horário de início.');
            return;
        }

        try {
            setLoading(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            await SupabaseService.saveWeeklyTemplate(techId, selectedDay, startTime, endTime);
            await loadTemplate();
            setSelectedDay(null);
            onSave();
        } catch (error: any) {
            console.error('Error saving template:', error);
            alert(error.message || 'Erro ao salvar horário. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const removeDayTemplate = async (dayOfWeek: number) => {
        if (!confirm('Remover este dia da agenda?')) return;

        try {
            setLoading(true);
            const { SupabaseService } = await import('../../services/SupabaseService');
            await SupabaseService.deleteWeeklyTemplate(techId, dayOfWeek);
            await loadTemplate();
            onSave();
        } catch (error) {
            console.error('Error removing template:', error);
            alert('Erro ao remover horário. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getDayTemplate = (dayOfWeek: number) => {
        return templates.find(t => t.dayOfWeek === dayOfWeek && t.isActive);
    };

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-xl border border-primary-100">
                <h3 className="font-semibold text-slate-900 mb-3">⚡ Modelos Rápidos</h3>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => applyPreset('commercial')}
                        disabled={loading}
                    >
                        Comercial (Seg-Sex)
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => applyPreset('flexible')}
                        disabled={loading}
                    >
                        Flexível (Seg-Sáb)
                    </Button>
                </div>
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DAYS.map(day => {
                    const template = getDayTemplate(day.value);
                    const isSelected = selectedDay === day.value;

                    return (
                        <button
                            key={day.value}
                            onClick={() => {
                                if (template) {
                                    setStartTime(template.startTime);
                                    setEndTime(template.endTime);
                                }
                                setSelectedDay(day.value);
                            }}
                            className={`
                                p-4 rounded-xl border-2 transition-all text-left
                                ${isSelected
                                    ? 'border-primary-500 bg-primary-50 shadow-md'
                                    : template
                                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-900">{day.short}</div>
                                    <div className="text-xs text-slate-500">{day.label}</div>
                                </div>
                                {template && (
                                    <Clock size={16} className="text-green-600" />
                                )}
                            </div>
                            {template && (
                                <div className="mt-2 text-xs font-medium text-slate-700">
                                    {template.startTime} - {template.endTime}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Editor */}
            {selectedDay !== null && (
                <div className="bg-white p-4 rounded-xl border-2 border-primary-500 shadow-lg animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-900">
                            Configurar {DAYS.find(d => d.value === selectedDay)?.label}
                        </h4>
                        <button
                            onClick={() => setSelectedDay(null)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Início
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Término
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={saveDayTemplate}
                            disabled={loading}
                            className="flex-1"
                        >
                            <Save size={16} className="mr-2" />
                            Salvar
                        </Button>
                        {getDayTemplate(selectedDay) && (
                            <Button
                                variant="danger"
                                onClick={() => removeDayTemplate(selectedDay)}
                                disabled={loading}
                            >
                                <Trash2 size={16} />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                💡 <strong>Dica:</strong> Configure seus horários de trabalho de segunda a domingo. Os horários serão gerados automaticamente para os próximos 30 dias.
            </div>
        </div>
    );
};
