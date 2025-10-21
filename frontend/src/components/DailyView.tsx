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

  const loadDailyNote = async () => {
    if (!date) return;

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
      // Scroll to top after content is loaded
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
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
      
      // Add new entry at the beginning (it will have the newest timestamp)
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

  const handleEntryDelete = async (entryId: number) => {
    try {
      await entriesApi.delete(entryId);
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry:', error);
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
    <div className="relative">
      <EntryTimeline entries={entries} />
      <div className="max-w-4xl mx-auto px-4 xl:px-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h1>
            {isToday && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Today
              </span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>
        </div>

          <div className="flex flex-col items-center gap-6 w-full">
            {/* Daily Goals Section */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Goals:</label>
              <textarea
                value={dailyGoal}
                onChange={(e) => handleDailyGoalChange(e.target.value)}
                placeholder="What are your main goals for today?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            
            {/* Labels Section */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Day Labels:</label>
              <LabelSelector
                date={date}
                selectedLabels={note?.labels || []}
                onLabelsChange={loadDailyNote}
              />
            </div>
          </div>
      </div>

      {/* Entries */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No entries for this day yet.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleAddEntry('rich_text')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Text Entry
              </button>
              <button
                onClick={() => handleAddEntry('code')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
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
                    className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                    Add Text Entry
                  </button>
                  <button
                    onClick={() => handleAddEntry('code')}
                    className="flex-1 p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <Code className="h-5 w-5" />
                    Add Code Entry
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className="p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600"
                    title="Select entries to merge"
                  >
                    <CheckSquare className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleSelectionMode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMergeEntries}
                    disabled={selectedEntries.size < 2 || isMerging}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      selectedEntries.size >= 2 && !isMerging
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Combine className="h-5 w-5" />
                    {isMerging ? 'Merging...' : `Merge ${selectedEntries.size} Entries`}
                  </button>
                </>
              )}
            </div>
            {entries.map((entry) => (
              <div key={entry.id} data-entry-id={entry.id}>
                <NoteEntryCard
                  entry={entry}
                  onUpdate={handleEntryUpdate}
                  onDelete={handleEntryDelete}
                  onLabelsChange={loadDailyNote}
                  selectionMode={selectionMode}
                  isSelected={selectedEntries.has(entry.id)}
                  onSelectionChange={handleSelectionChange}
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

