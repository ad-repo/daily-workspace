import { useState } from 'react';
import { Trash2, Edit2, Archive } from 'lucide-react';
import type { List, NoteEntry } from '../types';
import ListCard from './ListCard';
import { listsApi } from '../api';

interface ListColumnProps {
  list: List;
  entries: NoteEntry[];
  onUpdate: () => void;
  onDelete: (listId: number) => void;
}

const ListColumn = ({ list, entries, onUpdate, onDelete }: ListColumnProps) => {
  const [showActions, setShowActions] = useState(false);

  const handleRemoveEntry = async (entryId: number) => {
    try {
      await listsApi.removeEntry(list.id, entryId);
      onUpdate();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to remove entry from list');
      console.error('Error removing entry:', error);
    }
  };

  const handleArchive = async () => {
    try {
      await listsApi.update(list.id, { is_archived: !list.is_archived });
      onUpdate();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to update list');
      console.error('Error updating list:', error);
    }
  };

  return (
    <div
      className="flex-shrink-0 w-80 rounded-lg shadow-lg flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: list.color,
        borderWidth: '2px',
        borderStyle: 'solid',
        maxHeight: 'calc(100vh - 12rem)',
      }}
    >
      {/* List Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex justify-between items-start mb-2">
          <h2
            className="text-lg font-bold flex-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {list.name}
          </h2>
          {showActions && (
            <div className="flex gap-1 ml-2">
              <button
                onClick={handleArchive}
                className="p-1 rounded hover:bg-opacity-80"
                style={{ color: 'var(--color-text-secondary)' }}
                title={list.is_archived ? 'Unarchive list' : 'Archive list'}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(list.id)}
                className="p-1 rounded hover:bg-opacity-80"
                style={{ color: 'var(--color-text-secondary)' }}
                title="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {list.description && (
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {list.description}
          </p>
        )}
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {/* List Content - Scrollable entries */}
      <div className="flex-1 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
            <p>No entries yet</p>
            <p className="text-xs mt-2">Add entries from daily notes</p>
          </div>
        ) : (
          <div>
            {entries.map((entry) => (
              <ListCard
                key={entry.id}
                entry={entry}
                listId={list.id}
                onRemoveFromList={handleRemoveEntry}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drop zone indicator (for future drag-and-drop) */}
      <div
        className="p-2 text-center text-xs border-t"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Drop entries here
      </div>
    </div>
  );
};

export default ListColumn;

