import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Smartphone, Settings, LogOut, Search, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { Footer } from './Footer';

export const Layout = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    const isAuthPage = ['/login', '/register', '/register/client', '/register/tech'].includes(location.pathname);
    const isClient = user?.role === UserRole.CLIENT;

    const handleLogout = async () => {
        await signOut();
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative text-slate-900 pb-safe">
            {!isAuthPage && (
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2" onClick={() => isClient && navigate('/client/home')}>
                        <div className="bg-primary-600 p-1.5 rounded-lg shadow-sm">
                            <Smartphone className="text-white" size={20} />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-slate-900 cursor-pointer">TecAgenda</h1>
                    </div>
                    {user && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                                title="Configurações"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="text-slate-500 hover:text-red-600 transition-colors"
                                title="Sair"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </header>
            )}

            <main className="animate-fade-in">
                <Outlet />
            </main>

            {!isAuthPage && !isClient && (
                <Footer onNavigate={(view) => {
                    // Legacy support or remove Footer if not needed?
                    // The Footer component uses strings like 'TERMS'.
                    // We might need to map them to routes or update Footer.
                    if (view === 'TERMS') navigate('/terms');
                    if (view === 'PRIVACY') navigate('/privacy');
                }} />
            )}

            {isClient && !location.pathname.includes('settings') && (
                 <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-around z-40 shadow-lg">
                    <button
                        onClick={() => navigate('/client/home')}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${location.pathname.includes('/client/home') || location.pathname.includes('/client/tech') ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Search size={24} />
                        <span className="text-xs font-medium mt-1">Buscar</span>
                    </button>
                    <button
                        onClick={() => navigate('/client/appointments')}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${location.pathname.includes('/client/appointments') ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <History size={24} />
                        <span className="text-xs font-medium mt-1">Agenda</span>
                    </button>
                </nav>
            )}

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                title="Sair do Sistema"
                message="Deseja realmente sair da sua conta?"
                confirmLabel="Sair"
                variant="primary"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
};
