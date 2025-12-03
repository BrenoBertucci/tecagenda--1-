import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { LoginView } from './components/LoginView'; // We need to refactor this to use router
import { RegisterSelectionView } from './components/RegisterSelectionView';
import { RegisterClientView } from './components/RegisterClientView';
import { RegisterTechView } from './components/RegisterTechView';
import { ClientHome } from './pages/ClientHome';
import { TechProfile } from './pages/TechProfile';
import { ClientBooking } from './pages/ClientBooking';
import { ClientAppointments } from './pages/ClientAppointments';
import { TechDashboardPage } from './pages/TechDashboardPage';
import { SettingsView } from './components/SettingsView'; // Needs refactor
import { TermsView, PrivacyView } from './components/LegalDocs';
import { UserRole } from './types';
import { AdminDashboard } from './components/AdminDashboard'; // Needs check
import { AboutView } from './components/AboutView';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: UserRole[] }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-10 text-center">Carregando...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Redirect to home/dashboard if wrong role
    }

    return children;
};

// Wrapper for Login to handle redirect if already logged in
const LoginWrapper = () => {
    const { user } = useAuth();
    if (user) {
        if (user.role === UserRole.CLIENT) return <Navigate to="/client/home" replace />;
        if (user.role === UserRole.TECHNICIAN) return <Navigate to="/tech/dashboard" replace />;
        if (user.role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    }
    return <LoginView />;
};

export default function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            {/* Public Routes */}
                            <Route path="/login" element={<LoginWrapper />} />
                            <Route path="/register" element={<RegisterSelectionView />} />
                            <Route path="/register/client" element={<RegisterClientView />} />
                            <Route path="/register/tech" element={<RegisterTechView />} />
                            <Route path="/terms" element={<TermsView onBack={() => window.history.back()} />} />
                            <Route path="/privacy" element={<PrivacyView onBack={() => window.history.back()} />} />
                            <Route path="/about" element={<AboutView onBack={() => window.history.back()} />} />

                            {/* Client Routes */}
                            <Route path="/client/home" element={
                                <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                    <ClientHome />
                                </ProtectedRoute>
                            } />
                            <Route path="/client/tech/:id" element={
                                <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                    <TechProfile />
                                </ProtectedRoute>
                            } />
                            <Route path="/client/booking/:techId" element={
                                <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                    <ClientBooking />
                                </ProtectedRoute>
                            } />
                            <Route path="/client/appointments" element={
                                <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                    <ClientAppointments />
                                </ProtectedRoute>
                            } />

                            {/* Tech Routes */}
                            <Route path="/tech/dashboard" element={
                                <ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]}>
                                    <TechDashboardPage />
                                </ProtectedRoute>
                            } />

                            {/* Admin Routes */}
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                    {/* AdminDashboard needs refactoring to remove props */}
                                    <div className="p-10 text-center">Admin Dashboard em manutenção (Refatoração)</div>
                                </ProtectedRoute>
                            } />

                            {/* Shared Routes */}
                            <Route path="/settings" element={
                                <ProtectedRoute>
                                    <SettingsViewWrapper />
                                </ProtectedRoute>
                            } />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </DataProvider>
        </AuthProvider>
    );
}

// Wrapper to adapt SettingsView to new Context
import { useData } from './contexts/DataContext';
const SettingsViewWrapper = () => {
    const { user, updateProfile, signOut } = useAuth();
    const { usersDb } = useData();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <SettingsView
            currentUser={user}
            usersDb={usersDb}
            onUpdate={updateProfile}
            onDeleteRequest={async () => {
                alert('Solicitação recebida.');
                await signOut();
            }}
            onBack={() => navigate(-1)}
        />
    );
};
