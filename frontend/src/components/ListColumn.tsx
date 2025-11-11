import { useState } from 'react';
import { Trash2, Edit2, Archive, Plus } from 'lucide-react';
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
        className="flex-shrink-0 w-96 rounded-xl shadow-lg flex flex-col transition-all"
        style={{
          backgroundColor: isDragOver ? `${list.color}15` : 'var(--color-card-bg)',
          border: isDragOver ? `3px dashed ${list.color}` : '1px solid var(--color-border)',
          maxHeight: 'calc(100vh - 14rem)',
          boxShadow: isDragOver 
            ? `0 0 20px ${list.color}40` 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* List Header */}
        <div
          className="px-5 py-4"
          style={{
            borderBottom: `3px solid ${list.color}`,
            background: `linear-gradient(135deg, ${list.color}08 0%, ${list.color}15 100%)`,
          }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: list.color }}
              />
              <h2
                className="text-xl font-bold truncate"
                style={{ color: 'var(--color-text-primary)' }}
                title={list.name}
              >
                {list.name}
              </h2>
            </div>
            {showActions && (
              <div className="flex gap-1.5 ml-2">
                <button
                  onClick={handleArchive}
                  className="p-2 rounded-lg transition-all hover:scale-110 hover:shadow-md"
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
                  className="p-2 rounded-lg transition-all hover:scale-110 hover:shadow-md"
                  style={{
                    backgroundColor: '#fee',
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
            <p 
              className="text-sm mb-3 ml-3 break-words line-clamp-2"
              style={{ color: 'var(--color-text-secondary)' }}
              title={list.description}
            >
              {list.description}
            </p>
          )}
          <div className="flex items-center gap-2 ml-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
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
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: list.color + '20' }}
              >
                <Plus className="w-8 h-8" style={{ color: list.color }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                No entries yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Drag entries here or add from daily notes
              </p>
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

