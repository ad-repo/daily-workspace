import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListWithEntries } from '../types';
import { kanbanApi, listsApi } from '../api';
import ListColumn from './ListColumn';
import { Plus, RefreshCw } from 'lucide-react';

export default function Kanban() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [boards, setBoards] = useState<ListWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDescription, setNewColumnDescription] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#3b82f6');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedListId, setDraggedListId] = useState<number | null>(null);
  const [dragOverListId, setDragOverListId] = useState<number | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  // Handle highlight and scroll to specific entry in specific column
  useEffect(() => {
    if (boards.length === 0) return;

    const highlightEntryId = searchParams.get('highlight');
    const targetListId = searchParams.get('list');

    if (targetListId) {
      setTimeout(() => {
        // Find the column
        const listColumn = document.querySelector(`[data-testid="list-column-${targetListId}"]`);
        if (listColumn) {
          // Scroll horizontally to the column
          listColumn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          
          // If there's also a highlight entry, scroll to and highlight it
          if (highlightEntryId) {
            setTimeout(() => {
              const entryCard = listColumn.querySelector(`[data-entry-id="${highlightEntryId}"]`);
              if (entryCard) {
                entryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight animation
                entryCard.classList.add('highlight-pulse');
                setTimeout(() => {
                  entryCard.classList.remove('highlight-pulse');
                }, 2000);
              }
            }, 300);
          }
        }

        // Clear query params after scrolling
        searchParams.delete('highlight');
        searchParams.delete('list');
        setSearchParams(searchParams, { replace: true });
      }, 300);
    }
  }, [boards, searchParams, setSearchParams]);

  const loadBoards = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const kanbanBoards = await kanbanApi.getBoards();
      setBoards(kanbanBoards);
      setError(null);
    } catch (err) {
      setError('Failed to load Kanban board');
      console.error('Error loading Kanban board:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleInitializeKanban = async () => {
    try {
      await kanbanApi.initialize();
      await loadBoards();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to initialize Kanban board');
      console.error('Error initializing Kanban:', err);
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) {
      alert('Column name is required');
      return;
    }

    try {
      // Find the highest kanban_order
      const maxOrder = boards.reduce((max, board) => Math.max(max, board.kanban_order || 0), -1);
      
      await listsApi.create({
        name: newColumnName,
        description: newColumnDescription,
        color: newColumnColor,
        is_kanban: true,
        kanban_order: maxOrder + 1,
        order_index: 0,
      });
      
      setNewColumnName('');
      setNewColumnDescription('');
      setNewColumnColor('#3b82f6');
      setShowCreateModal(false);
      await loadBoards();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create column');
      console.error('Error creating column:', err);
    }
  };

  const handleDeleteColumn = async (listId: number, listName: string) => {
    if (!confirm(`Delete column "${listName}"? Entries in this column will not be deleted.`)) {
      return;
    }

    try {
      await listsApi.delete(listId);
      await loadBoards();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete column');
      console.error('Error deleting column:', err);
    }
  };

  // Handle scroll tracking for mini-map
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    // Initial calculation
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [boards]);

  // Handle column drag and drop for reordering
  const handleListDragStart = (listId: number) => {
    setDraggedListId(listId);
  };

  const handleListDragEnd = () => {
    setDraggedListId(null);
    setDragOverListId(null);
  };

  const handleListDragOver = (e: React.DragEvent, targetListId: number) => {
    e.preventDefault();
    if (draggedListId !== null && draggedListId !== targetListId) {
      setDragOverListId(targetListId);
    }
  };

  const handleListDragLeave = () => {
    setDragOverListId(null);
  };

  const handleListDrop = async (e: React.DragEvent, targetListId: number) => {
    e.preventDefault();
    setDragOverListId(null);

    if (draggedListId === null || draggedListId === targetListId) {
      return;
    }

    try {
      const draggedIndex = boards.findIndex((b) => b.id === draggedListId);
      const targetIndex = boards.findIndex((b) => b.id === targetListId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // Reorder locally for immediate feedback
      const newBoards = [...boards];
      const [removed] = newBoards.splice(draggedIndex, 1);
      newBoards.splice(targetIndex, 0, removed);

      // Update kanban_order for all columns
      const updates = newBoards.map((board, index) => ({
        id: board.id,
        order_index: index,
      }));

      setBoards(newBoards);

      // Send to backend
      await kanbanApi.reorderColumns(updates);
    } catch (err) {
      console.error('Error reordering columns:', err);
      // Reload on error
      await loadBoards(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Loading Kanban board...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  // Show initialize button if no Kanban columns exist
  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          No Kanban Board Yet
        </div>
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Create your first Kanban board with default columns (To Do, In Progress, Done)
        </div>
        <button
          onClick={handleInitializeKanban}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
          }}
        >
          <Plus className="h-5 w-5" />
          Initialize Kanban Board
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Kanban Board
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Organize your tasks by workflow state
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadBoards(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
            }}
            title="Refresh board"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
            }}
          >
            <Plus className="h-5 w-5" />
            Add Column
          </button>
        </div>
      </div>

      {/* Kanban Board - Horizontal Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar"
        style={{
          scrollSnapType: 'x proximity',
        }}
      >
        {boards.map((board) => (
          <div
            key={board.id}
            onDragOver={(e) => handleListDragOver(e, board.id)}
            onDragLeave={handleListDragLeave}
            onDrop={(e) => handleListDrop(e, board.id)}
            style={{
              opacity: draggedListId === board.id ? 0.5 : 1,
              transform: dragOverListId === board.id && draggedListId !== board.id ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              scrollSnapAlign: 'start',
              minWidth: '350px',
              maxWidth: '400px',
            }}
          >
            <ListColumn
              list={board}
              entries={board.entries}
              onUpdate={() => loadBoards(true)}
              onDelete={handleDeleteColumn}
              onDragStart={() => handleListDragStart(board.id)}
              onDragEnd={handleListDragEnd}
              isDragging={draggedListId === board.id}
            />
          </div>
        ))}
      </div>

      {/* Mini-map / Progress Indicator */}
      {boards.length > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          {boards.map((board, index) => {
            const boardProgress = index / Math.max(boards.length - 1, 1);
            const isActive = Math.abs(scrollProgress - boardProgress) < 0.35;
            return (
              <button
                key={board.id}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container) {
                    const targetScroll = (container.scrollWidth - container.clientWidth) * boardProgress;
                    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
                  }
                }}
                className="transition-all"
                style={{
                  width: isActive ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? board.color : 'var(--color-border-primary)',
                  opacity: isActive ? 1 : 0.5,
                }}
                title={board.name}
              />
            );
          })}
        </div>
      )}

      {/* Create Column Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="rounded-lg p-6 w-full max-w-md"
            style={{ backgroundColor: 'var(--color-card-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Create New Column
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Column Name
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g., Review, Testing, Blocked"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newColumnDescription}
                  onChange={(e) => setNewColumnDescription(e.target.value)}
                  placeholder="Brief description"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Color
                </label>
                <input
                  type="color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateColumn}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-text)',
                  }}
                >
                  Create Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

