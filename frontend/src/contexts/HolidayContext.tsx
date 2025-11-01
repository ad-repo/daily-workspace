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
  autoRotate: boolean;
  toggleAutoRotate: () => void;
}

const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENABLED: 'holiday_background_enabled',
  DAYS_AHEAD: 'holiday_background_days_ahead',
  CURRENT: 'holiday_background_current',
  AUTO_ROTATE: 'holiday_background_auto_rotate',
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
  const [autoRotate, setAutoRotate] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_ROTATE);
    return stored ? JSON.parse(stored) : true; // Default to true (enabled)
  });

  // Generate holiday-themed search term from holiday name
  const getHolidaySearchTerm = (holidayName: string): string => {
    const name = holidayName.toLowerCase();
    
    // Map holidays to better search terms
    const searchTerms: { [key: string]: string } = {
      'christmas': 'christmas,holiday,winter,festive',
      'new year': 'newyear,celebration,fireworks,party',
      "new year's": 'newyear,celebration,fireworks,party',
      'thanksgiving': 'thanksgiving,autumn,harvest,family',
      'halloween': 'halloween,pumpkin,autumn,spooky',
      'easter': 'easter,spring,flowers,pastel',
      'valentine': 'valentine,love,romance,hearts',
      'independence day': 'fireworks,july4th,patriotic,celebration',
      'memorial day': 'patriotic,american,flag,memorial',
      'labor day': 'summer,bbq,celebration,relaxation',
      'veterans day': 'patriotic,american,flag,veteran',
      'martin luther king': 'unity,peace,equality,together',
      'presidents': 'american,patriotic,flag,heritage',
      'st patrick': 'green,irish,clover,lucky',
      'cinco de mayo': 'mexican,colorful,celebration,fiesta',
      'mother': 'flowers,family,love,mom',
      'father': 'family,dad,celebration,love',
      'juneteenth': 'celebration,freedom,african,heritage',
    };
    
    // Find matching search term
    for (const [key, term] of Object.entries(searchTerms)) {
      if (name.includes(key)) {
        return term;
      }
    }
    
    // Default: use holiday name cleaned up
    return holidayName.replace(/[^a-zA-Z0-9]/g, ',').toLowerCase();
  };

  // Generate image URL with holiday-specific search using Unsplash Source
  const generateImageUrl = (holidayName: string, forceRandom: boolean = false): string => {
    const searchTerm = getHolidaySearchTerm(holidayName);
    
    // Add timestamp for rotation (random or hourly)
    const timeSeed = forceRandom 
      ? Math.random() // Random for manual refresh
      : Math.floor(Date.now() / (1000 * 60 * 60)); // Hour-based for automatic rotation
    
    // Use Unsplash Source with search terms
    // Note: Adding timestamp as cache buster to get different images
    return `https://source.unsplash.com/1920x1080/?${searchTerm}&sig=${timeSeed}`;
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
      console.error('[HolidayContext] Failed to fetch holiday:', error);
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
  const updateBackgroundImage = (holiday: Holiday, forceRandom: boolean = false) => {
    const imageUrl = generateImageUrl(holiday.name, forceRandom);
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
        const shouldRotate = autoRotate && needsRotation();
        
        if (isNewHoliday || shouldRotate) {
          updateBackgroundImage(holiday);
        }
      } else {
        // No upcoming holiday - clear background
        setBackgroundState({ name: null, date: null, imageUrl: null, lastRotation: null });
        localStorage.removeItem(STORAGE_KEYS.CURRENT);
      }
    } catch (error) {
      console.error('[HolidayContext] Error checking holiday:', error);
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

  // Toggle auto-rotation
  const toggleAutoRotate = () => {
    const newAutoRotate = !autoRotate;
    setAutoRotate(newAutoRotate);
    localStorage.setItem(STORAGE_KEYS.AUTO_ROTATE, JSON.stringify(newAutoRotate));
  };

  // Force refresh image
  const refreshImage = () => {
    if (currentHoliday) {
      updateBackgroundImage(currentHoliday, true); // Force random image
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
        autoRotate,
        toggleAutoRotate,
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
