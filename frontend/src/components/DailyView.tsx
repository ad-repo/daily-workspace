import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckSquare, Combine } from 'lucide-react';
import axios from 'axios';
import { notesApi, entriesApi } from '../api';
import type { DailyNote, NoteEntry } from '../types';
import NoteEntryCard from './NoteEntryCard';
import LabelSelector from './LabelSelector';
import EntryDropdown from './EntryDropdown';
import { useFullScreen } from '../contexts/FullScreenContext';
import { useDailyGoals } from '../contexts/DailyGoalsContext';
import { useSprintGoals } from '../contexts/SprintGoalsContext';
import { useQuarterlyGoals } from '../contexts/QuarterlyGoalsContext';
import { useDayLabels } from '../contexts/DayLabelsContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DailyView = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { isFullScreen } = useFullScreen();
  const { showDailyGoals } = useDailyGoals();
  const { showSprintGoals } = useSprintGoals();
  const { showQuarterlyGoals } = useQuarterlyGoals();
  const { showDayLabels } = useDayLabels();
  const [note, setNote] = useState<DailyNote | null>(null);
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('');
  const [sprintGoals, setSprintGoals] = useState('');
  const [quarterlyGoals, setQuarterlyGoals] = useState('');
  const [editingDailyGoal, setEditingDailyGoal] = useState(false);
  const [editingSprintGoals, setEditingSprintGoals] = useState(false);
  const [editingQuarterlyGoals, setEditingQuarterlyGoals] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);

  // Load persistent goals on component mount and whenever date changes
  useEffect(() => {
    loadPersistentGoals();
  }, []); // Load once on mount

  useEffect(() => {
    if (date) {
      // Scroll to top immediately when date changes
      window.scrollTo({ top: 0, behavior: 'instant' });
      loadDailyNote();
      // Also reload persistent goals to ensure they're always fresh
      loadPersistentGoals();
    }
  }, [date]);

  const loadPersistentGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSprintGoals(response.data.sprint_goals || '');
      setQuarterlyGoals(response.data.quarterly_goals || '');
    } catch (error) {
      console.error('Failed to load persistent goals:', error);
    }
  };

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

  const handleSprintGoalsChange = async (newGoals: string) => {
    setSprintGoals(newGoals);
    
    // Debounce the save
    const timeoutId = setTimeout(async () => {
      try {
        await axios.patch(`${API_URL}/api/settings`, { sprint_goals: newGoals });
      } catch (error) {
        console.error('Failed to update sprint goals:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleQuarterlyGoalsChange = async (newGoals: string) => {
    setQuarterlyGoals(newGoals);
    
    // Debounce the save
    const timeoutId = setTimeout(async () => {
      try {
        await axios.patch(`${API_URL}/api/settings`, { quarterly_goals: newGoals });
      } catch (error) {
        console.error('Failed to update quarterly goals:', error);
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
      <div className={`mx-auto px-2 sm:px-4 xl:px-8 ${isFullScreen ? 'max-w-full' : 'max-w-4xl'}`} style={{ position: 'relative', zIndex: 20 }}>
      {/* Header */}
      <div 
        className="rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8"
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

          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
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

          <div className="flex items-center gap-2">
            <EntryDropdown entries={entries} />
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
        </div>

          {(showDailyGoals || showSprintGoals || showQuarterlyGoals || showDayLabels) && (
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Day Labels Section - only show if enabled */}
              {showDayLabels && (
                <div className="w-full">
                  <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Day Labels:</label>
                  <LabelSelector
                    date={date}
                    selectedLabels={note?.labels || []}
                    onLabelsChange={() => loadDailyNote(true)}
                  />
                </div>
              )}
              
              {/* Daily Goals Section - only show if enabled */}
              {showDailyGoals && (
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Daily Goals</label>
                  {editingDailyGoal ? (
                    <textarea
                      value={dailyGoal}
                      onChange={(e) => handleDailyGoalChange(e.target.value)}
                      placeholder="What are your main goals for today?"
                      className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-accent)',
                        boxShadow: `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20`,
                        minHeight: '80px'
                      }}
                      onBlur={() => setEditingDailyGoal(false)}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setEditingDailyGoal(true)}
                      className="w-full px-4 py-3 rounded-lg cursor-pointer transition-colors min-h-[80px] whitespace-pre-wrap"
                      style={{
                        color: dailyGoal ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {dailyGoal || 'Click to add daily goals...'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Sprint Goals Section - only show if enabled */}
              {showSprintGoals && (
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Sprint Goals</label>
                  {editingSprintGoals ? (
                    <textarea
                      value={sprintGoals}
                      onChange={(e) => handleSprintGoalsChange(e.target.value)}
                      placeholder="What are your sprint goals?"
                      className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-accent)',
                        boxShadow: `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20`,
                        minHeight: '80px'
                      }}
                      onBlur={() => setEditingSprintGoals(false)}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setEditingSprintGoals(true)}
                      className="w-full px-4 py-3 rounded-lg cursor-pointer transition-colors min-h-[80px] whitespace-pre-wrap"
                      style={{
                        color: sprintGoals ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {sprintGoals || 'Click to add sprint goals...'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Quarterly Goals Section - only show if enabled */}
              {showQuarterlyGoals && (
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Quarterly Goals</label>
                  {editingQuarterlyGoals ? (
                    <textarea
                      value={quarterlyGoals}
                      onChange={(e) => handleQuarterlyGoalsChange(e.target.value)}
                      placeholder="What are your quarterly goals?"
                      className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-accent)',
                        boxShadow: `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20`,
                        minHeight: '80px'
                      }}
                      onBlur={() => setEditingQuarterlyGoals(false)}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setEditingQuarterlyGoals(true)}
                      className="w-full px-4 py-3 rounded-lg cursor-pointer transition-colors min-h-[80px] whitespace-pre-wrap"
                      style={{
                        color: quarterlyGoals ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {quarterlyGoals || 'Click to add quarterly goals...'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Entries */}
      <div className="space-y-6">
        {loading ? (
          <div 
            className="rounded-2xl shadow-lg p-8 text-center"
            style={{ 
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-secondary)'
            }}
          >
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div 
            className="rounded-2xl shadow-lg p-8"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            <p className="mb-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>No entries for this day yet.</p>
            <button
              onClick={() => handleAddEntry('rich_text')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium shadow-sm"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <Plus className="h-5 w-5" />
              New Entry
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-center" style={{ minHeight: '52px' }}>
              {!selectionMode ? (
                <>
                  <button
                    onClick={() => handleAddEntry('rich_text')}
                    className="flex-1 px-6 py-3 rounded-lg transition-all font-medium shadow-sm flex items-center justify-center gap-2"
                    style={{
                      animation: 'fadeIn 0.2s ease-out',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-text)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <Plus className="h-5 w-5" />
                    New Entry
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className="px-4 py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                    style={{
                      animation: 'fadeIn 0.2s ease-out',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
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
                    className="px-6 py-3 rounded-lg transition-all font-medium shadow-sm"
                    style={{
                      animation: 'fadeIn 0.2s ease-out',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMergeEntries}
                    disabled={selectedEntries.size < 2 || isMerging}
                    className="flex-1 px-6 py-3 rounded-lg transition-all font-medium shadow-sm flex items-center justify-center gap-2"
                    style={{
                      animation: 'fadeIn 0.2s ease-out',
                      backgroundColor: selectedEntries.size >= 2 && !isMerging ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                      color: selectedEntries.size >= 2 && !isMerging ? '#ffffff' : 'var(--color-text-tertiary)',
                      cursor: selectedEntries.size >= 2 && !isMerging ? 'pointer' : 'not-allowed',
                      opacity: selectedEntries.size >= 2 && !isMerging ? '1' : '0.6'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedEntries.size >= 2 && !isMerging) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEntries.size >= 2 && !isMerging) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
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

