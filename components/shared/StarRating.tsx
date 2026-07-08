'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;         // 0–5, supports decimals for display
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 16, readonly = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = value >= star;
        const half   = !filled && value >= star - 0.5;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly || !onChange}
            onClick={() => onChange?.(star)}
            className={readonly || !onChange ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
          >
            <Star
              size={size}
              className={filled || half ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-cream-dark)]'}
            />
          </button>
        );
      })}
    </div>
  );
}
