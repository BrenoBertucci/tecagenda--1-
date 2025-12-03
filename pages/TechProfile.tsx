import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Technician, AppointmentStatus, Review } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, User as UserIcon, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { ReviewList } from '../components/ReviewList';
import { ReviewForm } from '../components/ReviewForm';
import { SupabaseService } from '../services/SupabaseService';
import { validateReviewEligibility, createReviewObject, calculateAverageRating } from '../core/domainLogic';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const TechProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { usersDb, techSchedules, reviews, appointments, setReviews, setUsersDb } = useData();
    const { user } = useAuth();

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const tech = usersDb.find(u => u.id === id) as Technician;

    if (!tech) return <div className="p-4">Técnico não encontrado</div>;

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = (reviewId: string) => {
        setReviewToDelete(reviewId);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        setLoading(true);
        try {
            await SupabaseService.deleteReview(reviewToDelete);
            setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setReviewToDelete(null);
        }
    };

    const handleSubmitReview = async (rating: number, comment: string, tags: string[]) => {
        if (!user || !tech) return;

        setLoading(true);
        try {
            let updatedReviews = [...reviews];
            let reviewToProcess: Review;

            if (editingReview) {
                reviewToProcess = {
                    ...editingReview,
                    rating,
                    comment,
                    tags,
                    updatedAt: new Date().toISOString()
                };

                await SupabaseService.updateReview(reviewToProcess);
                updatedReviews = reviews.map(r => r.id === editingReview.id ? reviewToProcess : r);
                setEditingReview(null);

            } else {
                const eligibility = validateReviewEligibility(appointments, reviews, user.id, tech.id);
                if (!eligibility.allowed) {
                    alert(eligibility.reason);
                    return;
                }

                reviewToProcess = createReviewObject(user, tech.id, rating, comment, tags);

                await SupabaseService.createReview(reviewToProcess);
                updatedReviews = [...reviews, reviewToProcess];
            }

            setReviews(updatedReviews);

            // Recalculate rating
            const techReviews = updatedReviews.filter(r => r.techId === tech.id);
            const newRating = calculateAverageRating(techReviews);
            const updatedTech = { ...tech, rating: newRating };

            await SupabaseService.updateUser(updatedTech);
            setUsersDb(prev => prev.map(u => u.id === tech.id ? { ...u, rating: newRating } : u));
            setShowReviewForm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 max-w-md mx-auto bg-white min-h-screen">
             <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate('/client/home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <span className="font-semibold text-slate-900">Perfil do Técnico</span>
            </div>

            <div className="p-6 pb-0">
                <div className="flex items-center gap-4 mb-6">
                    {tech.avatarUrl ? (
                        <img src={tech.avatarUrl} alt={tech.name} className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 border-2 border-white shadow-md">
                            <UserIcon size={32} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{tech.name}</h2>
                        <p className="text-slate-500 text-sm">{tech.address}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-2">Sobre</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{tech.bio || 'Sem descrição disponível.'}</p>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Horários Disponíveis</h3>
                    <div className="space-y-4">
                        {(techSchedules[tech.id] || []).map((day) => (
                            <div key={day.date} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                                <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium">
                                    <Calendar size={16} />
                                    {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {day.slots.map((slot) => {
                                        const isDisabled = slot.isBlocked || slot.isBooked;
                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    navigate(`/client/booking/${tech.id}?date=${day.date}&time=${slot.time}`);
                                                }}
                                                className={`
                                                    py-2 rounded-lg text-sm font-medium transition-all
                                                    ${isDisabled
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed decoration-slate-400'
                                                        : 'bg-white border border-primary-200 text-primary-700 shadow-sm hover:bg-primary-600 hover:text-white hover:border-primary-600'
                                                    }
                                                `}
                                            >
                                                {slot.time}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Avaliações</h3>
                    <ReviewList
                        reviews={reviews.filter(r => r.techId === tech.id)}
                        currentUserRole={user?.role}
                        currentUserId={user?.id}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                    />
                </div>

                 {/* Review Form Section */}
                 {user && (() => {
                    const hasCompletedAppointment = appointments.some(
                        apt => apt.clientId === user.id &&
                            apt.techId === tech.id &&
                            apt.status === AppointmentStatus.COMPLETED
                    );
                    const alreadyReviewed = reviews.some(
                        r => r.clientId === user.id && r.techId === tech.id
                    );

                    if (!hasCompletedAppointment) {
                        return (
                            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                                <p className="text-sm text-slate-600">
                                    Você poderá avaliar este técnico após ser atendido.
                                </p>
                            </div>
                        );
                    }

                    if (alreadyReviewed) {
                        return (
                            <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                                <p className="text-sm text-green-700 font-medium">
                                    ✓ Você já avaliou este técnico.
                                </p>
                            </div>
                        );
                    }

                    return (
                        <Button fullWidth onClick={() => {
                            setEditingReview(null);
                            setShowReviewForm(!showReviewForm);
                        }}>
                            {showReviewForm ? 'Cancelar Avaliação' : 'Avaliar Atendimento'}
                        </Button>
                    );
                })()}

                {showReviewForm && (
                    <div className="mt-4">
                        <ReviewForm
                            onSubmit={handleSubmitReview}
                            onCancel={() => {
                                setShowReviewForm(false);
                                setEditingReview(null);
                            }}
                            initialData={editingReview ? {
                                rating: editingReview.rating,
                                comment: editingReview.comment,
                                tags: editingReview.tags
                            } : undefined}
                        />
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!reviewToDelete}
                title="Excluir Avaliação"
                message="Tem certeza que deseja excluir sua avaliação?"
                confirmLabel="Excluir"
                variant="danger"
                onConfirm={confirmDeleteReview}
                onCancel={() => setReviewToDelete(null)}
                isLoading={loading}
            />
        </div>
    );
};
