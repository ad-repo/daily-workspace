import { useState, useEffect } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import axios from 'axios';
import EmojiPicker from './EmojiPicker';
import { useTransparentLabels } from '../contexts/TransparentLabelsContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Label {
  id: number;
  name: string;
  color: string;
}

interface LabelSelectorProps {
  date?: string;
  entryId?: number;
  selectedLabels: Label[];
  onLabelsChange: () => void;
  onOptimisticUpdate?: (labels: Label[]) => void;
}

const LabelSelector = ({ date, entryId, selectedLabels, onOptimisticUpdate }: LabelSelectorProps) => {
  const { transparentLabels } = useTransparentLabels();
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Label[]>([]);
  const [localLabels, setLocalLabels] = useState<Label[]>(selectedLabels);

  // Check if a string is only emojis (with optional spaces)
  const isEmojiOnly = (str: string): boolean => {
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\s]+$/u;
    return emojiRegex.test(str.trim());
  };

  useEffect(() => {
    loadLabels();
  }, []);

  useEffect(() => {
    setLocalLabels(selectedLabels);
  }, [selectedLabels]);

  const loadLabels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/labels/`);
      setAllLabels(response.data);
    } catch (error) {
      console.error('Failed to load labels:', error);
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
    setNewLabelName(value);
    
    if (value.trim()) {
      const filtered = allLabels.filter(label => 
        label.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedLabels.some(sl => sl.id === label.id)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (label: Label) => {
    setNewLabelName('');
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    await addLabelToItem(label);
  };

  const addLabelToItem = async (label: Label) => {
    // Optimistically add label to UI
    const newLabels = [...localLabels, label];
    setLocalLabels(newLabels);
    if (onOptimisticUpdate) {
      onOptimisticUpdate(newLabels);
    }

    setLoading(true);
    try {
      // Add label to note or entry
      if (entryId) {
        await axios.post(`${API_URL}/api/labels/entry/${entryId}/label/${label.id}`);
      } else if (date) {
        await axios.post(`${API_URL}/api/labels/note/${date}/label/${label.id}`);
      }
      
      // No need to reload - optimistic update already happened
    } catch (error: any) {
      console.error('Failed to add label:', error);
      // Revert on error
      setLocalLabels(selectedLabels);
      if (onOptimisticUpdate) {
        onOptimisticUpdate(selectedLabels);
      }
      if (error.response?.status !== 400) { // 400 means label already on note/entry
        alert('Failed to add label');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async () => {
    const labelName = newLabelName.trim();
    if (!labelName) return;

    setLoading(true);
    setShowSuggestions(false);
    try {
      // For emoji labels, keep original case; for text labels, use lowercase
      const searchName = isEmojiOnly(labelName) ? labelName : labelName.toLowerCase();
      
      // Check if label exists
      let label = allLabels.find(l => 
        isEmojiOnly(l.name) ? l.name === searchName : l.name.toLowerCase() === searchName
      );

      // Create label if it doesn't exist
      if (!label) {
        const response = await axios.post(`${API_URL}/api/labels/`, {
          name: searchName,
          color: getRandomColor(),
        });
        label = response.data;
        await loadLabels(); // Reload labels
      }

      // Add label to note or entry
      await addLabelToItem(label);
      setNewLabelName('');
    } catch (error: any) {
      console.error('Failed to add label:', error);
      if (error.response?.status !== 400) { // 400 means label already on note/entry
        alert('Failed to add label');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLabel = async (labelId: number) => {
    // Optimistically remove label from UI
    const newLabels = localLabels.filter(l => l.id !== labelId);
    setLocalLabels(newLabels);
    if (onOptimisticUpdate) {
      onOptimisticUpdate(newLabels);
    }

    setLoading(true);
    try {
      if (entryId) {
        await axios.delete(`${API_URL}/api/labels/entry/${entryId}/label/${labelId}`);
      } else if (date) {
        await axios.delete(`${API_URL}/api/labels/note/${date}/label/${labelId}`);
      }
      
      // No need to reload - optimistic update already happened
    } catch (error) {
      console.error('Failed to remove label:', error);
      // Revert on error
      setLocalLabels(selectedLabels);
      if (onOptimisticUpdate) {
        onOptimisticUpdate(selectedLabels);
      }
      alert('Failed to remove label');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    setNewLabelName(emoji);
    setLoading(true);
    setShowSuggestions(false);
    try {
      // Check if label exists
      let label = allLabels.find(l => l.name === emoji);

      // Create label if it doesn't exist
      if (!label) {
        const response = await axios.post(`${API_URL}/api/labels/`, {
          name: emoji,
          color: getRandomColor(),
        });
        label = response.data;
        await loadLabels(); // Reload labels
      }

      // Add label to note or entry
      await addLabelToItem(label);
      setNewLabelName('');
    } catch (error: any) {
      console.error('Failed to add emoji label:', error);
      if (error.response?.status !== 400) { // 400 means label already on note/entry
        alert('Failed to add emoji label');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a label name or emoji..."
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
            }}
            onFocus={(e) => {
              if (newLabelName.trim() && filteredSuggestions.length > 0) {
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
          
          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <div 
              className="absolute w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                border: '1px solid var(--color-border-primary)',
                zIndex: 1000,
              }}
            >
              {filteredSuggestions.map((label) => {
                const isEmoji = isEmojiOnly(label.name);
                return (
                  <button
                    key={label.id}
                    onClick={() => handleSelectSuggestion(label)}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {isEmoji ? (
                      <span className="text-lg">{label.name}</span>
                    ) : (
                      <>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm">{label.name}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <button
          onClick={handleAddLabel}
          disabled={loading || !newLabelName.trim()}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
        
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      </div>

      {/* Display selected labels */}
      <div className="flex items-center gap-2 flex-wrap">
        {localLabels.map((label) => {
          const isEmoji = isEmojiOnly(label.name);
          
          if (isEmoji) {
            // Emoji-only label - simpler display
            return (
              <button
                key={label.id}
                onClick={() => handleRemoveLabel(label.id)}
                disabled={loading}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-2xl transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 animate-fadeIn"
                title="Click to remove"
                style={{
                  animation: 'fadeIn 0.2s ease-in'
                }}
              >
                {label.name}
                <X className="h-3 w-3 text-gray-500" />
              </button>
            );
          }
          
          // Text label - traditional pill style or transparent
          return (
            <button
              key={label.id}
              onClick={() => handleRemoveLabel(label.id)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-50"
              style={{ 
                backgroundColor: transparentLabels ? 'transparent' : label.color,
                color: transparentLabels ? label.color : 'white',
                border: transparentLabels ? `1px solid ${label.color}` : 'none',
                animation: 'fadeIn 0.2s ease-in'
              }}
              title="Click to remove"
            >
              <TagIcon className="h-3 w-3" />
              {label.name}
              <X className="h-3 w-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LabelSelector;

