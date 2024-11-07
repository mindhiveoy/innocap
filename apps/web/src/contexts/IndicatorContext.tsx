'use client';

import { createContext, useContext, useState } from 'react';
import type { Indicator } from '@repo/ui/types/indicators';

export interface IndicatorContextType {
  selectedIndicator: Indicator | null;
  comparisonIndicator: Indicator | null;
  isCompareMode: boolean;
  setSelectedIndicator: (indicator: Indicator | null) => void;
  setComparisonIndicator: (indicator: Indicator | null) => void;
  toggleCompareMode: () => void;
  isPinned: (indicator: Indicator) => boolean;
  togglePin: (indicator: Indicator) => void;
}

const IndicatorContext = createContext<IndicatorContextType | undefined>(undefined);

export function IndicatorProvider({ children }: { children: React.ReactNode }) {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [comparisonIndicator, setComparisonIndicator] = useState<Indicator | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const isPinned = (indicator: Indicator) => {
    return selectedIndicator?.id === indicator.id || comparisonIndicator?.id === indicator.id;
  };

  const togglePin = (indicator: Indicator) => {
    if (isPinned(indicator)) {
      // Unpin: Remove from either selected or comparison
      if (selectedIndicator?.id === indicator.id) {
        setSelectedIndicator(comparisonIndicator);
        setComparisonIndicator(null);
      } else {
        setComparisonIndicator(null);
      }
      
      // If unpinning leaves only one indicator, exit compare mode
      setIsCompareMode(false);
    } else {
      // Pin: Add to either selected or comparison slot
      if (!selectedIndicator) {
        setSelectedIndicator(indicator);
      } else if (!comparisonIndicator) {
        setComparisonIndicator(indicator);
        setIsCompareMode(true);
      }
      // If both slots are full, do nothing
    }
  };

  return (
    <IndicatorContext.Provider 
      value={{ 
        selectedIndicator, 
        comparisonIndicator,
        isCompareMode,
        setSelectedIndicator,
        setComparisonIndicator,
        toggleCompareMode: () => setIsCompareMode(prev => !prev),
        isPinned,
        togglePin,
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