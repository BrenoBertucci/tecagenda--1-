import React from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { Review } from '../types';

interface ReviewListProps {
    reviews: Review[];
}

export const ReviewList = ({ reviews }: ReviewListProps) => {
    if (reviews.length === 0) {
        return (
            <div className="bg-slate-50 p-6 rounded-xl text-center">
                <p className="text-slate-500 text-sm">Ainda não há avaliações para este técnico.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <UserIcon size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-slate-900">{review.clientName}</h4>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            className={`${star <= review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-slate-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                                {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
