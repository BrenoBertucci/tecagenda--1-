import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Eye, Accessibility, X } from 'lucide-react';

export const FloatingAccessibilityMenu = () => {
    const { theme, toggleTheme, isColorblind, toggleColorblind } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 left-4 z-[90] flex flex-col items-start gap-2">
            {/* Menu Content */}
            <div className={`
                flex flex-col gap-2 transition-all duration-300 origin-bottom-left
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
            `}>
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span className="text-sm font-medium whitespace-nowrap">
                        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </span>
                </button>

                <button
                    onClick={toggleColorblind}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border transition-colors
                        ${isColorblind
                            ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
                    `}
                    aria-label="Alternar Modo Daltonismo"
                >
                    <Eye size={18} />
                    <span className="text-sm font-medium whitespace-nowrap">
                        Daltonismo {isColorblind ? '(Ativo)' : ''}
                    </span>
                </button>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-3 rounded-full shadow-xl transition-all duration-300
                    ${isOpen
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rotate-90'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-110'}
                `}
                aria-label="Menu de Acessibilidade"
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={24} /> : <Accessibility size={24} />}
            </button>
        </div>
    );
};
