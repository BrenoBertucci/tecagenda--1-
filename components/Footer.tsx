import React from 'react';

interface FooterProps {
    onNavigate: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="bg-page border-t border-border py-8 mt-auto">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
                <div>
                    &copy; {new Date().getFullYear()} TecAgenda. Todos os direitos reservados.
                </div>
                <div className="flex gap-6">
                    <button
                        onClick={() => onNavigate('TERMS')}
                        className="hover:text-primary transition-colors"
                    >
                        Termos de Uso
                    </button>
                    <button
                        onClick={() => onNavigate('PRIVACY')}
                        className="hover:text-primary transition-colors"
                    >
                        Política de Privacidade
                    </button>
                </div>
            </div>
        </footer>
    );
};
