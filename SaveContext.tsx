import React, { createContext, useState, useContext } from 'react';

const SaveContext = createContext<{
  onSave: (meat: number, bone: number, organ: number, plantMatter: number, includePlantMatter: boolean) => void;
  setOnSave: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
}>({
  onSave: () => {}, // Initialize with a no-op function
  setOnSave: () => {},
});

export const SaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onSave, setOnSave] = useState<(() => void) | undefined>(undefined);

  return (
    <SaveContext.Provider value={{ onSave, setOnSave }}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSaveContext = () => useContext(SaveContext);
