import { createContext, useContext, useState, ReactNode } from 'react';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const TimezoneProvider = ({ children }: { children: ReactNode }) => {
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Load from localStorage or default to America/New_York
    return localStorage.getItem('timezone') || 'America/New_York';
  });

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem('timezone', tz);
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

