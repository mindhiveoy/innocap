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
    console.log("🚀 ~ togglePin ~ indicator:", indicator)
    setPinnedIndicator(current => {
      console.log("🚀 ~ togglePin ~ current:", current)
      console.log('selectedIndicator ===> ', selectedIndicator)

      if (indicator.id === selectedIndicator?.id) {
        setSelectedIndicator(null);
      }

      // If we're unpinning (current indicator is already pinned)
      if (current?.id === indicator.id) {
        // When unpinning, set the pinned indicator as the selected one
        setSelectedIndicator(current);
        setIsCompareMode(false);
        return null;
      }
      
      // If we're pinning a new indicator
      if (selectedIndicator?.id === indicator.id) {
        // If the indicator being pinned is the currently selected one,
        // keep it as selected for the bottom map
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