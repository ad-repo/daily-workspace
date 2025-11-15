import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SprintNameContextType {
  sprintName: string;
  setSprintName: (name: string) => void;
  refreshSprintName: () => Promise<void>;
}

const SprintNameContext = createContext<SprintNameContextType | undefined>(undefined);

export const SprintNameProvider = ({ children }: { children: ReactNode }) => {
  const [sprintName, setSprintNameState] = useState('Sprint');

  const loadSprintName = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSprintNameState(response.data.sprint_name || 'Sprint');
    } catch (error) {
      console.error('Error loading sprint name:', error);
    }
  };

  useEffect(() => {
    loadSprintName();
  }, []);

  const setSprintName = (name: string) => {
    setSprintNameState(name);
  };

  const refreshSprintName = async () => {
    await loadSprintName();
  };

  return (
    <SprintNameContext.Provider value={{ sprintName, setSprintName, refreshSprintName }}>
      {children}
    </SprintNameContext.Provider>
  );
};

export const useSprintName = () => {
  const context = useContext(SprintNameContext);
  if (context === undefined) {
    throw new Error('useSprintName must be used within a SprintNameProvider');
  }
  return context;
};

