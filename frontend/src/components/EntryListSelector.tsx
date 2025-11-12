import { useState, useEffect, useRef } from 'react';
import { X, Plus, Columns } from 'lucide-react';
import type { List } from '../types';
import { listsApi } from '../api';

interface EntryListSelectorProps {
  entryId: number;
  currentLists: List[];
  onUpdate: () => void;
  onOptimisticUpdate?: (lists: List[]) => void;
}

const EntryListSelector = ({ entryId, currentLists, onUpdate, onOptimisticUpdate }: EntryListSelectorProps) => {
  const [allLists, setAllLists] = useState<List[]>([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<List[]>([]);
  const [localLists, setLocalLists] = useState<List[]>(currentLists);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    setLocalLists(currentLists);
  }, [currentLists]);

  const loadLists = async () => {
    try {
      const lists = await listsApi.getAll(false);
      setAllLists(lists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleInputChange = (value: string) => {
    setNewListName(value);
    
    if (value.trim()) {
      const filtered = allLists.filter(list => 
        list.name.toLowerCase().includes(value.toLowerCase()) &&
        !localLists.some(l => l.id === list.id)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (list: List) => {
    setNewListName('');
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    await addListToEntry(list);
  };

  const addListToEntry = async (list: List) => {
    // Optimistically add list to UI
    const newLists = [...localLists, list];
    setLocalLists(newLists);
    if (onOptimisticUpdate) {
      onOptimisticUpdate(newLists);
    }

    setLoading(true);
    try {
      await listsApi.addEntry(list.id, entryId);
      // No need to reload - optimistic update already happened
    } catch (error: any) {
      console.error('Failed to add to list:', error);
      // Revert on error
      setLocalLists(currentLists);
      if (onOptimisticUpdate) {
        onOptimisticUpdate(currentLists);
      }
      if (error.response?.status !== 400) {
        alert('Failed to add to list');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async () => {
    const listName = newListName.trim();
    if (!listName) return;

    setLoading(true);
    setShowSuggestions(false);
    try {
      // Check if list exists
      let list = allLists.find(l => l.name.toLowerCase() === listName.toLowerCase());

      // Create list if it doesn't exist
      if (!list) {
        const newList = await listsApi.create({
          name: listName,
          description: '',
          color: getRandomColor(),
          is_archived: false,
        });
        list = newList;
        await loadLists(); // Reload lists
      }

      // Add entry to list
      await addListToEntry(list);
      setNewListName('');
    } catch (error: any) {
      console.error('Failed to add list:', error);
      if (error.response?.status !== 400) {
        alert('Failed to add list');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveList = async (listId: number) => {
    // Optimistically remove list from UI
    const newLists = localLists.filter(l => l.id !== listId);
    setLocalLists(newLists);
    if (onOptimisticUpdate) {
      onOptimisticUpdate(newLists);
    }

    setLoading(true);
    try {
      await listsApi.removeEntry(listId, entryId);
      // No need to reload - optimistic update already happened
    } catch (error) {
      console.error('Failed to remove from list:', error);
      // Revert on error
      setLocalLists(currentLists);
      if (onOptimisticUpdate) {
        onOptimisticUpdate(currentLists);
      }
      alert('Failed to remove from list');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newListName}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a list name..."
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
            }}
            onFocus={(e) => {
              if (newListName.trim() && filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
            }}
            onBlur={(e) => {
              setTimeout(() => setShowSuggestions(false), 200);
              e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                border: '1px solid var(--color-border-primary)',
              }}
            >
              {filteredSuggestions.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleSelectSuggestion(list)}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="text-sm font-medium">{list.name}</span>
                  {list.description && (
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      - {list.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleAddList}
          disabled={loading || !newListName.trim()}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Display current lists */}
      <div className="flex items-center gap-2 flex-wrap">
        {localLists.map((list) => (
          <button
            key={list.id}
            onClick={() => handleRemoveList(list.id)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-50"
            style={{ 
              backgroundColor: list.color,
              color: 'white',
              animation: 'fadeIn 0.2s ease-in'
            }}
            title="Click to remove"
          >
            <Columns className="h-3 w-3" />
            {list.name}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default EntryListSelector;
