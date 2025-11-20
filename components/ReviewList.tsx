import React from 'react';
import { Star, User as UserIcon, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { Review, UserRole } from '../types';
import { Button } from './Button';

interface ReviewListProps {
    reviews: Review[];
    currentUserRole?: UserRole;
    currentUserId?: string;
    onReply?: (reviewId: string) => void;
    onEdit?: (review: Review) => void;
    onDelete?: (reviewId: string) => void;
}

export const ReviewList = ({
    reviews,
    currentUserRole,
    currentUserId,
    onReply,
    onEdit,
    onDelete
}: ReviewListProps) => {
    if (reviews.length === 0) {
        return (
            <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-100">
                <p className="text-slate-500 text-sm">Ainda não há avaliações para este técnico.</p>
            </div>
        );
    }

    // Calculate Breakdown
    const totalReviews = reviews.length;
    const breakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: (reviews.filter(r => r.rating === star).length / totalReviews) * 100
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Rating Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)}
                        </div>
                        <div className="flex text-yellow-400 justify-center my-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12} className="fill-current" />
                            ))}
                        </div>
                        <div className="text-xs text-slate-500">{totalReviews} avaliações</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        {breakdown.map(item => (
                            <div key={item.star} className="flex items-center gap-2 text-xs">
                                <span className="w-3 font-medium text-slate-600">{item.star}</span>
                                <Star size={10} className="text-slate-400" />
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className="w-6 text-right text-slate-400">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200">
                                <UserIcon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-slate-900 truncate">{review.clientName}</h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            className={`${star <= review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-slate-200'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {review.tags && review.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {review.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {review.comment && (
                                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{review.comment}</p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-2">
                                    {currentUserRole === UserRole.TECHNICIAN && !review.reply && onReply && (
                                        <button
                                            onClick={() => onReply(review.id)}
                                            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <MessageCircle size={14} /> Responder
                                        </button>
                                    )}

                                    {currentUserId === review.clientId && (
                                        <>
                                            <button
                                                onClick={() => onEdit && onEdit(review)}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                                            >
                                                <Edit2 size={14} /> Editar
                                            </button>
                                            <button
                                                onClick={() => onDelete && onDelete(review.id)}
                                                className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                                            >
                                                <Trash2 size={14} /> Excluir
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Technician Reply */}
                                {review.reply && (
                                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border-l-4 border-primary-500">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-900">Resposta do Técnico</span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(review.reply.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{review.reply.text}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
