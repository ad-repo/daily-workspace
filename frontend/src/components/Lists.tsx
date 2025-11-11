import { useState, useEffect, useCallback } from 'react';
import { List, ListWithEntries } from '../types';
import { listsApi } from '../api';
import ListColumn from './ListColumn';
import { Plus } from 'lucide-react';

export default function Lists() {
  const [lists, setLists] = useState<ListWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListColor, setNewListColor] = useState('#3b82f6');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      // Get all lists first
      const allLists = await listsApi.getAll(false);
      // Fetch detailed data (with entries) for each list
      const detailedLists = await Promise.all(
        allLists.map((list) => listsApi.getById(list.id))
      );
      setLists(detailedLists);
      setError(null);
    } catch (err) {
      setError('Failed to load lists');
      console.error('Error loading lists:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('List name is required');
      return;
    }

    try {
      await listsApi.create({
        name: newListName,
        description: newListDescription,
        color: newListColor,
      });
      setNewListName('');
      setNewListDescription('');
      setNewListColor('#3b82f6');
      setShowCreateModal(false);
      loadLists(true); // Silent refresh
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create list');
      console.error('Error creating list:', err);
    }
  };

  const handleDeleteList = async (listId: number, listName: string) => {
    if (!confirm(`Delete list "${listName}"? Entries will not be deleted.`)) {
      return;
    }

    try {
      await listsApi.delete(listId);
      loadLists(true); // Silent refresh
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete list');
      console.error('Error deleting list:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>
            Loading lists...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="text-red-500 text-lg">{error}</div>
          <button
            onClick={() => loadLists()}
            className="mt-4 px-4 py-2 rounded"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div
        className="px-8 py-6 border-b flex justify-between items-center shadow-sm"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
        }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Lists
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Organize your entries in Trello-style boards
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-lg transition-all hover:scale-105 hover:shadow-lg font-semibold flex items-center gap-2"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
          }}
        >
          <Plus className="w-5 h-5" />
          Create List
        </button>
      </div>

      {/* Lists Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ position: 'relative' }}>
        {isRefreshing && (
          <div className="absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
            Updating...
          </div>
        )}
        {lists.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-8">
              <div className="mb-6">
                <div
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--color-accent)' + '20' }}
                >
                  <Plus className="w-12 h-12" style={{ color: 'var(--color-accent)' }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                No lists yet
              </h2>
              <p className="mb-6 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Create your first list to start organizing your note entries
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                Create Your First List
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 p-8 h-full items-start">
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                entries={list.entries}
                onUpdate={() => loadLists(true)}
                onDelete={handleDeleteList}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="rounded-xl shadow-2xl p-6 w-full max-w-md"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Create New List
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  List Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                  className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="e.g., In Progress, To Do, Done"
                  autoFocus
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Description
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="Add a description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Color Theme
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newListColor}
                    onChange={(e) => setNewListColor(e.target.value)}
                    className="w-16 h-12 rounded-lg border-2 cursor-pointer"
                    style={{
                      borderColor: 'var(--color-border)',
                    }}
                  />
                  <div
                    className="flex-1 px-4 py-2.5 rounded-lg border-2 font-mono text-sm"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {newListColor.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCreateList}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                Create List
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewListName('');
                  setNewListDescription('');
                  setNewListColor('#3b82f6');
                }}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:bg-opacity-80 border-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

