import { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { List } from '../types';
import { listsApi } from '../api';

interface EntryListSelectorProps {
  entryId: number;
  currentLists: List[];
  onClose: () => void;
  onUpdate: () => void;
}

const EntryListSelector = ({ entryId, currentLists, onClose, onUpdate }: EntryListSelectorProps) => {
  const [allLists, setAllLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const lists = await listsApi.getAll(false);
      setAllLists(lists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInList = (listId: number) => {
    return currentLists.some((list) => list.id === listId);
  };

  const handleToggleList = async (listId: number) => {
    try {
      setProcessing(true);
      if (isInList(listId)) {
        // Remove from list
        await listsApi.removeEntry(listId, entryId);
      } else {
        // Add to list
        await listsApi.addEntry(listId, entryId);
      }
      onUpdate();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to update list membership');
      console.error('Error toggling list membership:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-96 max-w-full m-4 max-h-[80vh] flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Organize in Lists
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
              Loading lists...
            </div>
          ) : allLists.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
              <p>No lists available</p>
              <p className="text-sm mt-2">Create a list first from the Lists page</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allLists.map((list) => {
                const inList = isInList(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleToggleList(list.id)}
                    disabled={processing}
                    className="w-full p-3 rounded flex items-center justify-between transition-colors"
                    style={{
                      backgroundColor: inList
                        ? list.color + '20'
                        : 'var(--color-background)',
                      borderColor: list.color,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      opacity: processing ? 0.6 : 1,
                      cursor: processing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: list.color }}
                      />
                      <div className="text-left">
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {list.name}
                        </div>
                        {list.description && (
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {list.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {inList && (
                      <Check className="w-5 h-5" style={{ color: list.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
            {currentLists.length > 0
              ? `In ${currentLists.length} ${currentLists.length === 1 ? 'list' : 'lists'}`
              : 'Not in any lists'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntryListSelector;

