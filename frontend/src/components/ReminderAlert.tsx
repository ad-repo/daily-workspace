import { createPortal } from 'react-dom';
import { Bell, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Reminder } from '../types';

interface ReminderAlertProps {
  reminder: Reminder;
  onSnooze: () => void;
  onDismiss: () => void;
  onClose: () => void;
}

const ReminderAlert = ({ reminder, onSnooze, onDismiss, onClose }: ReminderAlertProps) => {
  const navigate = useNavigate();

  const handleViewEntry = () => {
    if (reminder.entry?.daily_note_date) {
      navigate(`/day/${reminder.entry.daily_note_date}`);
      onClose();
    }
  };

  // Strip HTML tags for preview
  const getTextPreview = (html: string, maxLength = 100): string => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 20000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg animate-pulse-once"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '2px solid var(--color-accent)',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{
            borderColor: 'var(--color-border)',
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark, var(--color-accent)) 100%)',
          }}
        >
          <Bell className="w-8 h-8 text-white animate-bounce" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              Reminder
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-white opacity-80" />
              <p className="text-sm text-white opacity-90">
                {format(new Date(reminder.reminder_datetime), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:bg-white hover:bg-opacity-20"
            style={{
              color: 'white',
            }}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {reminder.entry && (
            <>
              {/* Entry Title */}
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {reminder.entry.title || 'Untitled Entry'}
              </h3>

              {/* Entry Preview */}
              <p
                className="text-sm mb-4 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {getTextPreview(reminder.entry.content)}
              </p>

              {/* View Entry Button */}
              {reminder.entry.daily_note_date && (
                <button
                  onClick={handleViewEntry}
                  className="text-sm font-medium mb-4 hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View Entry →
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="px-6 py-4 border-t flex justify-end gap-3"
          style={{
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            onClick={onDismiss}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Dismiss
          </button>
          <button
            onClick={onSnooze}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
            }}
          >
            Snooze 1 Day
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReminderAlert;

