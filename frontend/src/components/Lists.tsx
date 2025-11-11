import { useState, useEffect } from 'react';
import { List, ListWithEntries } from '../types';
import { listsApi } from '../api';
import ListColumn from './ListColumn';

export default function Lists() {
  const [lists, setLists] = useState<ListWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListColor, setNewListColor] = useState('#3b82f6');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
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
    }
  };

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
      loadLists();
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
      loadLists();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete list');
      console.error('Error deleting list:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading lists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div
        className="p-4 border-b flex justify-between items-center"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Lists
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded transition-all hover:scale-105 hover:shadow-lg font-medium"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
          }}
        >
          + Create List
        </button>
      </div>

      {/* Lists Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {lists.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
              <p className="text-xl mb-4">No lists yet</p>
              <p>Create your first list to organize your note entries</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 p-4 h-full">
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                entries={list.entries}
                onUpdate={loadLists}
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

