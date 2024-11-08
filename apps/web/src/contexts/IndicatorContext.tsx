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
  selectedYears: Record<string, string>;
  setSelectedYear: (indicatorId: string, year: string) => void;
}

const IndicatorContext = createContext<IndicatorContextType | undefined>(undefined);

export function IndicatorProvider({ children }: { children: React.ReactNode }) {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [comparisonIndicator, setComparisonIndicator] = useState<Indicator | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedYears, setSelectedYears] = useState<Record<string, string>>({});

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

  const setSelectedYear = (indicatorId: string, year: string) => {
    setSelectedYears(prev => ({
      ...prev,
      [indicatorId]: year
    }));
  };

  // Initialize 'all' as default when selecting an indicator
  const handleSetSelectedIndicator = (indicator: Indicator | null) => {
    setSelectedIndicator(indicator);
    if (indicator) {
      setSelectedYears(prev => ({
        ...prev,
        [indicator.id]: 'all'
      }));
    }
  };

  // Same for comparison indicator
  const handleSetComparisonIndicator = (indicator: Indicator | null) => {
    setComparisonIndicator(indicator);
    if (indicator) {
      setSelectedYears(prev => ({
        ...prev,
        [indicator.id]: 'all'
      }));
    }
  };

  return (
    <IndicatorContext.Provider 
      value={{ 
        selectedIndicator, 
        comparisonIndicator,
        isCompareMode,
        setSelectedIndicator: handleSetSelectedIndicator,
        setComparisonIndicator: handleSetComparisonIndicator,
        toggleCompareMode: () => setIsCompareMode(prev => !prev),
        isPinned,
        togglePin,
        selectedYears,
        setSelectedYear,
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