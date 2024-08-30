import React, { createContext, useState, useContext } from 'react';

type UnitContextType = {
  unit: 'g' | 'kg' | 'lbs';
  setUnit: (unit: 'g' | 'kg' | 'lbs') => void;
};

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<'g' | 'kg' | 'lbs'>('g');

  return (
    <UnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};
