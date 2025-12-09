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
        <div className="min-h-screen bg-page font-sans text-main">
            <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-error p-2 rounded-lg">
                        <Shield size={24} className="text-inverted" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight text-main">Painel do Mediador</h1>
                        <p className="text-xs text-muted">Controle Master • {peaceScore}% Harmonia</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={onLogout} size="sm">Sair</Button>
            </header>

            <div className="max-w-6xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setTab('CONFLICTS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${tab === 'CONFLICTS' ? 'bg-error text-inverted shadow-lg shadow-error/20' : 'bg-card text-muted hover:bg-subtle'}`}
                    >
                        <Shield size={18} />
                        Conflitos
                        {disputes.length > 0 && (
                            <span className="bg-page text-error px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                                {disputes.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('OVERVIEW')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'OVERVIEW' ? 'bg-primary text-inverted shadow-lg' : 'bg-card text-muted hover:bg-subtle'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setTab('USERS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'USERS' ? 'bg-primary text-inverted shadow-lg' : 'bg-card text-muted hover:bg-subtle'}`}
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => setTab('APPOINTMENTS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'APPOINTMENTS' ? 'bg-primary text-inverted shadow-lg' : 'bg-card text-muted hover:bg-subtle'}`}
                    >
                        Agendamentos
                    </button>
                    <button
                        onClick={() => setTab('LOGS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${tab === 'LOGS' ? 'bg-primary text-inverted shadow-lg' : 'bg-card text-muted hover:bg-subtle'}`}
                    >
                        Logs do Sistema
                    </button>
                </div>

                {/* Content */}
                {tab === 'CONFLICTS' && (
                    <div className="space-y-6 animate-fade-in">
                        {disputes.length === 0 ? (
                            <div className="bg-success-bg border border-success-fg/20 rounded-xl p-12 text-center">
                                <div className="bg-success-bg w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success-fg/20">
                                    <Shield size={40} className="text-success" />
                                </div>
                                <h3 className="text-2xl font-bold text-success-fg mb-2">Sistema em Harmonia</h3>
                                <p className="text-success-fg/80">Não há conflitos ativos no momento. Bom trabalho, Mediador!</p>
                            </div>
                        ) : (
                            disputes.map(apt => (
                                <div key={apt.id} className="bg-card rounded-xl shadow-lg border-l-4 border-error overflow-hidden">
                                    <div className="bg-error-bg px-6 py-4 border-b border-error-bg/50 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-error-bg p-2 rounded-lg border border-error/20">
                                                <Ban className="text-error" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-error-fg">Disputa em Aberto</h3>
                                                <p className="text-xs text-error-fg/80">ID: {apt.id}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-error-bg border border-error/20 text-error-fg rounded-full text-xs font-bold uppercase">
                                            Ação Necessária
                                        </span>
                                    </div>
                                    <div className="p-6 grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Detalhes do Conflito</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between p-3 bg-subtle rounded-lg">
                                                    <span className="text-muted">Cliente</span>
                                                    <span className="font-medium text-main">{apt.clientName}</span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-subtle rounded-lg">
                                                    <span className="text-muted">Técnico</span>
                                                    <span className="font-medium text-main">{apt.techName}</span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-subtle rounded-lg">
                                                    <span className="text-muted">Serviço</span>
                                                    <span className="font-medium text-main">{apt.deviceModel} - {apt.issueDescription}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center space-y-3">
                                            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Decisão do Mediador</h4>
                                            <Button
                                                onClick={() => {
                                                    if (confirm('Confirmar que o serviço foi REALIZADO? O valor será liberado para o técnico.')) {
                                                        onResolveDispute(apt.id, 'COMPLETED');
                                                    }
                                                }}
                                                className="bg-success hover:bg-success-fg text-inverted w-full justify-center"
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
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
                        <table className="w-full text-left">
                            <thead className="bg-subtle border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Data/Hora</th>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Ação</th>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Usuário</th>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted">
                                            Nenhum registro de atividade encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-subtle/50">
                                            <td className="px-6 py-4 text-sm text-muted font-mono">
                                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-main">
                                                <span className="bg-subtle px-2 py-1 rounded text-xs border border-border">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary">
                                                {log.userName || 'Sistema'}
                                                {log.userId && <span className="text-xs text-muted block">{log.userId}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary max-w-xs truncate" title={log.details}>
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
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-muted font-medium">Total de Usuários</h3>
                                <Users className="text-primary" />
                            </div>
                            <p className="text-3xl font-bold text-main">{users.length}</p>
                            <div className="mt-2 text-sm text-muted">
                                {clients.length} Clientes • {technicians.length} Técnicos
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-muted font-medium">Agendamentos</h3>
                                <Calendar className="text-primary" />
                            </div>
                            <p className="text-3xl font-bold text-main">{appointments.length}</p>
                            <div className="mt-2 text-sm text-muted">
                                {appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length} Concluídos
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-muted font-medium">Receita Estimada</h3>
                                <Star className="text-warning" />
                            </div>
                            <p className="text-3xl font-bold text-main">R$ {totalRevenueMock.toFixed(2)}</p>
                            <div className="mt-2 text-sm text-muted">
                                Baseado em atendimentos concluídos
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'USERS' && (
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
                        <table className="w-full text-left">
                            <thead className="bg-subtle border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Nome</th>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Email</th>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Tipo</th>
                                    <th className="px-6 py-4 font-semibold text-secondary text-sm">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-subtle/50">
                                        <td className="px-6 py-4 text-sm font-medium text-main">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-muted">{user.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === UserRole.TECHNICIAN ? 'bg-primary-light text-primary' : 'bg-primary-light text-primary'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button className="text-error hover:text-error-fg transition-colors" title="Banir Usuário">
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