import React from 'react';
import { Button } from './Button';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'primary',
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-in relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                        variant === 'danger' ? 'bg-red-100 text-red-600' :
                        variant === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-primary-100 text-primary-600'
                    }`}>
                        <AlertCircle className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        fullWidth
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
