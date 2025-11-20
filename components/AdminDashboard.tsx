import React, { useState } from 'react';
import { User, Technician, Appointment, Review, UserRole, AppointmentStatus } from '../types';
import { Users, Calendar, Star, Shield, Trash2, Ban } from 'lucide-react';
import { Button } from './Button';

interface AdminDashboardProps {
    users: (User | Technician)[];
    appointments: Appointment[];
    reviews: Review[];
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, appointments, reviews, onLogout }) => {
    const [tab, setTab] = useState<'OVERVIEW' | 'USERS' | 'APPOINTMENTS'>('OVERVIEW');

    const clients = users.filter(u => u.role === UserRole.CLIENT);
    const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);
    const totalRevenueMock = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length * 150; // Mock avg price

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight">Painel Administrativo</h1>
                        <p className="text-xs text-slate-400">Acesso Master</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={onLogout} size="sm">Sair</Button>
            </header>

            <div className="max-w-6xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setTab('OVERVIEW')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${tab === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setTab('USERS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${tab === 'USERS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => setTab('APPOINTMENTS')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${tab === 'APPOINTMENTS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
                    >
                        Agendamentos
                    </button>
                </div>

                {/* Content */}
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

                {tab === 'APPOINTMENTS' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Data/Hora</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Cliente</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Técnico</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.map(apt => (
                                    <tr key={apt.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-900">{apt.date} {apt.time}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{apt.clientName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{apt.techName}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                                    apt.status === AppointmentStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                                                        apt.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                }`}>
                                                {apt.status}
                                            </span>
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
