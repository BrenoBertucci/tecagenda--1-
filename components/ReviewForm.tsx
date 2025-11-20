import React, { useState, useEffect } from 'react';
import { Star, Tag } from 'lucide-react';
import { Button } from './Button';
import { SERVICE_TAGS } from '../constants';

interface ReviewFormProps {
    onSubmit: (rating: number, comment: string, tags: string[]) => void;
    onCancel: () => void;
    initialData?: {
        rating: number;
        comment: string;
        tags?: string[];
    };
}

export const ReviewForm = ({ onSubmit, onCancel, initialData }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating);
            setComment(initialData.comment);
            setSelectedTags(initialData.tags || []);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
            return;
        }
        onSubmit(rating, comment, selectedTags);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
                {initialData ? 'Editar Avaliação' : 'Avaliar Atendimento'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Classificação
                    </label>
                    <div className="flex gap-2 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110 focus:outline-none"
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
                        <p className="text-sm font-medium text-slate-600">
                            {rating === 1 && 'Muito ruim'}
                            {rating === 2 && 'Ruim'}
                            {rating === 3 && 'Regular'}
                            {rating === 4 && 'Bom'}
                            {rating === 5 && 'Excelente'}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Pontos Fortes (Opcional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SERVICE_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`
                                    px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                                    ${selectedTags.includes(tag)
                                        ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
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

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                        Cancelar
                    </Button>
                    <Button type="submit" fullWidth>
                        {initialData ? 'Salvar Alterações' : 'Enviar Avaliação'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
