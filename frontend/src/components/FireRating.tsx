import { Flame } from 'lucide-react';

interface FireRatingProps {
  rating: number;
  onChange: (rating: number) => void;
}

const FireRating = ({ rating, onChange }: FireRatingProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Fire Rating:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => onChange(value === rating ? 0 : value)}
            className={`p-1 rounded transition-all hover:scale-110 ${
              value <= rating ? 'text-orange-500' : 'text-gray-300 hover:text-orange-300'
            }`}
            aria-label={`Rate ${value} fire${value > 1 ? 's' : ''}`}
          >
            <Flame
              className={`h-6 w-6 ${value <= rating ? 'fill-orange-500' : ''}`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {rating === 5 ? '🔥 On fire!' : rating >= 3 ? 'Great day!' : 'Good day'}
        </span>
      )}
    </div>
  );
};

export default FireRating;

