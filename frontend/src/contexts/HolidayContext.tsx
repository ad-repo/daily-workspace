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
  currentImageIndex: number; // Track which uploaded image is shown
}

interface UploadedImage {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  content_type: string;
  size: number;
}

type ImageSource = 'uploaded' | 'picsum' | 'both';

interface HolidayContextType {
  enabled: boolean;
  daysAhead: number;
  currentHoliday: Holiday | null;
  backgroundImage: string | null;
  toggleEnabled: () => void;
  setDaysAhead: (days: number) => void;
  refreshImage: () => void;
  isLoading: boolean;
  uploadedImages: UploadedImage[];
  fetchUploadedImages: () => Promise<void>;
  imageSource: ImageSource;
  setImageSource: (source: ImageSource) => void;
  autoRotate: boolean;
  toggleAutoRotate: () => void;
}

const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENABLED: 'holiday_background_enabled',
  DAYS_AHEAD: 'holiday_background_days_ahead',
  CURRENT: 'holiday_background_current',
  IMAGE_SOURCE: 'holiday_background_image_source',
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
        return { name: null, date: null, imageUrl: null, lastRotation: null, currentImageIndex: 0 };
      }
    }
    return { name: null, date: null, imageUrl: null, lastRotation: null, currentImageIndex: 0 };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [imageSource, setImageSourceState] = useState<ImageSource>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.IMAGE_SOURCE);
    return (stored as ImageSource) || 'both';
  });
  const [autoRotate, setAutoRotate] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_ROTATE);
    return stored ? JSON.parse(stored) : true; // Default to true (enabled)
  });

  // Fetch uploaded images from backend
  const fetchUploadedImages = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/api/holiday-backgrounds/list`);
      setUploadedImages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch uploaded images:', error);
      setUploadedImages([]);
    }
  };

  // Generate image URL based on source preference
  const generateImageUrl = (holidayName: string, forceNext: boolean = false): { url: string; nextIndex: number } => {
    console.log('[HolidayContext] generateImageUrl called:', { 
      holidayName, 
      forceNext, 
      imageSource, 
      uploadedImagesCount: uploadedImages.length,
      currentIndex: backgroundState.currentImageIndex 
    });
    
    // Determine which source to use
    let useSource: 'uploaded' | 'picsum' = 'picsum';
    
    if (imageSource === 'uploaded' && uploadedImages.length > 0) {
      useSource = 'uploaded';
    } else if (imageSource === 'both' && uploadedImages.length > 0) {
      // Alternate or randomly choose
      useSource = Math.random() > 0.5 ? 'uploaded' : 'picsum';
    } else if (imageSource === 'picsum' || uploadedImages.length === 0) {
      useSource = 'picsum';
    }

    console.log('[HolidayContext] Using source:', useSource);

    if (useSource === 'uploaded' && uploadedImages.length > 0) {
      // Cycle through uploaded images
      let nextIndex = backgroundState.currentImageIndex || 0;
      
      if (forceNext) {
        nextIndex = (backgroundState.currentImageIndex + 1) % uploadedImages.length;
      }
      
      const url = `${API_URL}${uploadedImages[nextIndex].url}`;
      console.log('[HolidayContext] Generated uploaded image URL:', { url, nextIndex });
      
      return { url, nextIndex };
    } else {
      // Use Picsum Photos with seed
      const timeSeed = forceNext 
        ? Math.floor(Math.random() * 1000000) // Random number for manual refresh
        : Math.floor(Date.now() / (1000 * 60 * 60)); // Hour-based for automatic rotation
      const seed = `${holidayName.replace(/\s+/g, '-').toLowerCase()}-${timeSeed}`;
      const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1920/1080`;
      
      console.log('[HolidayContext] Generated Picsum URL:', url);
      
      return { url, nextIndex: backgroundState.currentImageIndex };
    }
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
  const updateBackgroundImage = (holiday: Holiday, forceNext: boolean = false) => {
    const { url, nextIndex } = generateImageUrl(holiday.name, forceNext);
    console.log('[HolidayContext] Updating background image:', { holiday: holiday.name, url, nextIndex, forceNext });
    const newState: HolidayBackgroundState = {
      name: holiday.name,
      date: holiday.date,
      imageUrl: url,
      lastRotation: Date.now(),
      currentImageIndex: nextIndex,
    };
    
    setBackgroundState(newState);
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(newState));
    console.log('[HolidayContext] Background state updated:', newState);
  };

  // Main check function
  const checkAndUpdateHoliday = async () => {
    console.log('[HolidayContext] checkAndUpdateHoliday called, enabled:', enabled);
    if (!enabled) {
      console.log('[HolidayContext] Feature disabled, skipping check');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[HolidayContext] Fetching current holiday...');
      const holiday = await fetchCurrentHoliday();
      console.log('[HolidayContext] Fetched holiday:', holiday);
      setCurrentHoliday(holiday);

      if (holiday) {
        // Check if it's a new holiday or needs rotation
        const isNewHoliday = holiday.name !== backgroundState.name;
        const shouldRotate = autoRotate && needsRotation();
        console.log('[HolidayContext] Holiday check:', { 
          isNewHoliday, 
          shouldRotate,
          autoRotate,
          needsRotation: needsRotation(),
          currentHoliday: holiday.name,
          storedHoliday: backgroundState.name 
        });
        
        if (isNewHoliday || shouldRotate) {
          console.log('[HolidayContext] Updating background image...');
          updateBackgroundImage(holiday);
        } else {
          console.log('[HolidayContext] Using existing background');
        }
      } else {
        console.log('[HolidayContext] No holiday found, clearing background');
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

  // Update image source
  const setImageSource = (source: ImageSource) => {
    setImageSourceState(source);
    localStorage.setItem(STORAGE_KEYS.IMAGE_SOURCE, source);
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
      updateBackgroundImage(currentHoliday, true); // Force next image
    }
  };

  // Fetch uploaded images on mount
  useEffect(() => {
    fetchUploadedImages();
  }, []);

  // Initial check on mount
  useEffect(() => {
    if (enabled) {
      checkAndUpdateHoliday();
    }
  }, [enabled]);

  // Refresh image when imageSource or uploadedImages changes
  useEffect(() => {
    if (enabled && currentHoliday && uploadedImages.length > 0) {
      console.log('[HolidayContext] Image source or uploaded images changed, refreshing...');
      updateBackgroundImage(currentHoliday, false);
    }
  }, [imageSource, uploadedImages.length]);

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
        uploadedImages,
        fetchUploadedImages,
        imageSource,
        setImageSource,
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

