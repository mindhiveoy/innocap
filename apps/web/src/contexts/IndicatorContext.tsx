'use client';

import { createContext, useContext, useState } from 'react';
import type { Indicator } from '@repo/ui/types/indicators';
interface IndicatorContextType {
  selectedIndicator: Indicator | null;
  setSelectedIndicator: (indicator: Indicator | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const IndicatorContext = createContext<IndicatorContextType | undefined>(undefined);

export function IndicatorProvider({ children }: { children: React.ReactNode }) {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [activeTab, setActiveTab] = useState('green'); // green, digital, ai, guide

  return (
    <IndicatorContext.Provider 
      value={{ 
        selectedIndicator, 
        setSelectedIndicator,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </IndicatorContext.Provider>
  );
}

export const useIndicator = () => {
  const context = useContext(IndicatorContext);
  if (context === undefined) {
    throw new Error('useIndicator must be used within an IndicatorProvider');
  }
  return context;
}; 