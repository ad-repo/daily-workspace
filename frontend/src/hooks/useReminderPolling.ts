import { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import { remindersApi } from '../api';

/**
 * Custom hook to poll for due reminders every 60 seconds
 * Returns array of reminders that are currently due
 */
export function useReminderPolling(): Reminder[] {
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    // Fetch due reminders immediately on mount
    const fetchDueReminders = async () => {
      try {
        const reminders = await remindersApi.getDue();
        setDueReminders(reminders);
      } catch (error) {
        console.error('Error fetching due reminders:', error);
      }
    };

    // Initial fetch
    fetchDueReminders();

    // Set up polling interval (60 seconds)
    const intervalId = setInterval(fetchDueReminders, 60000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return dueReminders;
}

