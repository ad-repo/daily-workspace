import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Star, Check, Skull } from 'lucide-react';
import { notesApi } from '../api';
import type { DailyNote } from '../types';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarView = ({ selectedDate, onDateSelect }: CalendarViewProps) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadMonthNotes();
  }, [currentMonth]);

  // Add tooltips to calendar tiles after notes are loaded
  useEffect(() => {
    if (notes.length === 0) return;

    // Wait for calendar to render
    setTimeout(() => {
      const tiles = document.querySelectorAll('.react-calendar__tile');
      tiles.forEach((tile) => {
        const abbr = tile.querySelector('abbr');
        if (abbr && abbr.getAttribute('aria-label')) {
          const dateStr = format(new Date(abbr.getAttribute('aria-label')!), 'yyyy-MM-dd');
          const note = notes.find(n => n.date === dateStr);
          // Only show tooltip if there are entries or a goal
          if (note && (note.entries.length > 0 || (note.daily_goal && note.daily_goal.trim() !== ''))) {
            const goalText = note.daily_goal || 'No goals set';
            (tile as HTMLElement).title = goalText;
          }
        }
      });
    }, 100);
  }, [notes]);

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

  const getTileContent = ({ date }: { date: Date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const note = notes.find(n => n.date === dateStr);

    // Only show indicator if there are actual entries OR a daily goal
    if (note && (note.entries.length > 0 || (note.daily_goal && note.daily_goal.trim() !== ''))) {
      const hasDevNullEntries = note.entries.some(entry => entry.is_dev_null);
      const hasImportantEntries = note.entries.some(entry => entry.is_important);
      const hasCompletedEntries = note.entries.some(entry => entry.is_completed);
      
      return (
        <div className="flex flex-col items-center justify-center mt-1">
          {hasDevNullEntries ? (
            // Skull emoji overrides all other indicators
            <Skull className="h-3 w-3 text-gray-700 stroke-[2.5]" />
          ) : hasImportantEntries && hasCompletedEntries ? (
            // Green star for both important and completed - dramatic pulse
            <Star className="h-3 w-3 text-green-500 fill-green-500 dramatic-pulse" />
          ) : hasCompletedEntries ? (
            // Green checkmark for completed only - bouncing animation
            <Check className="h-3 w-3 text-green-500 stroke-[3] animate-bounce" />
          ) : hasImportantEntries ? (
            // Yellow star for important only - with rays
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 star-rays spin-rays" />
          ) : (
            // Blue dot for regular notes
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto page-fade-in" style={{ position: 'relative', zIndex: 1 }}>
      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Calendar View</h1>
        
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

        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-500 fill-green-500 dramatic-pulse" />
              <span>Has important and completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 stroke-[3] animate-bounce" />
              <span>Has completed entries</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 star-rays spin-rays" />
              <span>Has important entries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Has notes</span>
            </div>
            <div className="flex items-center gap-2">
              <Skull className="h-4 w-4 text-gray-700 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

