import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckSquare, Combine } from 'lucide-react';
import axios from 'axios';
import { notesApi, entriesApi, goalsApi } from '../api';
import type { DailyNote, NoteEntry, Goal } from '../types';
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
  const [sprintGoal, setSprintGoal] = useState<Goal | null>(null);
  const [quarterlyGoal, setQuarterlyGoal] = useState<Goal | null>(null);
  const [editingDailyGoal, setEditingDailyGoal] = useState(false);
  const [editingSprintGoal, setEditingSprintGoal] = useState(false);
  const [editingQuarterlyGoal, setEditingQuarterlyGoal] = useState(false);
  const [creatingSprintGoal, setCreatingSprintGoal] = useState(false);
  const [creatingQuarterlyGoal, setCreatingQuarterlyGoal] = useState(false);
  const [newSprintText, setNewSprintText] = useState('');
  const [newSprintStartDate, setNewSprintStartDate] = useState('');
  const [newSprintEndDate, setNewSprintEndDate] = useState('');
  const [newQuarterlyText, setNewQuarterlyText] = useState('');
  const [newQuarterlyStartDate, setNewQuarterlyStartDate] = useState('');
  const [newQuarterlyEndDate, setNewQuarterlyEndDate] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);

  // Load goals for the specific date being viewed
  useEffect(() => {
    if (date) {
      // Close any open date pickers when navigating to a different day
      setCreatingSprintGoal(false);
      setCreatingQuarterlyGoal(false);
      setEditingSprintGoal(false);
      setEditingQuarterlyGoal(false);
      
      // Scroll to top immediately when date changes
      window.scrollTo({ top: 0, behavior: 'instant' });
      loadDailyNote();
      loadGoalsForDate(date);
    }
  }, [date]);

  const loadGoalsForDate = async (viewedDate: string) => {
    try {
      // Try to load sprint goal for this date
      try {
        const sprintGoalData = await goalsApi.getSprintForDate(viewedDate);
        setSprintGoal(sprintGoalData);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setSprintGoal(null); // No goal for this date
        } else {
          console.error('Failed to load sprint goal:', error);
        }
      }

      // Try to load quarterly goal for this date
      try {
        const quarterlyGoalData = await goalsApi.getQuarterlyForDate(viewedDate);
        setQuarterlyGoal(quarterlyGoalData);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setQuarterlyGoal(null); // No goal for this date
        } else {
          console.error('Failed to load quarterly goal:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
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

  const handleSprintGoalUpdate = async (newText: string) => {
    if (!sprintGoal || !date) return;
    
    try {
      const updated = await goalsApi.updateSprint(sprintGoal.id, { text: newText });
      setSprintGoal(updated);
    } catch (error) {
      console.error('Failed to update sprint goal:', error);
      alert('Failed to update sprint goal.');
    }
  };

  const handleQuarterlyGoalUpdate = async (newText: string) => {
    if (!quarterlyGoal || !date) return;
    
    try {
      const updated = await goalsApi.updateQuarterly(quarterlyGoal.id, { text: newText });
      setQuarterlyGoal(updated);
    } catch (error) {
      console.error('Failed to update quarterly goal:', error);
      alert('Failed to update quarterly goal.');
    }
  };

  const getDaysUntilStart = (startDate: string, fromDate: string): number => {
    try {
      const start = new Date(startDate);
      const from = new Date(fromDate);
      const diffTime = start.getTime() - from.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const isGoalNotStarted = (goal: Goal | null, viewedDate: string): boolean => {
    if (!goal || !viewedDate) return false;
    return goal.start_date > viewedDate;
  };

  const handleCreateSprintGoal = async () => {
    if (!date || !newSprintText || !newSprintStartDate || !newSprintEndDate) {
      alert('Please provide goal text, start date, and end date');
      return;
    }

    try {
      const newGoal = await goalsApi.createSprint({
        text: newSprintText,
        start_date: newSprintStartDate,
        end_date: newSprintEndDate
      });
      setSprintGoal(newGoal);
      setCreatingSprintGoal(false);
      setNewSprintText('');
      setNewSprintStartDate('');
      setNewSprintEndDate('');
    } catch (error: any) {
      console.error('Failed to create sprint goal:', error);
      if (error.response?.status === 400) {
        alert(error.response?.data?.detail || 'Failed to create goal. Check for overlapping dates.');
      } else {
        alert('Failed to create sprint goal');
      }
    }
  };

  const handleCreateQuarterlyGoal = async () => {
    if (!date || !newQuarterlyText || !newQuarterlyStartDate || !newQuarterlyEndDate) {
      alert('Please provide goal text, start date, and end date');
      return;
    }

    try {
      const newGoal = await goalsApi.createQuarterly({
        text: newQuarterlyText,
        start_date: newQuarterlyStartDate,
        end_date: newQuarterlyEndDate
      });
      setQuarterlyGoal(newGoal);
      setCreatingQuarterlyGoal(false);
      setNewQuarterlyText('');
      setNewQuarterlyStartDate('');
      setNewQuarterlyEndDate('');
    } catch (error: any) {
      console.error('Failed to create quarterly goal:', error);
      if (error.response?.status === 400) {
        alert(error.response?.data?.detail || 'Failed to create goal. Check for overlapping dates.');
      } else {
        alert('Failed to create quarterly goal');
      }
    }
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
      <div className={`mx-auto px-2 sm:px-4 xl:px-8 ${isFullScreen ? 'max-w-7xl' : 'max-w-4xl'}`} style={{ position: 'relative', zIndex: 20 }}>
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
                  <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>🏷️ Day Labels:</label>
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
                  <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>🎯 Daily Goals</label>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>🚀 Sprint Goals</label>
                    {sprintGoal && date && (
                      <div 
                        className="flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: isGoalNotStarted(sprintGoal, date) 
                            ? 'rgba(59, 130, 246, 0.15)' 
                            : sprintGoal.days_remaining && sprintGoal.days_remaining > 0 
                              ? 'rgba(16, 185, 129, 0.15)' 
                              : 'rgba(239, 68, 68, 0.15)',
                          color: isGoalNotStarted(sprintGoal, date)
                            ? 'var(--color-accent)'
                            : sprintGoal.days_remaining && sprintGoal.days_remaining > 0 
                              ? 'var(--color-success)' 
                              : 'var(--color-error)'
                        }}
                        title={`${sprintGoal.start_date} to ${sprintGoal.end_date}`}
                      >
                        <span className="text-sm font-bold">
                          {isGoalNotStarted(sprintGoal, date) ? (
                            `${getDaysUntilStart(sprintGoal.start_date, date)} days until start`
                          ) : sprintGoal.days_remaining !== undefined ? (
                            sprintGoal.days_remaining > 0 ? `${sprintGoal.days_remaining} days left` : 
                            sprintGoal.days_remaining === 0 ? 'Today!' : 
                            `${Math.abs(sprintGoal.days_remaining)} days overdue`
                          ) : null}
                        </span>
                      </div>
                    )}
                  </div>

                  {sprintGoal ? (
                    // Existing goal - always editable
                    <>
                      {editingSprintGoal ? (
                        <textarea
                          value={sprintGoal.text}
                          onChange={(e) => {
                            setSprintGoal({ ...sprintGoal, text: e.target.value });
                          }}
                          onBlur={(e) => {
                            setEditingSprintGoal(false);
                            handleSprintGoalUpdate(e.target.value);
                          }}
                          placeholder="What are your sprint goals?"
                          className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-accent)',
                            boxShadow: `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20`,
                            minHeight: '80px'
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => setEditingSprintGoal(true)}
                          className="w-full px-4 py-3 rounded-lg transition-colors min-h-[80px] whitespace-pre-wrap cursor-pointer"
                          style={{
                            color: sprintGoal.text ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {sprintGoal.text || 'Click to edit sprint goals...'}
                        </div>
                      )}
                    </>
                  ) : (
                    // No goal exists - show creation interface
                    <>
                      {creatingSprintGoal ? (
                        <div className="space-y-3">
                          <textarea
                            value={newSprintText}
                            onChange={(e) => setNewSprintText(e.target.value)}
                            placeholder="What are your sprint goals?"
                            className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              color: 'var(--color-text-primary)',
                              borderColor: 'var(--color-accent)',
                              minHeight: '80px'
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2 items-center">
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Start:</span>
                            <input
                              type="date"
                              value={newSprintStartDate}
                              onChange={(e) => setNewSprintStartDate(e.target.value)}
                              className="px-2 py-1 border rounded text-xs"
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-border-primary)'
                              }}
                            />
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>→ End:</span>
                            <input
                              type="date"
                              value={newSprintEndDate}
                              onChange={(e) => setNewSprintEndDate(e.target.value)}
                              min={newSprintStartDate || date}
                              className="px-2 py-1 border rounded text-xs"
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-border-primary)'
                              }}
                            />
                            <button
                              onClick={handleCreateSprintGoal}
                              className="px-3 py-1 text-xs rounded hover:opacity-80"
                              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setCreatingSprintGoal(false);
                                setNewSprintText('');
                                setNewSprintStartDate('');
                                setNewSprintEndDate('');
                              }}
                              className="px-3 py-1 text-xs rounded hover:opacity-80"
                              style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCreatingSprintGoal(true);
                            // Set default start date to current viewed date
                            setNewSprintStartDate(date || '');
                          }}
                          className="text-xs px-3 py-2 rounded hover:opacity-80"
                          style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}
                        >
                          + Create Sprint Goal
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Quarterly Goals Section - only show if enabled */}
              {showQuarterlyGoals && (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>🌟 Quarterly Goals</label>
                    {quarterlyGoal && date && (
                      <div 
                        className="flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: isGoalNotStarted(quarterlyGoal, date) 
                            ? 'rgba(59, 130, 246, 0.15)' 
                            : quarterlyGoal.days_remaining && quarterlyGoal.days_remaining > 0 
                              ? 'rgba(16, 185, 129, 0.15)' 
                              : 'rgba(239, 68, 68, 0.15)',
                          color: isGoalNotStarted(quarterlyGoal, date)
                            ? 'var(--color-accent)'
                            : quarterlyGoal.days_remaining && quarterlyGoal.days_remaining > 0 
                              ? 'var(--color-success)' 
                              : 'var(--color-error)'
                        }}
                        title={`${quarterlyGoal.start_date} to ${quarterlyGoal.end_date}`}
                      >
                        <span className="text-sm font-bold">
                          {isGoalNotStarted(quarterlyGoal, date) ? (
                            `${getDaysUntilStart(quarterlyGoal.start_date, date)} days until start`
                          ) : quarterlyGoal.days_remaining !== undefined ? (
                            quarterlyGoal.days_remaining > 0 ? `${quarterlyGoal.days_remaining} days left` : 
                            quarterlyGoal.days_remaining === 0 ? 'Today!' : 
                            `${Math.abs(quarterlyGoal.days_remaining)} days overdue`
                          ) : null}
                        </span>
                      </div>
                    )}
                  </div>

                  {quarterlyGoal ? (
                    // Existing goal - always editable
                    <>
                      {editingQuarterlyGoal ? (
                        <textarea
                          value={quarterlyGoal.text}
                          onChange={(e) => {
                            setQuarterlyGoal({ ...quarterlyGoal, text: e.target.value });
                          }}
                          onBlur={(e) => {
                            setEditingQuarterlyGoal(false);
                            handleQuarterlyGoalUpdate(e.target.value);
                          }}
                          placeholder="What are your quarterly goals?"
                          className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-accent)',
                            boxShadow: `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20`,
                            minHeight: '80px'
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => setEditingQuarterlyGoal(true)}
                          className="w-full px-4 py-3 rounded-lg transition-colors min-h-[80px] whitespace-pre-wrap cursor-pointer"
                          style={{
                            color: quarterlyGoal.text ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {quarterlyGoal.text || 'Click to edit quarterly goals...'}
                        </div>
                      )}
                    </>
                  ) : (
                    // No goal exists - show creation interface
                    <>
                      {creatingQuarterlyGoal ? (
                        <div className="space-y-3">
                          <textarea
                            value={newQuarterlyText}
                            onChange={(e) => setNewQuarterlyText(e.target.value)}
                            placeholder="What are your quarterly goals?"
                            className="w-full px-4 py-3 border rounded-lg resize-vertical focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              color: 'var(--color-text-primary)',
                              borderColor: 'var(--color-accent)',
                              minHeight: '80px'
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2 items-center">
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Start:</span>
                            <input
                              type="date"
                              value={newQuarterlyStartDate}
                              onChange={(e) => setNewQuarterlyStartDate(e.target.value)}
                              className="px-2 py-1 border rounded text-xs"
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-border-primary)'
                              }}
                            />
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>→ End:</span>
                            <input
                              type="date"
                              value={newQuarterlyEndDate}
                              onChange={(e) => setNewQuarterlyEndDate(e.target.value)}
                              min={newQuarterlyStartDate || date}
                              className="px-2 py-1 border rounded text-xs"
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-border-primary)'
                              }}
                            />
                            <button
                              onClick={handleCreateQuarterlyGoal}
                              className="px-3 py-1 text-xs rounded hover:opacity-80"
                              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setCreatingQuarterlyGoal(false);
                                setNewQuarterlyText('');
                                setNewQuarterlyStartDate('');
                                setNewQuarterlyEndDate('');
                              }}
                              className="px-3 py-1 text-xs rounded hover:opacity-80"
                              style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCreatingQuarterlyGoal(true);
                            // Set default start date to current viewed date
                            setNewQuarterlyStartDate(date || '');
                          }}
                          className="text-xs px-3 py-2 rounded hover:opacity-80"
                          style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}
                        >
                          + Create Quarterly Goal
                        </button>
                      )}
                    </>
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

