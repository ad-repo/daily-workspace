import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus } from 'lucide-react';
import { notesApi, listsApi } from '../api';
import type { NoteEntry, List } from '../types';
import { format } from 'date-fns';

interface AddEntryToListModalProps {
  list: List;
  onClose: () => void;
  onUpdate: () => void;
}

const AddEntryToListModal = ({ list, onClose, onUpdate }: AddEntryToListModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allEntries, setAllEntries] = useState<NoteEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, allEntries]);

  // Add Escape key support
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const notes = await notesApi.getAll();
      const entries: NoteEntry[] = [];
      notes.forEach((note) => {
        note.entries.forEach((entry) => {
          entries.push(entry);
        });
      });
      setAllEntries(entries);
    } catch (err) {
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    // Filter out entries already in this list
    const availableEntries = allEntries.filter(
      (entry) => !entry.lists?.some((l) => l.id === list.id)
    );

    if (!searchQuery.trim()) {
      setFilteredEntries(availableEntries.slice(0, 20)); // Show first 20 if no search
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableEntries.filter((entry) => {
      // Search in title
      const titleMatch = entry.title?.toLowerCase().includes(query);
      
      // Search in content (strip HTML for better matching)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = entry.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      const contentMatch = textContent.toLowerCase().includes(query);
      
      // Search in labels
      const labelMatch = entry.labels?.some((label) => 
        label.name.toLowerCase().includes(query)
      );
      
      return titleMatch || contentMatch || labelMatch;
    });

    setFilteredEntries(filtered.slice(0, 50)); // Limit to 50 results
  };

  const handleAddEntry = async (entryId: number) => {
    try {
      setAdding(entryId);
      await listsApi.addEntry(list.id, entryId);
      onUpdate();
      // Remove the added entry from the view
      setAllEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to add entry to list');
      console.error('Error adding entry:', err);
    } finally {
      setAdding(null);
    }
  };

  const getTextPreview = (html: string, maxLength: number = 100) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const isEntryInList = (entry: NoteEntry) => {
    return entry.lists?.some((l) => l.id === list.id);
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: 'var(--color-border)',
            borderBottom: `3px solid ${list.color}`,
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Add Entries to {list.name}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-background)',
              }}
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries by title, content, or labels..."
              className="w-full pl-11 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
              Loading entries...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {searchQuery.trim() ? 'No entries found matching your search' : 'Start typing to search for entries'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => {
                const inList = isEntryInList(entry);
                const isAdding = adding === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border-2 p-4 transition-all"
                    style={{
                      backgroundColor: inList ? `${list.color}10` : 'var(--color-background)',
                      borderColor: inList ? list.color : 'var(--color-border)',
                      opacity: inList ? 0.6 : 1,
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        {entry.title && (
                          <h3
                            className="font-semibold mb-1 truncate"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {entry.title}
                          </h3>
                        )}

                        {/* Content preview */}
                        <p
                          className="text-sm mb-2"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {getTextPreview(entry.content)}
                        </p>

                        {/* Labels */}
                        {entry.labels && entry.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {entry.labels.slice(0, 3).map((label) => (
                              <span
                                key={label.id}
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: label.color + '20',
                                  color: label.color,
                                  border: `1px solid ${label.color}`,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                            {entry.labels.length > 3 && (
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: 'var(--color-background)',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                +{entry.labels.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Date */}
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {format(new Date(entry.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>

                      {/* Add button */}
                      <button
                        onClick={() => handleAddEntry(entry.id)}
                        disabled={inList || isAdding}
                        className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-md flex-shrink-0 flex items-center gap-2"
                        style={{
                          backgroundColor: inList ? 'var(--color-border)' : list.color,
                          color: 'white',
                          opacity: inList || isAdding ? 0.5 : 1,
                          cursor: inList || isAdding ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {inList ? (
                          'In List'
                        ) : isAdding ? (
                          'Adding...'
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddEntryToListModal;
