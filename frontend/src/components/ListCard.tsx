import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NoteEntry } from '../types';
import NoteEntryCard from './NoteEntryCard';

interface ListCardProps {
  entry: NoteEntry;
  onRemoveFromList?: (entryId: number) => void;
  onUpdate: () => void;
  onLabelsUpdate: (entryId: number, labels: any[]) => void;
  listId?: number;
}

const ListCard = ({ entry, onRemoveFromList, onUpdate, onLabelsUpdate, listId }: ListCardProps) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // Use text/x- prefix for custom types per HTML5 spec
    e.dataTransfer.setData('text/x-entryid', entry.id.toString());
    e.dataTransfer.setData('text/x-sourcelistid', listId?.toString() || '');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromList && listId) {
      if (confirm('Remove this entry from the list?')) {
        onRemoveFromList(entry.id);
      }
    }
  };

  const handleViewInDaily = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[contenteditable]') ||
      target.classList.contains('ProseMirror');
    
    if (isInteractive) {
      return;
    }

    if (entry.daily_note_date) {
      navigate(`/daily/${entry.daily_note_date}`);
    }
  };

  const handleEntryUpdate = async (id: number, content: string) => {
    // The NoteEntryCard handles the actual update via API
    // We just need to refresh the list after the update completes
    onUpdate();
  };

  const handleEntryDelete = async (id: number) => {
    // Delete the entry entirely (not just remove from list)
    if (confirm('This will delete the entry completely. Remove from list instead?')) {
      return;
    }
    // Let NoteEntryCard handle the actual deletion
    onUpdate();
  };

  return (
    <div
      className="relative group transition-all hover:shadow-2xl"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleViewInDaily}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
      }}
      title={entry.daily_note_date ? `Click card to view in daily notes (${entry.daily_note_date})` : undefined}
    >
      {/* Action buttons overlay - shows on hover */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onRemoveFromList && listId && (
          <button
            onClick={handleRemove}
            className="p-2 rounded-full shadow-lg transition-all hover:scale-110"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              color: '#ef4444',
              border: '2px solid #ef4444',
            }}
            title="Remove from list"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Full NoteEntryCard - identical to daily view */}
      <NoteEntryCard
        entry={entry}
        onUpdate={handleEntryUpdate}
        onDelete={handleEntryDelete}
        onLabelsUpdate={onLabelsUpdate}
      />
    </div>
  );
};

export default ListCard;
