import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface TransparentLabelsContextType {
  transparentLabels: boolean;
  setTransparentLabels: (value: boolean) => void;
  toggleTransparentLabels: () => void;
}

const TransparentLabelsContext = createContext<TransparentLabelsContextType | undefined>(undefined);

export const TransparentLabelsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transparentLabels, setTransparentLabelsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('transparentLabels');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('transparentLabels', JSON.stringify(transparentLabels));
  }, [transparentLabels]);

  const setTransparentLabels = (value: boolean) => {
    setTransparentLabelsState(value);
  };

  const toggleTransparentLabels = () => {
    setTransparentLabelsState((prev) => !prev);
  };

  return (
    <TransparentLabelsContext.Provider 
      value={{ 
        transparentLabels, 
        setTransparentLabels, 
        toggleTransparentLabels 
      }}
    >
      {children}
    </TransparentLabelsContext.Provider>
  );
};

export const useTransparentLabels = (): TransparentLabelsContextType => {
  const context = useContext(TransparentLabelsContext);
  if (!context) {
    throw new Error('useTransparentLabels must be used within a TransparentLabelsProvider');
  }
  return context;
};

