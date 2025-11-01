import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Holiday {
  name: string;
  date: string;
  localName?: string;
  countryCode?: string;
}

interface HolidayBackgroundState {
  name: string | null;
  date: string | null;
  imageUrl: string | null;
  lastRotation: number | null;
}

interface HolidayContextType {
  enabled: boolean;
  daysAhead: number;
  currentHoliday: Holiday | null;
  backgroundImage: string | null;
  toggleEnabled: () => void;
  setDaysAhead: (days: number) => void;
  refreshImage: () => void;
  isLoading: boolean;
}

const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENABLED: 'holiday_background_enabled',
  DAYS_AHEAD: 'holiday_background_days_ahead',
  CURRENT: 'holiday_background_current',
};

const DEFAULT_DAYS_AHEAD = 7;
const ROTATION_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED);
    return stored ? JSON.parse(stored) : false;
  });

  const [daysAhead, setDaysAheadState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DAYS_AHEAD);
    return stored ? parseInt(stored, 10) : DEFAULT_DAYS_AHEAD;
  });

  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);
  const [backgroundState, setBackgroundState] = useState<HolidayBackgroundState>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { name: null, date: null, imageUrl: null, lastRotation: null };
      }
    }
    return { name: null, date: null, imageUrl: null, lastRotation: null };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Generate image URL with holiday-specific seed
  const generateImageUrl = (holidayName: string): string => {
    // Create a seed based on holiday name and current hour
    const hoursSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60));
    const seed = `${holidayName.replace(/\s+/g, '-').toLowerCase()}-${hoursSinceEpoch}`;
    
    // Use Picsum Photos with seed for consistent but rotating images
    // Seed ensures same holiday gets similar-feeling images, hour rotation adds variety
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1920/1080`;
  };

  // Fetch current holiday from backend
  const fetchCurrentHoliday = async (): Promise<Holiday | null> => {
    try {
      const response = await axios.get(`${API_URL}/api/holidays/current`, {
        params: { days: daysAhead, country: 'US' }
      });
      
      if (response.data && response.data.name) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch holiday:', error);
      return null;
    }
  };

  // Check if image needs rotation (1 hour passed)
  const needsRotation = (): boolean => {
    if (!backgroundState.lastRotation) return true;
    const timeSinceRotation = Date.now() - backgroundState.lastRotation;
    return timeSinceRotation >= ROTATION_INTERVAL;
  };

  // Update background image
  const updateBackgroundImage = (holiday: Holiday) => {
    const imageUrl = generateImageUrl(holiday.name);
    const newState: HolidayBackgroundState = {
      name: holiday.name,
      date: holiday.date,
      imageUrl,
      lastRotation: Date.now(),
    };
    
    setBackgroundState(newState);
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(newState));
  };

  // Main check function
  const checkAndUpdateHoliday = async () => {
    if (!enabled) return;

    setIsLoading(true);
    try {
      const holiday = await fetchCurrentHoliday();
      setCurrentHoliday(holiday);

      if (holiday) {
        // Check if it's a new holiday or needs rotation
        const isNewHoliday = holiday.name !== backgroundState.name;
        
        if (isNewHoliday || needsRotation()) {
          updateBackgroundImage(holiday);
        }
      } else {
        // No upcoming holiday - clear background
        setBackgroundState({ name: null, date: null, imageUrl: null, lastRotation: null });
        localStorage.removeItem(STORAGE_KEYS.CURRENT);
      }
    } catch (error) {
      console.error('Error checking holiday:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle enabled state
  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(newEnabled));
    
    if (newEnabled) {
      checkAndUpdateHoliday();
    }
  };

  // Update days ahead
  const setDaysAhead = (days: number) => {
    setDaysAheadState(days);
    localStorage.setItem(STORAGE_KEYS.DAYS_AHEAD, days.toString());
    
    if (enabled) {
      checkAndUpdateHoliday();
    }
  };

  // Force refresh image
  const refreshImage = () => {
    if (currentHoliday) {
      updateBackgroundImage(currentHoliday);
    }
  };

  // Initial check on mount
  useEffect(() => {
    if (enabled) {
      checkAndUpdateHoliday();
    }
  }, [enabled]);

  // Set up periodic check interval
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      checkAndUpdateHoliday();
    }, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [enabled, daysAhead, backgroundState.lastRotation]);

  return (
    <HolidayContext.Provider
      value={{
        enabled,
        daysAhead,
        currentHoliday,
        backgroundImage: backgroundState.imageUrl,
        toggleEnabled,
        setDaysAhead,
        refreshImage,
        isLoading,
      }}
    >
      {children}
    </HolidayContext.Provider>
  );
};

export const useHoliday = (): HolidayContextType => {
  const context = useContext(HolidayContext);
  if (!context) {
    throw new Error('useHoliday must be used within HolidayProvider');
  }
  return context;
};

