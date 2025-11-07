import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Star, Check, Skull } from 'lucide-react';
import { notesApi, goalsApi } from '../api';
import type { DailyNote, Goal } from '../types';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarView = ({ selectedDate, onDateSelect }: CalendarViewProps) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [sprintGoals, setSprintGoals] = useState<Goal[]>([]);
  const [quarterlyGoals, setQuarterlyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadMonthNotes();
    loadAllGoals();
  }, [currentMonth]);

  // Add tooltips to calendar tiles after notes and goals are loaded
  useEffect(() => {
    if (notes.length === 0 && sprintGoals.length === 0 && quarterlyGoals.length === 0) return;

    // Wait for calendar to render
    setTimeout(() => {
      const tiles = document.querySelectorAll('.react-calendar__tile');
      tiles.forEach((tile) => {
        const abbr = tile.querySelector('abbr');
        if (abbr && abbr.getAttribute('aria-label')) {
          const dateStr = format(new Date(abbr.getAttribute('aria-label')!), 'yyyy-MM-dd');
          const note = notes.find(n => n.date === dateStr);
          const sprintGoal = getGoalForDate(dateStr, sprintGoals);
          const quarterlyGoal = getGoalForDate(dateStr, quarterlyGoals);
          
          const tooltipParts: string[] = [];
          
          // Add daily goal if exists
          if (note?.daily_goal && note.daily_goal.trim() !== '') {
            tooltipParts.push(`Daily: ${note.daily_goal}`);
          }
          
          // Add sprint goal if exists
          if (sprintGoal) {
            tooltipParts.push(`🚀 Sprint: ${sprintGoal.text.substring(0, 50)}${sprintGoal.text.length > 50 ? '...' : ''}`);
          }
          
          // Add quarterly goal if exists
          if (quarterlyGoal) {
            tooltipParts.push(`🌟 Quarterly: ${quarterlyGoal.text.substring(0, 50)}${quarterlyGoal.text.length > 50 ? '...' : ''}`);
          }
          
          // Add entry count if exists
          if (note && note.entries.length > 0) {
            tooltipParts.push(`${note.entries.length} ${note.entries.length === 1 ? 'entry' : 'entries'}`);
          }
          
          if (tooltipParts.length > 0) {
            (tile as HTMLElement).title = tooltipParts.join(' | ');
          }
        }
      });
    }, 100);
  }, [notes, sprintGoals, quarterlyGoals]);

  const loadMonthNotes = async () => {
    setLoading(true);
    try {
      const curYear = currentMonth.getFullYear();
      const curMonth = currentMonth.getMonth() + 1;

      // Also load adjacent months so trailing/leading days in the grid show markers
      const prevDate = new Date(curYear, currentMonth.getMonth() - 1, 1);
      const nextDate = new Date(curYear, currentMonth.getMonth() + 1, 1);

      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth() + 1;
      const nextYear = nextDate.getFullYear();
      const nextMonth = nextDate.getMonth() + 1;

      const [prevData, curData, nextData] = await Promise.all([
        notesApi.getByMonth(prevYear, prevMonth),
        notesApi.getByMonth(curYear, curMonth),
        notesApi.getByMonth(nextYear, nextMonth),
      ]);

      // Merge by unique date
      const byDate = new Map<string, DailyNote>();
      for (const n of [...prevData, ...curData, ...nextData]) {
        byDate.set(n.date, n);
      }
      setNotes(Array.from(byDate.values()));
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllGoals = async () => {
    try {
      const [sprints, quarterlies] = await Promise.all([
        goalsApi.getAllSprints(),
        goalsApi.getAllQuarterly(),
      ]);
      setSprintGoals(sprints);
      setQuarterlyGoals(quarterlies);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/day/${dateStr}`);
  };

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setCurrentMonth(activeStartDate);
    }
  };

  const getGoalForDate = (dateStr: string, goals: Goal[]): Goal | null => {
    // First check if date is within any goal's range
    for (const goal of goals) {
      if (dateStr >= goal.start_date && dateStr <= goal.end_date) {
        return goal;
      }
    }
    return null;
  };

  const getTileContent = ({ date }: { date: Date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const note = notes.find(n => n.date === dateStr);
    const sprintGoal = getGoalForDate(dateStr, sprintGoals);
    const quarterlyGoal = getGoalForDate(dateStr, quarterlyGoals);

    // Check if there are entries or goals to display
    const hasEntries = note && (note.entries.length > 0 || (note.daily_goal && note.daily_goal.trim() !== ''));
    const hasGoals = sprintGoal || quarterlyGoal;

    if (!hasEntries && !hasGoals) {
      return null;
    }

    const hasDevNullEntries = note?.entries.some(entry => entry.is_dev_null);
    const hasImportantEntries = note?.entries.some(entry => entry.is_important);
    const hasCompletedEntries = note?.entries.some(entry => entry.is_completed);
    
    return (
      <div className="flex flex-col items-center justify-center mt-1 gap-0.5">
        {/* Entry indicators - show all that apply */}
        {hasEntries && (
          <div className="flex items-center gap-0.5">
            {hasDevNullEntries && (
              <Skull className="h-4 w-4 text-gray-700 stroke-[2.5]" />
            )}
            {hasImportantEntries && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 star-rays spin-rays" />
            )}
            {hasCompletedEntries && (
              <Check className="h-4 w-4 text-green-500 stroke-[3] animate-bounce" />
            )}
            {!hasDevNullEntries && !hasImportantEntries && !hasCompletedEntries && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </div>
        )}
        
        {/* Goal indicators */}
        {hasGoals && (
          <div className="flex items-center gap-0.5 text-xs">
            {sprintGoal && (
              <span title="Sprint Goal">🚀</span>
            )}
            {quarterlyGoal && (
              <span title="Quarterly Goal">🌟</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto page-fade-in px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="rounded-xl shadow-xl p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>🗓️ Calendar View</h1>
        
        {loading && (
          <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>Loading notes...</div>
        )}

        <Calendar
          value={selectedDate}
          onClickDay={handleDateClick}
          onActiveStartDateChange={handleActiveStartDateChange}
          tileContent={getTileContent}
          className="w-full"
        />

        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-primary)' }}>
          <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>📋 Legend</h3>
          
          {/* Entry indicators */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Entry Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <Skull className="h-4 w-4 text-gray-700 stroke-[2.5] flex-shrink-0" />
                <span className="text-xs font-medium">Has /dev/null</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 star-rays spin-rays flex-shrink-0" />
                <span className="text-xs font-medium">Has important</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <Check className="h-4 w-4 text-green-500 stroke-[3] animate-bounce flex-shrink-0" />
                <span className="text-xs font-medium">Has completed</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-xs font-medium">Has notes</span>
              </div>
            </div>
          </div>
          
          {/* Goal indicators */}
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Goals</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <span className="text-base flex-shrink-0">🚀</span>
                <span className="text-xs font-medium">Sprint Goal</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <span className="text-base flex-shrink-0">🌟</span>
                <span className="text-xs font-medium">Quarterly Goal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

