import { createContext, useContext, useState, ReactNode } from 'react';

interface DailyGoalsContextType {
  showDailyGoals: boolean;
  setShowDailyGoals: (show: boolean) => void;
}

const DailyGoalsContext = createContext<DailyGoalsContextType | undefined>(undefined);

export const DailyGoalsProvider = ({ children }: { children: ReactNode }) => {
  const [showDailyGoals, setShowDailyGoalsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('showDailyGoals');
    return saved !== null ? saved === 'true' : true; // Default to true
  });

  const setShowDailyGoals = (show: boolean) => {
    setShowDailyGoalsState(show);
    localStorage.setItem('showDailyGoals', String(show));
  };

  return (
    <DailyGoalsContext.Provider value={{ showDailyGoals, setShowDailyGoals }}>
      {children}
    </DailyGoalsContext.Provider>
  );
};

export const useDailyGoals = () => {
  const context = useContext(DailyGoalsContext);
  if (context === undefined) {
    throw new Error('useDailyGoals must be used within a DailyGoalsProvider');
  }
  return context;
};

