import { useState, useEffect, useRef } from 'react';
import { X, Columns } from 'lucide-react';
import type { List } from '../types';
import { listsApi } from '../api';

interface EntryListSelectorProps {
  entryId: number;
  currentLists: List[];
  onUpdate: () => void;
}

const EntryListSelector = ({ entryId, currentLists, onUpdate }: EntryListSelectorProps) => {
  const [allLists, setAllLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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
      console.error('Error toggling list membership:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveFromList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessing(true);
      await listsApi.removeEntry(listId, entryId);
      onUpdate();
    } catch (error: any) {
      console.error('Error removing from list:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Lists Display */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {currentLists.map((list) => (
          <div
            key={list.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: list.color + '15',
              color: list.color,
              border: `1px solid ${list.color}30`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = list.color + '25';
              e.currentTarget.style.borderColor = list.color + '50';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = list.color + '15';
              e.currentTarget.style.borderColor = list.color + '30';
            }}
            title={list.description || list.name}
          >
            <Columns className="w-2.5 h-2.5" />
            <span>{list.name}</span>
            <button
              className="inline-flex items-center justify-center hover:opacity-70 cursor-pointer"
              onClick={(e) => handleRemoveFromList(list.id, e)}
              disabled={processing}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        {/* Add to List Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-tertiary)',
            border: '1px dashed var(--color-border-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.borderStyle = 'solid';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
            e.currentTarget.style.borderStyle = 'dashed';
          }}
          title="Add to list"
        >
          <Columns className="w-2.5 h-2.5" />
          <span>Add to list</span>
        </button>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 mt-2 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            minWidth: '280px',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }}
        >
          {loading ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Loading lists...
            </div>
          ) : allLists.length === 0 ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <p>No lists available</p>
              <p className="text-xs mt-1">Create a list from the Lists page</p>
            </div>
          ) : (
            <div className="p-2">
              {allLists.map((list) => {
                const inList = isInList(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleToggleList(list.id)}
                    disabled={processing}
                    className="w-full p-2 rounded flex items-center gap-2 text-left transition-colors"
                    style={{
                      backgroundColor: inList ? list.color + '15' : 'transparent',
                      opacity: processing ? 0.6 : 1,
                      cursor: processing ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!processing) {
                        e.currentTarget.style.backgroundColor = inList ? list.color + '25' : 'var(--color-bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!processing) {
                        e.currentTarget.style.backgroundColor = inList ? list.color + '15' : 'transparent';
                      }
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded flex-shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {list.name}
                      </div>
                      {list.description && (
                        <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                          {list.description}
                        </div>
                      )}
                    </div>
                    {inList && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: list.color }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntryListSelector;

