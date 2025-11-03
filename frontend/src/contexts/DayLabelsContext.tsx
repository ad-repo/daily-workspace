import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DayLabelsContextType {
  showDayLabels: boolean;
  setShowDayLabels: (show: boolean) => void;
}

const DayLabelsContext = createContext<DayLabelsContextType | undefined>(undefined);

export const DayLabelsProvider = ({ children }: { children: ReactNode }) => {
  const [showDayLabels, setShowDayLabelsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('showDayLabels');
    return saved !== null ? saved === 'true' : true; // Default to true
  });

  const setShowDayLabels = (show: boolean) => {
    setShowDayLabelsState(show);
    localStorage.setItem('showDayLabels', String(show));
  };

  return (
    <DayLabelsContext.Provider value={{ showDayLabels, setShowDayLabels }}>
      {children}
    </DayLabelsContext.Provider>
  );
};

export const useDayLabels = () => {
  const context = useContext(DayLabelsContext);
  if (context === undefined) {
    throw new Error('useDayLabels must be used within a DayLabelsProvider');
  }
  return context;
};

