import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Code, CheckSquare, Combine } from 'lucide-react';
import axios from 'axios';
import { notesApi, entriesApi } from '../api';
import type { DailyNote, NoteEntry } from '../types';
import NoteEntryCard from './NoteEntryCard';
import LabelSelector from './LabelSelector';
import EntryTimeline from './EntryTimeline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DailyView = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<DailyNote | null>(null);
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (date) {
      // Scroll to top immediately when date changes
      window.scrollTo({ top: 0, behavior: 'instant' });
      loadDailyNote();
    }
  }, [date]);

  // Scroll to specific entry if hash is present
  useEffect(() => {
    if (entries.length > 0 && window.location.hash) {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash.startsWith('entry-')) {
        const entryId = hash.replace('entry-', '');
        setTimeout(() => {
          const element = document.querySelector(`[data-entry-id="${entryId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Clear the hash after scrolling
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 300);
      }
    }
  }, [entries]);

  const loadDailyNote = async (preserveScroll = false) => {
    if (!date) return;

    // Save current scroll position if we want to preserve it
    const scrollY = preserveScroll ? window.scrollY : 0;

    setLoading(true);
    try {
      const noteData = await notesApi.getByDate(date);
      setNote(noteData);
      // Keep entries in their original order (sorted by order_index from backend)
      setEntries(noteData.entries || []);
      setDailyGoal(noteData.daily_goal || '');
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Note doesn't exist yet
        setNote(null);
        setEntries([]);
        setDailyGoal('');
      } else {
        console.error('Failed to load note:', error);
      }
    } finally {
      setLoading(false);
      // Restore scroll position if preserving, otherwise scroll to top
      if (preserveScroll) {
        setTimeout(() => window.scrollTo({ top: scrollY, behavior: 'instant' }), 0);
      } else {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
      }
    }
  };

  const handlePreviousDay = () => {
    if (!date) return;
    const currentDate = parse(date, 'yyyy-MM-dd', new Date());
    const prevDate = subDays(currentDate, 1);
    navigate(`/day/${format(prevDate, 'yyyy-MM-dd')}`);
  };

  const handleNextDay = () => {
    if (!date) return;
    const currentDate = parse(date, 'yyyy-MM-dd', new Date());
    const nextDate = addDays(currentDate, 1);
    navigate(`/day/${format(nextDate, 'yyyy-MM-dd')}`);
  };

  const handleAddEntry = async (contentType: 'rich_text' | 'code' = 'rich_text') => {
    if (!date) return;

    try {
      const newEntry = await entriesApi.create(date, {
        content: '',
        content_type: contentType,
        order_index: 0,
      });
      
      // Add new entry at the beginning with slide-in animation
      setEntries([newEntry, ...entries]);
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  const handleEntryUpdate = async (entryId: number, content: string) => {
    try {
      await entriesApi.update(entryId, { content });
      setEntries(entries.map(e => e.id === entryId ? { ...e, content } : e));
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  const handleMoveToTop = async (entryId: number) => {
    // Optimistically move the entry to the top in the UI
    const entryIndex = entries.findIndex(e => e.id === entryId);
    if (entryIndex > 0) {
      const entry = entries[entryIndex];
      const newEntries = [entry, ...entries.filter(e => e.id !== entryId)];
      setEntries(newEntries);
    }
    // No need to reload - the optimistic update is enough
    // The server has already updated the order_index in the background
  };

  const handleEntryLabelsUpdate = (entryId: number, newLabels: any[]) => {
    // Optimistically update the entry's labels in the entries list
    setEntries(prevEntries => 
      prevEntries.map(entry => 
        entry.id === entryId 
          ? { ...entry, labels: newLabels }
          : entry
      )
    );
  };

  const handleEntryDelete = async (entryId: number) => {
    try {
      // Optimistically remove from UI with fade out effect
      const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
      if (entryElement) {
        entryElement.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await entriesApi.delete(entryId);
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      // Restore opacity on error
      const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
      if (entryElement) {
        entryElement.classList.remove('opacity-0');
      }
    }
  };

  const handleDailyGoalChange = async (newGoal: string) => {
    if (!date) return;
    setDailyGoal(newGoal);
    
    // Debounce the save
    const timeoutId = setTimeout(async () => {
      try {
        if (note) {
          await notesApi.update(date, { daily_goal: newGoal });
        } else {
          await notesApi.create({ date, daily_goal: newGoal, fire_rating: 0 });
          loadDailyNote();
        }
      } catch (error) {
        console.error('Failed to update daily goal:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleSelectionChange = (entryId: number, selected: boolean) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(entryId);
      } else {
        newSet.delete(entryId);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedEntries(new Set()); // Clear selection when toggling
  };

  const handleMergeEntries = async () => {
    if (selectedEntries.size < 2) {
      alert('Please select at least 2 entries to merge');
      return;
    }

    if (!window.confirm(`Merge ${selectedEntries.size} selected entries? The original entries will be deleted.`)) {
      return;
    }

    setIsMerging(true);
    try {
      await axios.post(`${API_URL}/api/entries/merge`, {
        entry_ids: Array.from(selectedEntries),
        separator: '\n\n',
        delete_originals: true
      });

      // Reload the daily note to get the updated entries
      await loadDailyNote();
      
      // Reset selection state
      setSelectedEntries(new Set());
      setSelectionMode(false);
    } catch (error: any) {
      console.error('Failed to merge entries:', error);
      alert(error.response?.data?.detail || 'Failed to merge entries');
    } finally {
      setIsMerging(false);
    }
  };

  if (!date) return null;

  const currentDate = parse(date, 'yyyy-MM-dd', new Date());
  const isToday = format(new Date(), 'yyyy-MM-dd') === date;

  return (
    <div className="relative page-fade-in">
      <EntryTimeline entries={entries} />
      <div className="max-w-4xl mx-auto px-4 xl:px-8">
      {/* Header */}
      <div 
        className="rounded-lg shadow-lg p-8 mb-8"
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousDay}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h1>
            {isToday && (
              <span 
                className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)'
                }}
              >
                Today
              </span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Next day"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

          <div className="flex flex-col items-center gap-6 w-full">
            {/* Daily Goals Section */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Daily Goals:</label>
              <textarea
                value={dailyGoal}
                onChange={(e) => handleDailyGoalChange(e.target.value)}
                placeholder="What are your main goals for today?"
                className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                rows={2}
              />
            </div>
            
            {/* Labels Section */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Day Labels:</label>
              <LabelSelector
                date={date}
                selectedLabels={note?.labels || []}
                onLabelsChange={() => loadDailyNote(true)}
              />
            </div>
          </div>
      </div>

      {/* Entries */}
      <div className="space-y-6">
        {loading ? (
          <div 
            className="rounded-lg shadow-lg p-8 text-center"
            style={{ 
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text-secondary)'
            }}
          >
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div 
            className="rounded-lg shadow-lg p-8 text-center"
            style={{ backgroundColor: 'var(--color-card-bg)' }}
          >
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>No entries for this day yet.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleAddEntry('rich_text')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                }}
              >
                <Plus className="h-5 w-5" />
                Add Text Entry
              </button>
              <button
                onClick={() => handleAddEntry('code')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-text-secondary)',
                  color: 'var(--color-bg-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
                }}
              >
                <Code className="h-5 w-5" />
                Add Code Entry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-center">
              {!selectionMode ? (
                <>
                  <button
                    onClick={() => handleAddEntry('rich_text')}
                    className="flex-1 p-4 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      borderColor: 'var(--color-border-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.backgroundColor = `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}10`;
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    <Plus className="h-5 w-5" />
                    Add Text Entry
                  </button>
                  <button
                    onClick={() => handleAddEntry('code')}
                    className="flex-1 p-4 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      borderColor: 'var(--color-border-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-text-primary)';
                      e.currentTarget.style.backgroundColor = `${getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary')}10`;
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    <Code className="h-5 w-5" />
                    Add Code Entry
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className="p-4 border-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      borderColor: 'var(--color-border-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.backgroundColor = `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}10`;
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                    title="Select entries to merge"
                  >
                    <CheckSquare className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleSelectionMode}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--color-text-secondary)',
                      color: 'var(--color-bg-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMergeEntries}
                    disabled={selectedEntries.size < 2 || isMerging}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: selectedEntries.size >= 2 && !isMerging ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                      color: selectedEntries.size >= 2 && !isMerging ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)',
                      cursor: selectedEntries.size >= 2 && !isMerging ? 'pointer' : 'not-allowed'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedEntries.size >= 2 && !isMerging) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEntries.size >= 2 && !isMerging) {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                      }
                    }}
                  >
                    <Combine className="h-5 w-5" />
                    {isMerging ? 'Merging...' : `Merge ${selectedEntries.size} Entries`}
                  </button>
                </>
              )}
            </div>
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                data-entry-id={entry.id}
                className="entry-card-container"
                style={{
                  animation: index === 0 ? 'slideDown 0.3s ease-out' : 'none'
                }}
              >
                <NoteEntryCard
                  entry={entry}
                  onUpdate={handleEntryUpdate}
                  onDelete={handleEntryDelete}
                  onLabelsUpdate={handleEntryLabelsUpdate}
                  onMoveToTop={handleMoveToTop}
                  selectionMode={selectionMode}
                  isSelected={selectedEntries.has(entry.id)}
                  onSelectionChange={handleSelectionChange}
                  currentDate={date}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default DailyView;

