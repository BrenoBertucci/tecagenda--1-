import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './Button';
import { Smartphone, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha obrigatória')
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginView = () => {
    const { signIn, loading } = useAuth();
    const navigate = useNavigate();
    const [logoClicks, setLogoClicks] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema)
    });

    const handleLogoClick = () => {
        const newCount = logoClicks + 1;
        setLogoClicks(newCount);
        if (newCount >= 5) {
            // navigate('/admin/login'); // TODO: Admin login route
            alert('Admin login route not implemented yet in new structure');
            setLogoClicks(0);
        }
    };

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            setError(null);
            await signIn(data.email, data.password);
            // Navigation handled by LoginWrapper in App.tsx or useAuth side effect
        } catch (err) {
            setError('Email ou senha incorretos.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm animate-fade-in">
                <div className="text-center mb-8">
                    <button
                        type="button"
                        onClick={handleLogoClick}
                        className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 transform rotate-3 active:scale-95 transition-transform"
                    >
                        <Smartphone className="text-white" size={32} />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
                    <p className="text-slate-500">Acesse sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                {...register('email')}
                                type="email"
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-primary-500 focus:ring-2'}`}
                                placeholder="seu@email.com"
                            />
                        </div>
                        {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                {...register('password')}
                                type="password"
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-primary-500 focus:ring-2'}`}
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
                    </div>

                    <Button type="submit" fullWidth size="lg" className="mt-2 shadow-md" loading={loading}>Entrar</Button>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-slate-500 text-sm">
                            Não tem uma conta?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                            >
                                Cadastre-se
                            </button>
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/about')}
                            className="text-slate-400 text-sm hover:text-primary-600 transition-colors"
                        >
                            Sobre nós
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
