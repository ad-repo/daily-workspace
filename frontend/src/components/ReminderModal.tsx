import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell } from 'lucide-react';
import { format } from 'date-fns';
import type { NoteEntry, Reminder } from '../types';
import { remindersApi } from '../api';

interface ReminderModalProps {
  entry: NoteEntry;
  existingReminder: Reminder | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ReminderModal = ({ entry, existingReminder, onClose, onSuccess }: ReminderModalProps) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with existing reminder or default to current date and time
    if (existingReminder) {
      const reminderDate = new Date(existingReminder.reminder_datetime);
      setDate(format(reminderDate, 'yyyy-MM-dd'));
      setTime(format(reminderDate, 'HH:mm'));
    } else {
      const now = new Date();
      setDate(format(now, 'yyyy-MM-dd'));
      setTime(format(now, 'HH:mm'));
    }
  }, [existingReminder]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!date || !time) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Combine date and time into ISO datetime string
      const reminderDatetime = new Date(`${date}T${time}`).toISOString();

      if (existingReminder) {
        // Update existing reminder
        await remindersApi.update(existingReminder.id, {
          reminder_datetime: reminderDatetime,
        });
      } else {
        // Create new reminder
        await remindersApi.create({
          entry_id: entry.id,
          reminder_datetime: reminderDatetime,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving reminder:', err);
      setError('Failed to save reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReminder) return;

    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await remindersApi.delete(existingReminder.id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError('Failed to delete reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-md"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex justify-between items-center"
          style={{
            borderColor: 'var(--color-border)',
            borderBottom: '3px solid var(--color-accent)',
          }}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {existingReminder ? 'Edit Reminder' : 'Set Reminder'}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {entry.title || 'Untitled Entry'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-background)',
            }}
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'rgb(239, 68, 68)',
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Date Input */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Time Input */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex justify-between items-center"
          style={{
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            {existingReminder && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'rgb(239, 68, 68)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
              }}
            >
              {loading ? 'Saving...' : existingReminder ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReminderModal;

