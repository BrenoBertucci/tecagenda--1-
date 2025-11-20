import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { Button } from './Button';

interface LegalViewProps {
    onBack: () => void;
}

export const TermsView: React.FC<LegalViewProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
                    <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText size={20} />
                        Termos de Serviço
                    </h1>
                </div>
                <div className="p-8 text-slate-700 space-y-6 leading-relaxed">
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">1. Aceitação dos Termos</h2>
                        <p>Ao acessar e usar o TecAgenda, você concorda em cumprir estes Termos de Serviço. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.</p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">2. Uso da Licença</h2>
                        <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site TecAgenda, apenas para visualização transitória pessoal e não comercial.</p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">3. Isenção de Responsabilidade</h2>
                        <p>Os materiais no site da TecAgenda são fornecidos 'como estão'. TecAgenda não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.</p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">4. Limitações</h2>
                        <p>Em nenhum caso o TecAgenda ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em TecAgenda.</p>
                    </section>
                    <div className="pt-6 border-t border-slate-100">
                        <p className="text-sm text-slate-500">Última atualização: 20 de Novembro de 2025</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PrivacyView: React.FC<LegalViewProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
                    <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield size={20} />
                        Política de Privacidade (LGPD)
                    </h1>
                </div>
                <div className="p-8 text-slate-700 space-y-6 leading-relaxed">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-6">
                        <strong>Compromisso com a LGPD:</strong> O TecAgenda respeita a sua privacidade e está comprometido em proteger seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                    </div>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">1. Coleta de Dados</h2>
                        <p>Coletamos informações que você nos fornece diretamente, como nome, endereço de e-mail, endereço residencial e informações do dispositivo, para facilitar o agendamento de serviços técnicos.</p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">2. Uso dos Dados</h2>
                        <p>Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Conectar clientes a técnicos qualificados.</li>
                            <li>Processar agendamentos e pagamentos.</li>
                            <li>Melhorar nossos serviços e suporte ao cliente.</li>
                            <li>Enviar notificações importantes sobre sua conta.</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">3. Seus Direitos (LGPD)</h2>
                        <p>Você tem o direito de:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Confirmar a existência de tratamento de dados.</li>
                            <li>Acessar seus dados.</li>
                            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                            <li>Solicitar a exclusão dos seus dados pessoais (disponível nas Configurações).</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">4. Encarregado de Dados (DPO)</h2>
                        <p>Para exercer seus direitos ou tirar dúvidas sobre nossa política de privacidade, entre em contato com nosso Encarregado de Proteção de Dados:</p>
                        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="font-medium text-slate-900">DPO TecAgenda</p>
                            <p className="text-slate-600">Email: dpo@tecagenda.com.br</p>
                        </div>
                    </section>
                    <div className="pt-6 border-t border-slate-100">
                        <p className="text-sm text-slate-500">Última atualização: 20 de Novembro de 2025</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
