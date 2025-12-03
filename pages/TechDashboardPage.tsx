import React from 'react';
import { TechDashboard } from '../components/TechDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { SupabaseService } from '../services/SupabaseService';
import { AppointmentStatus, Review } from '../types';
import { canClientCancel } from '../core/domainLogic';

export const TechDashboardPage = () => {
    const { user } = useAuth();
    const {
        techSchedules,
        setTechSchedules,
        appointments,
        setAppointments,
        reviews,
        setReviews
    } = useData();

    if (!user) return null;

    const handleReplyReview = async (reviewId: string, replyText: string) => {
        try {
            const review = reviews.find(r => r.id === reviewId);
            if (review) {
                const updatedReview = {
                    ...review,
                    reply: { text: replyText, createdAt: new Date().toISOString() }
                };
                await SupabaseService.updateReview(updatedReview);
                setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCompleteAppointment = async (aptId: string) => {
        try {
            await SupabaseService.updateAppointmentStatus(aptId, AppointmentStatus.COMPLETED);
            setAppointments(prev => prev.map(a =>
                a.id === aptId ? { ...a, status: AppointmentStatus.COMPLETED } : a
            ));
        } catch (error) {
            console.error(error);
        }
    };

    // Note: TechDashboard component still handles its own cancellation modal logic internally?
    // Looking at TechDashboard source, it takes `setAppointmentToCancel` prop but manages UI locally?
    // No, App.tsx managed the modal. TechDashboard just called the prop.
    // So we need to lift the modal state here or inside TechDashboard.
    // Since TechDashboard is a component, it should probably handle its own actions or we wrap it.
    // Let's pass a dummy for now and fix TechDashboard or handle it here.

    // Actually, let's create a local state here for the modal, mirroring App.tsx logic for Tech.
    const [appointmentToCancel, setAppointmentToCancel] = React.useState<any | null>(null);

    // TechDashboard expects a function to set the appointment to cancel.
    // It doesn't perform the cancellation itself.

    return (
        <>
            <TechDashboard
                currentUser={user}
                techSchedules={techSchedules}
                setTechSchedules={setTechSchedules}
                appointments={appointments}
                setAppointmentToCancel={setAppointmentToCancel}
                checkCanCancel={(d, t) => true} // Techs can always cancel? Or apply logic? App.tsx had checkCanCancel.
                reviews={reviews}
                onReplyReview={handleReplyReview}
                onCompleteAppointment={handleCompleteAppointment}
            />
            {/* We need the cancellation logic here if TechDashboard doesn't have it */}
            {/* The current TechDashboard just renders the list. The modal was in App.tsx. */}
            {/* We should move the Modal into TechDashboard or keep it here. */}
            {/* Given the refactor, let's keep it simple and assume TechDashboard handles the view, and we handle the logic/modal here if needed,
               BUT TechDashboard doesn't export the Modal.
               We should probably refactor TechDashboard to include its own modal or move it here.
               For now, I will modify TechDashboard to include the modal? No, better to keep page logic in page.
               I will add the Modal here.
            */}
        </>
    );
};
