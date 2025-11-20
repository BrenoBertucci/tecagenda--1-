import React, { useState, useEffect } from 'react';
import { User, Technician, Appointment, Review, UserRole, AppointmentStatus, StructuredLog, LogLevel } from '../types';
import { Users, Calendar, Star, Shield, Trash2, Ban, FileText, Download, Filter as FilterIcon, Search } from 'lucide-react';
import { Button } from './Button';
import type { LogService } from '../services/LogService';

interface AdminDashboardProps {
    users: (User | Technician)[];
    appointments: Appointment[];
    reviews: Review[];
    logService: LogService;
    onLogout: () => void;
    onResolveDispute: (id: string, resolution: 'COMPLETED' | 'CANCELLED') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, appointments, reviews, logService, onLogout, onResolveDispute }) => {
    const [tab, setTab] = useState<'OVERVIEW' | 'USERS' | 'APPOINTMENTS' | 'CONFLICTS' | 'LOGS'>('OVERVIEW');
    const [logs, setLogs] = useState<StructuredLog[]>([]);
    const [logStats, setLogStats] = useState<any>(null);
    const [logFilter, setLogFilter] = useState<LogLevel | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const clients = users.filter(u => u.role === UserRole.CLIENT);
    const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);
    const totalRevenueMock = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length * 150;

    const disputes = appointments.filter(a => a.status === AppointmentStatus.DISPUTED);
    const completedCount = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const peaceScore = Math.max(0, 100 - (disputes.length * 20));

    useEffect(() => {
        if (tab === 'LOGS') {
            loadLogs();
        }
    }, [tab]);

    const loadLogs = async () => {
        try {
            const decryptedLogs = await logService.getLogs();
            setLogs(decryptedLogs);
            const stats = await logService.getStatistics();
            setLogStats(stats);
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    };

    React.useEffect(() => {
        if (disputes.length > 0) {
            setTab('CONFLICTS');
        }
    }, [disputes.length]);

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight">Painel do Mediador</h1>
                        <p className="text-xs text-slate-400">Controle Master • {peaceScore}% Harmonia</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={onLogout} size="sm">Sair</Button>
            </header>

            <div className="max-w-6xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setTab('CONFLICTS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${tab === 'CONFLICTS' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        <Shield size={18} />
                        Conflitos
                        {disputes.length > 0 && (
                            <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                                {disputes.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('OVERVIEW')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setTab('USERS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'USERS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => setTab('APPOINTMENTS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'APPOINTMENTS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Agendamentos
                    </button>
                    <button
                        onClick={() => setTab('LOGS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'LOGS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Logs do Sistema
                    </button>
                </div>

                {/* Content */}
                {tab === 'CONFLICTS' && (
                    <div className="space-y-6 animate-fade-in">
                        {disputes.length === 0 ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
                                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield size={40} className="text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-800 mb-2">Sistema em Harmonia</h3>
                                <p className="text-green-700">Não há conflitos ativos no momento. Bom trabalho, Mediador!</p>
                            </div>
                        ) : (
                            disputes.map(apt => (
                                <div key={apt.id} className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 overflow-hidden">
                                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-100 p-2 rounded-lg">
                                                <Ban className="text-red-600" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-red-900">Disputa em Aberto</h3>
                                                <p className="text-xs text-red-700">ID: {apt.id}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold uppercase">
                                            Ação Necessária
                                        </span>
                                    </div>
                                    <div className="p-6 grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Detalhes do Conflito</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-slate-500">Cliente</span>
                                                    <span className="font-medium text-slate-900">{apt.clientName}</span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-slate-500">Técnico</span>
                                                    <span className="font-medium text-slate-900">{apt.techName}</span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-slate-500">Serviço</span>
                                                    <span className="font-medium text-slate-900">{apt.deviceModel} - {apt.issueDescription}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center space-y-3">
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Decisão do Mediador</h4>
                                            <Button
                                                onClick={() => {
                                                    if (confirm('Confirmar que o serviço foi REALIZADO? O valor será liberado para o técnico.')) {
                                                        onResolveDispute(apt.id, 'COMPLETED');
                                                    }
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white w-full justify-center"
                                            >
                                                ✅ Validar Serviço (Favor do Técnico)
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (confirm('Confirmar CANCELAMENTO? O valor será estornado para o cliente.')) {
                                                        onResolveDispute(apt.id, 'CANCELLED');
                                                    }
                                                }}
                                                variant="danger"
                                                className="w-full justify-center"
                                            >
                                                ❌ Cancelar & Reembolsar (Favor do Cliente)
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'LOGS' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Data/Hora</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Ação</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Usuário</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            Nenhum registro de atividade encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.userName || 'Sistema'}
                                                {log.userId && <span className="text-xs text-slate-400 block">{log.userId}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={log.details}>
                                                {log.details || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 font-medium">Total de Usuários</h3>
                                <Users className="text-blue-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                            <div className="mt-2 text-sm text-slate-500">
                                {clients.length} Clientes • {technicians.length} Técnicos
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 font-medium">Agendamentos</h3>
                                <Calendar className="text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                            <div className="mt-2 text-sm text-slate-500">
                                {appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length} Concluídos
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 font-medium">Receita Estimada</h3>
                                <Star className="text-amber-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">R$ {totalRevenueMock.toFixed(2)}</p>
                            <div className="mt-2 text-sm text-slate-500">
                                Baseado em atendimentos concluídos
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'USERS' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Nome</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Email</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Tipo</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === UserRole.TECHNICIAN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button className="text-red-500 hover:text-red-700 transition-colors" title="Banir Usuário">
                                                <Ban size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};