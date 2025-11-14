import { useState } from 'react';
import { Trash2, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NoteEntry, List } from '../types';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatTimestamp } from '../utils/timezone';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ListCardProps {
  entry: NoteEntry;
  onRemoveFromList?: (entryId: number) => void;
  onUpdate: () => void;
  onLabelsUpdate: (entryId: number, labels: any[]) => void;
  listId?: number;
  list?: List;
}

const ListCard = ({ entry, onRemoveFromList, listId, list }: ListCardProps) => {
  const navigate = useNavigate();
  const { timezone } = useTimezone();
  const [isDragging, setIsDragging] = useState(false);

  // Check if a label name is a custom emoji URL
  const isCustomEmojiUrl = (str: string): boolean => {
    return str.startsWith('/api/uploads/') || str.startsWith('http');
  };

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
    e.stopPropagation();
    if (entry.daily_note_date) {
      navigate(`/day/${entry.daily_note_date}?highlight=${entry.id}`);
    }
  };

  return (
    <div
      className="entry-card-container relative group"
      data-entry-id={entry.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Action buttons - always visible */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {entry.daily_note_date && (
          <button
            onClick={handleViewInDaily}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            title="View in daily notes"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
        {onRemoveFromList && listId && (
          <button
            onClick={handleRemove}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            title="Remove from list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Read-only card preview */}
      <div 
        className="rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '2px solid var(--color-border-primary)',
          maxHeight: '500px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="p-6 flex-shrink-0">
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
            <Clock className="h-4 w-4" />
            <span>
              {formatTimestamp(entry.created_at, timezone, 'h:mm a zzz')}
            </span>
          </div>

          {/* Title (read-only) */}
          {entry.title && (
            <div className="mb-3 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {entry.title}
            </div>
          )}

          {/* Labels (read-only) */}
          {entry.labels && entry.labels.length > 0 && (
            <div className="mb-3 pb-3 flex flex-wrap gap-2" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
              {entry.labels.map((label) => {
                const isCustomEmoji = isCustomEmojiUrl(label.name);
                
                if (isCustomEmoji) {
                  const imageUrl = label.name.startsWith('http') ? label.name : `${API_URL}${label.name}`;
                  return (
                    <img 
                      key={label.id}
                      src={imageUrl} 
                      alt="emoji" 
                      className="inline-emoji"
                      style={{ width: '1.5rem', height: '1.5rem' }}
                    />
                  );
                }
                
                return (
                  <span
                    key={label.id}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: label.color + '20',
                      color: label.color,
                      border: `1px solid ${label.color}40`,
                    }}
                  >
                    {label.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Content (read-only, HTML rendered, links clickable, scrollable) */}
        <div 
          className="px-6 pb-6 overflow-y-auto custom-scrollbar flex-1"
          style={{ 
            minHeight: 0,
          }}
        >
          <div 
            className="prose prose-sm max-w-none"
            style={{ 
              color: 'var(--color-text-primary)',
              pointerEvents: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: entry.content }}
            onClick={(e) => {
              // Only allow link clicks, prevent other interactions
              const target = e.target as HTMLElement;
              if (target.tagName !== 'A') {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ListCard;
