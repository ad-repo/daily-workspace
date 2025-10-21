import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
          if (note && note.entries.length > 0) {
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
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await notesApi.getByMonth(year, month);
      setNotes(data);
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

    if (note && note.entries.length > 0) {
      return (
        <div className="flex flex-col items-center justify-center mt-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendar View</h1>
        
        {loading && (
          <div className="text-center py-4 text-gray-500">Loading notes...</div>
        )}

        <Calendar
          value={selectedDate}
          onClickDay={handleDateClick}
          onActiveStartDateChange={handleActiveStartDateChange}
          tileContent={getTileContent}
          className="w-full"
        />

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Has notes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

