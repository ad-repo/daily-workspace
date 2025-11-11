import { X, Star, Check, Skull } from 'lucide-react';
import type { NoteEntry } from '../types';

interface ListCardProps {
  entry: NoteEntry;
  onRemoveFromList?: (entryId: number) => void;
  onCardClick?: (entryId: number) => void;
  listId?: number;
}

const ListCard = ({ entry, onRemoveFromList, onCardClick, listId }: ListCardProps) => {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(entry.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromList && listId) {
      if (confirm('Remove this entry from the list?')) {
        onRemoveFromList(entry.id);
      }
    }
  };

  return (
    <div className="relative group">
      {/* Remove button overlay - shows on hover */}
      {onRemoveFromList && listId && (
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: '#ef4444',
          }}
          title="Remove from list"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Read-only preview card */}
      <div
        className="rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl border-2"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-border)',
          height: '180px',
        }}
        onClick={handleCardClick}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Status indicators */}
          <div className="flex gap-1.5 mb-2">
            {entry.is_important && (
              <Star className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="var(--color-accent)" />
            )}
            {entry.is_completed && (
              <Check className="w-4 h-4" style={{ color: '#10b981' }} />
            )}
            {entry.is_dev_null && (
              <Skull className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            )}
          </div>

          {/* Title */}
          {entry.title && (
            <div
              className="text-sm font-semibold mb-2 truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {entry.title}
            </div>
          )}

          {/* Content preview - rendered HTML in read-only view */}
          <div
            className="flex-1 overflow-hidden text-xs leading-relaxed"
            style={{
              color: 'var(--color-text-primary)',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: entry.content }}
              style={{
                pointerEvents: 'none',
                fontSize: '0.7rem',
                lineHeight: '1.3',
              }}
            />
          </div>

          {/* Labels */}
          {entry.labels && entry.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.labels.slice(0, 3).map((label) => (
                <span
                  key={label.id}
                  className="px-1.5 py-0.5 rounded text-xs truncate"
                  style={{
                    backgroundColor: label.color + '20',
                    color: label.color,
                    borderColor: label.color,
                    borderWidth: '1px',
                    fontSize: '0.65rem',
                    maxWidth: '80px',
                  }}
                >
                  {label.name}
                </span>
              ))}
              {entry.labels.length > 3 && (
                <span
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.65rem',
                  }}
                >
                  +{entry.labels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListCard;

