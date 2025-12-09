import React from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = 'Carregando...' }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-card p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-slide-up border border-border">
                <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-4 border-subtle rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-main font-medium">{message}</p>
            </div>
        </div>
    );
};
