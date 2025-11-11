import { Star, Check, Skull, X } from 'lucide-react';
import { format } from 'date-fns';
import type { NoteEntry } from '../types';

interface ListCardProps {
  entry: NoteEntry;
  onRemoveFromList?: (entryId: number) => void;
  onCardClick?: (entryId: number) => void;
  listId?: number;
}

const ListCard = ({ entry, onRemoveFromList, onCardClick, listId }: ListCardProps) => {
  // Extract plain text from HTML for preview
  const getTextPreview = (html: string, maxLength: number = 150) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

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
    <div
      className="rounded-lg p-3 mb-2 cursor-pointer transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
      onClick={handleCardClick}
    >
      {/* Header with title and actions */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {entry.title && (
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {entry.title}
            </h3>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          {/* Status icons */}
          {entry.is_important && (
            <Star className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="var(--color-accent)" />
          )}
          {entry.is_completed && (
            <Check className="w-4 h-4" style={{ color: 'var(--color-success, #10b981)' }} />
          )}
          {entry.is_dev_null && (
            <Skull className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          )}
          {/* Remove button */}
          {onRemoveFromList && listId && (
            <button
              onClick={handleRemove}
              className="p-1 rounded hover:bg-opacity-80"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Remove from list"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        {getTextPreview(entry.content)}
      </p>

      {/* Labels */}
      {entry.labels && entry.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {entry.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
                borderColor: label.color,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Lists this entry belongs to */}
      {entry.lists && entry.lists.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.lists.map((list) => (
            <span
              key={list.id}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-secondary)',
                borderColor: list.color,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              📋 {list.name}
            </span>
          ))}
        </div>
      )}

      {/* Date footer */}
      <div className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {format(new Date(entry.created_at), 'MMM d, yyyy')}
      </div>
    </div>
  );
};

export default ListCard;

