import React, { useState } from 'react';
import { Technician, UserRole } from '../types';
import { Search, User as UserIcon, Star, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

export const ClientHome = () => {
    const { usersDb } = useData();
    const navigate = useNavigate();
    const techs = usersDb.filter(u => u.role === UserRole.TECHNICIAN) as Technician[];
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTechs = techs.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Encontre um Técnico</h2>
                <p className="text-slate-500">Profissionais qualificados próximos a você</p>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome ou especialidade..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm outline-none transition-all"
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            </div>

            <div className="space-y-4">
                {filteredTechs.map(tech => (
                    <div key={tech.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                            {tech.avatarUrl ? (
                                <img src={tech.avatarUrl} alt={tech.name} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <UserIcon size={24} />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900">{tech.name}</h3>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-xs font-medium text-yellow-700">
                                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                        {tech.rating ? tech.rating.toFixed(1) : 'N/A'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                    <MapPin size={14} />
                                    {tech.distance || '? km'} • {tech.address || 'Endereço n/d'}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tech.specialties?.slice(0, 2).map((spec, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">{tech.priceEstimate || 'Sob consulta'}</span>
                            <Button size="sm" onClick={() => navigate(`/client/tech/${tech.id}`)}>
                                Ver Agenda
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
