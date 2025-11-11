import { useState } from 'react';
import { Trash2, Edit2, Archive } from 'lucide-react';
import type { List, NoteEntry } from '../types';
import ListCard from './ListCard';
import EntryModal from './EntryModal';
import { listsApi } from '../api';

interface ListColumnProps {
  list: List;
  entries: NoteEntry[];
  onUpdate: () => void;
  onDelete: (listId: number, listName: string) => void;
}

const ListColumn = ({ list, entries, onUpdate, onDelete }: ListColumnProps) => {
  const [showActions, setShowActions] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const entryId = parseInt(e.dataTransfer.getData('entryId'));
    const sourceListId = parseInt(e.dataTransfer.getData('sourceListId'));

    if (!entryId) return;

    // Don't do anything if dropped on the same list
    if (sourceListId === list.id) return;

    try {
      // Remove from source list if it was in one
      if (sourceListId) {
        await listsApi.removeEntry(sourceListId, entryId);
      }
      
      // Add to target list
      await listsApi.addEntry(list.id, entryId);
      
      // Refresh the lists
      onUpdate();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to move entry');
      console.error('Error moving entry:', error);
    }
  };

  return (
    <>
      <div
        className="flex-shrink-0 w-80 rounded-lg shadow-md flex flex-col transition-all hover:shadow-lg"
        style={{
          backgroundColor: isDragOver ? `${list.color}10` : 'var(--color-card-bg)',
          border: `3px solid ${list.color}`,
          borderStyle: isDragOver ? 'dashed' : 'solid',
          maxHeight: 'calc(100vh - 12rem)',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* List Header */}
        <div
          className="p-4 rounded-t-lg"
          style={{
            backgroundColor: `${list.color}15`,
            borderBottom: `1px solid ${list.color}30`,
          }}
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
                  className="p-1.5 rounded transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-secondary)',
                  }}
                  title={list.is_archived ? 'Unarchive list' : 'Archive list'}
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(list.id, list.name)}
                  className="p-1.5 rounded transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: '#ef4444',
                  }}
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
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: list.color,
                color: 'white',
              }}
            >
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* List Content - Scrollable entries */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
              <p>No entries yet</p>
              <p className="text-xs mt-2">Add entries from daily notes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <ListCard
                  key={entry.id}
                  entry={entry}
                  listId={list.id}
                  onRemoveFromList={handleRemoveEntry}
                  onCardClick={setSelectedEntryId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {selectedEntryId !== null && (
        <EntryModal
          entryId={selectedEntryId}
          onClose={() => setSelectedEntryId(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default ListColumn;

