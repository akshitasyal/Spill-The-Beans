import { Star } from 'lucide-react';

export default function StarRating({ rating, small = false, showNumber = false }) {
  const size = small ? 12 : 16;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="stars" aria-label={`Rating: ${rating} out of 5`} role="img">
      {stars.map(star => {
        const filled = star <= Math.floor(rating);
        const partial = !filled && star <= rating + 0.5;
        return (
          <span
            key={star}
            style={{
              position: 'relative',
              display: 'inline-flex',
              color: filled || partial ? 'var(--accent-amber)' : 'var(--text-subtle)',
            }}
          >
            <Star
              size={size}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
          </span>
        );
      })}
      {showNumber && (
        <span style={{ marginLeft: 4, fontSize: small ? '0.75rem' : '0.875rem', color: 'var(--text-muted)' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
