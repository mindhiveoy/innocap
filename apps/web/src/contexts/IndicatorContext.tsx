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
  const [pinnedIndicators, setPinnedIndicators] = useState<Set<string>>(new Set());

  const isPinned = (indicator: Indicator) => {
    return pinnedIndicators.has(indicator.id);
  };

  const togglePin = (indicator: Indicator) => {
    setPinnedIndicators(prev => {
      const newPinned = new Set(prev);
      
      if (newPinned.has(indicator.id)) {
        // Unpin: Remove from pinned set and comparison if needed
        newPinned.delete(indicator.id);
        if (comparisonIndicator?.id === indicator.id) {
          setComparisonIndicator(null);
        }
        if (selectedIndicator?.id === indicator.id) {
          setSelectedIndicator(null);
        }
        setIsCompareMode(false);
      } else {
        // Pin: Add to pinned set
        newPinned.add(indicator.id);
        
        // Clear any existing selection
        if (selectedIndicator?.id === indicator.id) {
          // If pinning the currently selected indicator, move it to primary position
          setSelectedIndicator(indicator);
          setComparisonIndicator(null);
        } else if (!selectedIndicator) {
          // If nothing selected, set as primary
          setSelectedIndicator(indicator);
        } else {
          // If something else selected, set as comparison
          setComparisonIndicator(indicator);
          setIsCompareMode(true);
        }
      }
      return newPinned;
    });
  };

  const handleSetSelectedIndicator = (indicator: Indicator | null) => {
    // Only allow selection of unpinned indicators
    if (!indicator || !isPinned(indicator)) {
      setSelectedIndicator(indicator);
      if (indicator) {
        setSelectedYears(prev => ({
          ...prev,
          [indicator.id]: 'all'
        }));
      }
    }
  };

  const handleSetComparisonIndicator = (indicator: Indicator | null) => {
    setComparisonIndicator(indicator);
    if (indicator) {
      setSelectedYears(prev => ({
        ...prev,
        [indicator.id]: 'all'
      }));
    }
  };

  const setSelectedYear = (indicatorId: string, year: string) => {
    setSelectedYears(prev => ({
      ...prev,
      [indicatorId]: year
    }));
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