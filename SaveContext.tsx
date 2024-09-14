import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SaveContextType = {
  customRatios: { meat: number; bone: number; organ: number; plantMatter: number; includePlantMatter: boolean };
  saveCustomRatios: (newRatios: { meat: number; bone: number; organ: number; plantMatter: number; includePlantMatter: boolean }) => void;
};

const SaveContext = createContext<SaveContextType | undefined>(undefined);

export const SaveProvider: React.FC = ({ children }) => {
  const [customRatios, setCustomRatios] = useState({
    meat: 0,
    bone: 0,
    organ: 0,
    plantMatter: 0,
    includePlantMatter: false,
  });

  const saveCustomRatios = (newRatios: { meat: number; bone: number; organ: number; plantMatter: number; includePlantMatter: boolean }) => {
    setCustomRatios(newRatios);
    AsyncStorage.setItem('customRatios', JSON.stringify(newRatios));
  };

  return (
    <SaveContext.Provider value={{ customRatios, saveCustomRatios }}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSaveContext = () => {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error('useSaveContext must be used within a SaveProvider');
  }
  return context;
};
