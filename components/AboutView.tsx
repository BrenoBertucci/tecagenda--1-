import React from 'react';
import { ArrowLeft, Shield, Zap, Users, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface AboutViewProps {
    onBack: () => void;
}

export const AboutView = ({ onBack }: AboutViewProps) => {
    return (
        <div className="min-h-screen bg-slate-50 overflow-y-auto">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-slate-50 opacity-70" />
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
                    <div className="text-center animate-fade-in-up">
                        <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl mb-6">
                            <span className="block">TecAgenda</span>
                            <span className="block text-primary-600">Conectando Soluções</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            A plataforma definitiva que une quem precisa de reparos a quem sabe resolver. Simples, rápido e seguro.
                        </p>
                        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                            <Button size="lg" onClick={onBack} className="shadow-xl transform transition hover:scale-105">
                                <ArrowLeft className="mr-2" size={20} />
                                Voltar para o Login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Card 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                            <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary-600">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Para Clientes</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Encontre técnicos qualificados próximos a você. Visualize avaliações, agende visitas e resolva problemas em seus dispositivos com total transparência.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Para Técnicos</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Gerencie sua agenda de forma profissional. Receba solicitações, organize seus horários e construa sua reputação com feedbacks reais.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-green-600">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança e Confiança</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Todos os profissionais são verificados. Sistema de avaliações transparente para garantir a melhor experiência para todos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Details (Collapsible or Section) */}
            <div className="py-16 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Como Funciona?</h2>
                        <p className="mt-4 text-slate-500">Uma visão mais profunda da nossa tecnologia</p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-slate-900">Tecnologia Moderna</h4>
                                <p className="mt-1 text-slate-600">
                                    Construído com React e TypeScript para máxima performance e interatividade. Utiliza Supabase para gerenciamento de dados em tempo real e segurança de nível empresarial.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-slate-900">Design Responsivo</h4>
                                <p className="mt-1 text-slate-600">
                                    Interface adaptável que funciona perfeitamente em desktops, tablets e smartphones, garantindo acesso onde você estiver.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-bold text-slate-900">Segurança de Dados</h4>
                                <p className="mt-1 text-slate-600">
                                    Proteção de dados com criptografia e autenticação robusta. Suas informações pessoais e histórico de serviços estão sempre seguros.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} TecAgenda. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};
