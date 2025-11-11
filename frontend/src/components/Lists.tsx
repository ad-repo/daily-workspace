import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedListId, setDraggedListId] = useState<number | null>(null);
  const [dragOverListId, setDragOverListId] = useState<number | null>(null);

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
      // CRITICAL: Sort by order_index to maintain correct order
      // Promise.all doesn't guarantee order, so we must sort explicitly
      detailedLists.sort((a, b) => a.order_index - b.order_index);
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

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || lists.length === 0) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth - container.clientWidth;
    const progress = scrollWidth > 0 ? scrollLeft / scrollWidth : 0;
    setScrollProgress(progress);
  }, [lists.length]);

  const handleListDragStart = (listId: number) => {
    setDraggedListId(listId);
  };

  const handleListDragOver = (e: React.DragEvent, listId: number) => {
    e.preventDefault();
    if (draggedListId === null || draggedListId === listId) return;
    setDragOverListId(listId);
  };

  const handleListDragLeave = () => {
    setDragOverListId(null);
  };

  const handleListDrop = async (e: React.DragEvent, targetListId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedListId === null || draggedListId === targetListId) {
      setDraggedListId(null);
      setDragOverListId(null);
      return;
    }

    try {
      // Find the indices
      const draggedIndex = lists.findIndex((l) => l.id === draggedListId);
      const targetIndex = lists.findIndex((l) => l.id === targetListId);

      if (draggedIndex === -1 || targetIndex === -1) {
        console.error('Invalid indices', { draggedIndex, targetIndex });
        return;
      }

      console.log('Reordering from', draggedIndex, 'to', targetIndex);

      // Reorder locally first for instant feedback
      const newLists = [...lists];
      const [removed] = newLists.splice(draggedIndex, 1);
      newLists.splice(targetIndex, 0, removed);

      // Update order_index for all lists
      const reorderedLists = newLists.map((list, index) => ({
        id: list.id,
        order_index: index,
      }));

      console.log('New order:', reorderedLists);

      // Update state immediately
      setLists(newLists);
      setDraggedListId(null);
      setDragOverListId(null);

      // Send to backend in background
      await listsApi.reorderLists(reorderedLists);
      console.log('Backend updated successfully');
    } catch (err) {
      console.error('Error reordering lists:', err);
      // Reload to get correct state
      await loadLists(true);
    }
  };

  const handleListDragEnd = () => {
    setDraggedListId(null);
    setDragOverListId(null);
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
      {/* Lists Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden" 
        style={{ position: 'relative' }}
      >
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
                Create lists to organize your note entries in Trello-style boards
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 p-8 h-full items-start">
            {lists.map((list) => (
              <div
                key={list.id}
                onDragOver={(e) => handleListDragOver(e, list.id)}
                onDragLeave={handleListDragLeave}
                onDrop={(e) => handleListDrop(e, list.id)}
                style={{
                  opacity: draggedListId === list.id ? 0.5 : 1,
                  transform: dragOverListId === list.id && draggedListId !== list.id ? 'scale(1.02)' : 'scale(1)',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                }}
              >
                <ListColumn
                  list={list}
                  entries={list.entries}
                  onUpdate={() => loadLists(true)}
                  onDelete={handleDeleteList}
                  onDragStart={() => handleListDragStart(list.id)}
                  onDragEnd={handleListDragEnd}
                  isDragging={draggedListId === list.id}
                />
              </div>
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        {lists.length > 0 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div 
              className="flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--color-card-bg)' + 'f0',
                border: '2px solid var(--color-border)',
              }}
            >
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {lists.length} {lists.length === 1 ? 'list' : 'lists'}
              </span>
              {lists.length > 1 && (
                <>
                  <div 
                    className="w-px h-4" 
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                  <div className="flex gap-2">
                    {lists.map((list, index) => {
                      const listProgress = index / Math.max(lists.length - 1, 1);
                      const isActive = Math.abs(scrollProgress - listProgress) < 0.35;
                      
                      return (
                        <div
                          key={list.id}
                          className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                            transform: isActive ? 'scale(1.4)' : 'scale(1)',
                            boxShadow: isActive ? `0 0 8px ${list.color}` : 'none',
                          }}
                          title={list.name}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-3xl flex items-center justify-center z-40"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'white',
        }}
        title="Create New List"
      >
        <Plus className="w-8 h-8" />
      </button>

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

