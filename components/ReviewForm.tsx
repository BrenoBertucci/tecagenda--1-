import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './Button';

interface ReviewFormProps {
    onSubmit: (rating: number, comment: string) => void;
    onCancel: () => void;
}

export const ReviewForm = ({ onSubmit, onCancel }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
            return;
        }
        onSubmit(rating, comment);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Avaliar Atendimento</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Classificação
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    size={32}
                                    className={`${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-slate-300'
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-slate-500 mt-2">
                            {rating === 1 && 'Muito ruim'}
                            {rating === 2 && 'Ruim'}
                            {rating === 3 && 'Regular'}
                            {rating === 4 && 'Bom'}
                            {rating === 5 && 'Excelente'}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Comentário (opcional)
                    </label>
                    <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte como foi sua experiência..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all"
                    />
                </div>

                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                        Cancelar
                    </Button>
                    <Button type="submit" fullWidth>
                        Enviar Avaliação
                    </Button>
                </div>
            </form>
        </div>
    );
};
