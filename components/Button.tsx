import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false,
    className = '', 
    children, 
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg relative";
    
    const variants = {
        primary: "bg-primary text-inverted hover:bg-primary-hover focus:ring-primary shadow-sm",
        secondary: "bg-card text-secondary border border-border hover:bg-subtle focus:ring-border shadow-sm",
        outline: "border-2 border-primary text-primary hover:bg-primary-light focus:ring-primary",
        danger: "bg-error text-inverted hover:bg-error-bg hover:text-error-fg focus:ring-error shadow-sm",
        ghost: "text-muted hover:bg-hover hover:text-main"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <>
                    <span className="opacity-0">{children}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </>
            ) : (
                children
            )}
        </button>
    );
};