import { X } from 'lucide-react';
import type { NoteEntry } from '../types';
import NoteEntryCard from './NoteEntryCard';

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

  // Dummy handlers for NoteEntryCard (read-only in list view)
  const noopUpdate = () => {};
  const noopDelete = () => {};
  const noopLabelsUpdate = () => {};

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

      {/* Scaled-down NoteEntryCard in fixed-height container */}
      <div
        className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
        style={{
          height: '200px',
          transform: 'scale(0.85)',
          transformOrigin: 'top left',
          width: 'calc(100% / 0.85)', // Compensate for scale
        }}
        onClick={handleCardClick}
      >
        {/* Disable pointer events on the card itself so clicks go to the wrapper */}
        <div style={{ pointerEvents: 'none' }}>
          <NoteEntryCard
            entry={entry}
            onUpdate={noopUpdate}
            onDelete={noopDelete}
            onLabelsUpdate={noopLabelsUpdate}
            selectionMode={false}
            isSelected={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ListCard;

