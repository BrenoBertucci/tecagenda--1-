import React, { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    showStrength?: boolean;
    placeholder?: string;
    required?: boolean;
    label?: string;
    minStrength?: number; // Minimum strength level required (0-4)
}

interface StrengthResult {
    score: number; // 0-4
    label: string;
    color: string;
    bgColor: string;
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

const calculateStrength = (password: string): StrengthResult => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    // Score based on passed checks
    let score = 0;
    if (passedChecks >= 1) score = 1;
    if (passedChecks >= 2) score = 2;
    if (passedChecks >= 3) score = 3;
    if (passedChecks >= 4) score = 4;
    if (passedChecks === 5) score = 4;

    // Bonus for extra length
    if (password.length >= 12 && passedChecks >= 4) score = 4;

    const strengthLevels = [
        { label: 'Muito fraca', color: 'text-error', bgColor: 'bg-error' },
        { label: 'Fraca', color: 'text-error-fg', bgColor: 'bg-error-fg' },
        { label: 'Média', color: 'text-warning-fg', bgColor: 'bg-warning-fg' },
        { label: 'Forte', color: 'text-success-fg', bgColor: 'bg-success-fg' },
        { label: 'Muito forte', color: 'text-success', bgColor: 'bg-success' },
    ];

    return {
        score,
        ...strengthLevels[score],
        checks,
    };
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    showStrength = false,
    placeholder = '••••••••',
    required = false,
    label = 'Senha',
    minStrength = 2,
}) => {
    const [visible, setVisible] = useState(false);
    const strength = useMemo(() => calculateStrength(value), [value]);

    const isWeak = showStrength && value.length > 0 && strength.score < minStrength;

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-secondary">
                    {label}
                </label>
            )}
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                <input
                    type={visible ? 'text' : 'password'}
                    required={required}
                    className={`w-full pl-10 pr-12 py-2.5 bg-page text-main border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${isWeak ? 'border-error focus:ring-error' : 'border-border'
                        }`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-2.5 p-0.5 text-muted hover:text-main transition-colors rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    tabIndex={-1}
                    aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {showStrength && value.length > 0 && (
                <div className="space-y-1.5 animate-fade-in">
                    {/* Strength bar */}
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= strength.score
                                        ? strength.bgColor
                                        : 'bg-subtle'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Strength label */}
                    <div className="flex justify-between items-center">
                        <span className={`text-xs font-medium ${strength.color}`}>
                            {strength.label}
                        </span>
                    </div>

                    {/* Requirements checklist */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-muted">
                        <RequirementItem
                            met={strength.checks.length}
                            text="Mínimo 8 caracteres"
                        />
                        <RequirementItem
                            met={strength.checks.uppercase}
                            text="Letra maiúscula"
                        />
                        <RequirementItem
                            met={strength.checks.lowercase}
                            text="Letra minúscula"
                        />
                        <RequirementItem
                            met={strength.checks.number}
                            text="Número"
                        />
                        <RequirementItem
                            met={strength.checks.special}
                            text="Caractere especial"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const RequirementItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <div className={`flex items-center gap-1 ${met ? 'text-success' : 'text-muted'}`}>
        <span className="text-[10px]">{met ? '✓' : '○'}</span>
        <span>{text}</span>
    </div>
);

// Helper function to check if password meets minimum strength
export const isPasswordStrong = (password: string, minStrength: number = 2): boolean => {
    return calculateStrength(password).score >= minStrength;
};
