import { createContext, useContext, useState, ReactNode } from 'react';

interface QuarterlyGoalsContextType {
  showQuarterlyGoals: boolean;
  setShowQuarterlyGoals: (show: boolean) => void;
}

const QuarterlyGoalsContext = createContext<QuarterlyGoalsContextType | undefined>(undefined);

export const QuarterlyGoalsProvider = ({ children }: { children: ReactNode }) => {
  const [showQuarterlyGoals, setShowQuarterlyGoalsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('showQuarterlyGoals');
    return saved !== null ? saved === 'true' : true; // Default to true
  });

  const setShowQuarterlyGoals = (show: boolean) => {
    setShowQuarterlyGoalsState(show);
    localStorage.setItem('showQuarterlyGoals', String(show));
  };

  return (
    <QuarterlyGoalsContext.Provider value={{ showQuarterlyGoals, setShowQuarterlyGoals }}>
      {children}
    </QuarterlyGoalsContext.Provider>
  );
};

export const useQuarterlyGoals = () => {
  const context = useContext(QuarterlyGoalsContext);
  if (context === undefined) {
    throw new Error('useQuarterlyGoals must be used within a QuarterlyGoalsProvider');
  }
  return context;
};

