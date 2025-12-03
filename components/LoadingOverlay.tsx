import React from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = 'Carregando...' }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-slide-up">
                <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-700 font-medium">{message}</p>
            </div>
        </div>
    );
};
