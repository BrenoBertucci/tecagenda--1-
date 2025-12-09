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
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm animate-fade-in">
            <h3 className="text-lg font-bold text-main mb-4">
                {initialData ? 'Editar Avaliação' : 'Avaliar Atendimento'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
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
                                            ? 'fill-warning text-warning'
                                            : 'text-subtle'
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm font-medium text-muted">
                            {rating === 1 && 'Muito ruim'}
                            {rating === 2 && 'Ruim'}
                            {rating === 3 && 'Regular'}
                            {rating === 4 && 'Bom'}
                            {rating === 5 && 'Excelente'}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
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
                                        ? 'bg-primary-light border-primary/20 text-primary shadow-sm'
                                        : 'bg-card border-border text-muted hover:bg-subtle'
                                    }
                                `}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                        Comentário (opcional)
                    </label>
                    <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte como foi sua experiência..."
                        className="w-full p-3 bg-page text-main border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
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
