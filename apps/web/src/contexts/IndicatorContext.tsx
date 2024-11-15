'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { Indicator } from '@repo/ui/types/indicators';

export interface IndicatorContextType {
  selectedIndicator: Indicator | null;
  pinnedIndicator: Indicator | null;
  isCompareMode: boolean;
  setSelectedIndicator: (indicator: Indicator | null) => void;
  setPinnedIndicator: (indicator: Indicator | null) => void;
  setIsCompareMode: (isCompare: boolean) => void;
  isPinned: (indicator: Indicator) => boolean;
  togglePin: (indicator: Indicator) => void;
}

const IndicatorContext = createContext<IndicatorContextType | undefined>(undefined);

export function IndicatorProvider({ children }: { children: React.ReactNode }) {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [pinnedIndicator, setPinnedIndicator] = useState<Indicator | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  const isPinned = useCallback((indicator: Indicator) => {
    return pinnedIndicator?.id === indicator.id;
  }, [pinnedIndicator]);

  const togglePin = useCallback((indicator: Indicator) => {
    setPinnedIndicator(current => {
      // Unpinning (current indicator is already pinned)
      if (current?.id === indicator.id) {
        // When unpinning, keep the currently selected indicator (if any)
        // Don't change the selected indicator, just remove the pin
        setIsCompareMode(false);
        return null;
      }
      
      // If we're pinning a new indicator
      if (selectedIndicator?.id === indicator.id) {
        // If the indicator being pinned is the currently selected one,
        // clear the selection since it's moving to the top
        setSelectedIndicator(null);
        setIsCompareMode(true);
        return indicator;
      } else {
        // If we're pinning a different indicator than the selected one,
        // maintain the current selection for comparison
        setIsCompareMode(true);
        return indicator;
      }
    });
  }, [selectedIndicator]);

  const value = {
    selectedIndicator,
    pinnedIndicator,
    isCompareMode,
    setSelectedIndicator,
    setPinnedIndicator,
    setIsCompareMode,
    isPinned,
    togglePin
  };

  return (
    <IndicatorContext.Provider value={value}>
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