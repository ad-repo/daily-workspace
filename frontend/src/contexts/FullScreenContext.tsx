import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FullScreenContextType {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  setFullScreen: (value: boolean) => void;
}

const FullScreenContext = createContext<FullScreenContextType | undefined>(undefined);

export const FullScreenProvider = ({ children }: { children: ReactNode }) => {
  const [isFullScreen, setIsFullScreen] = useState(() => {
    const saved = localStorage.getItem('fullScreenMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('fullScreenMode', isFullScreen.toString());
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  const setFullScreen = (value: boolean) => {
    setIsFullScreen(value);
  };

  return (
    <FullScreenContext.Provider value={{ isFullScreen, toggleFullScreen, setFullScreen }}>
      {children}
    </FullScreenContext.Provider>
  );
};

export const useFullScreen = () => {
  const context = useContext(FullScreenContext);
  if (context === undefined) {
    throw new Error('useFullScreen must be used within a FullScreenProvider');
  }
  return context;
};

