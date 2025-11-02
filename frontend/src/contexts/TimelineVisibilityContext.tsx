import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimelineVisibilityContextType {
  isTimelineVisible: boolean;
  toggleTimeline: () => void;
  setTimelineVisible: (value: boolean) => void;
}

const TimelineVisibilityContext = createContext<TimelineVisibilityContextType | undefined>(undefined);

export const TimelineVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isTimelineVisible, setIsTimelineVisible] = useState(() => {
    const saved = localStorage.getItem('timelineVisible');
    return saved === null ? true : saved === 'true'; // Default to true (visible)
  });

  useEffect(() => {
    localStorage.setItem('timelineVisible', isTimelineVisible.toString());
  }, [isTimelineVisible]);

  const toggleTimeline = () => {
    setIsTimelineVisible(prev => !prev);
  };

  const setTimelineVisible = (value: boolean) => {
    setIsTimelineVisible(value);
  };

  return (
    <TimelineVisibilityContext.Provider value={{ isTimelineVisible, toggleTimeline, setTimelineVisible }}>
      {children}
    </TimelineVisibilityContext.Provider>
  );
};

export const useTimelineVisibility = () => {
  const context = useContext(TimelineVisibilityContext);
  if (context === undefined) {
    throw new Error('useTimelineVisibility must be used within a TimelineVisibilityProvider');
  }
  return context;
};

