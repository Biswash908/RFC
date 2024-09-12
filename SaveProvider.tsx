import React, { createContext, useContext, useState } from 'react';

interface Ratio {
  meat: number;
  bone: number;
  organ: number;
  plantMatter: number;
  includePlantMatter: boolean;
}

interface SaveContextType {
  customRatio: Ratio | null;
  setCustomRatio: (ratio: Ratio) => void;
}

const SaveContext = createContext<SaveContextType | undefined>(undefined);

export const SaveProvider: React.FC = ({ children }) => {
  const [customRatio, setCustomRatio] = useState<Ratio | null>(null);

  const addRatio = (ratio: Ratio) => {
    setCustomRatio(ratio);
  };

  return (
    <SaveContext.Provider value={{ customRatio, setCustomRatio: addRatio }}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSave = () => {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error('useSave must be used within a SaveProvider');
  }
  return context;
};