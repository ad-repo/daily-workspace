import { createContext, useContext, useState, ReactNode } from 'react';

interface SprintGoalsContextType {
  showSprintGoals: boolean;
  setShowSprintGoals: (show: boolean) => void;
}

const SprintGoalsContext = createContext<SprintGoalsContextType | undefined>(undefined);

export const SprintGoalsProvider = ({ children }: { children: ReactNode }) => {
  const [showSprintGoals, setShowSprintGoalsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('showSprintGoals');
    return saved !== null ? saved === 'true' : true; // Default to true
  });

  const setShowSprintGoals = (show: boolean) => {
    setShowSprintGoalsState(show);
    localStorage.setItem('showSprintGoals', String(show));
  };

  return (
    <SprintGoalsContext.Provider value={{ showSprintGoals, setShowSprintGoals }}>
      {children}
    </SprintGoalsContext.Provider>
  );
};

export const useSprintGoals = () => {
  const context = useContext(SprintGoalsContext);
  if (context === undefined) {
    throw new Error('useSprintGoals must be used within a SprintGoalsProvider');
  }
  return context;
};

