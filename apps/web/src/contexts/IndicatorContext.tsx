'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useData } from './DataContext';
import type { Indicator } from '@repo/ui/types/indicators';

export interface IndicatorContextType {
  selectedIndicator: Indicator | null;
  pinnedIndicator: Indicator | null;
  isCompareMode: boolean;
  showNaturaAreas: boolean;
  setSelectedIndicator: (indicator: Indicator | null) => void;
  setPinnedIndicator: (indicator: Indicator | null) => void;
  setIsCompareMode: (isCompare: boolean) => void;
  isPinned: (indicator: Indicator) => boolean;
  togglePin: (indicator: Indicator) => void;
  setPinnedIndicatorYear: (year: number | undefined) => void;
  setShowNaturaAreas: (show: boolean) => void;
}

const IndicatorContext = createContext<IndicatorContextType | undefined>(undefined);

export function IndicatorProvider({ children }: { children: React.ReactNode }) {
  const { indicators } = useData();
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [pinnedIndicator, setPinnedIndicator] = useState<Indicator | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [showNaturaAreas, setShowNaturaAreas] = useState<boolean>(false);

  useEffect(() => {
    if (indicators?.length > 0) {
      setSelectedIndicator(indicators[0]);
    }
  }, [indicators]);

  const isPinned = useCallback((indicator: Indicator) => {
    return pinnedIndicator?.id === indicator.id;
  }, [pinnedIndicator]);

  const togglePin = useCallback((indicator: Indicator) => {
    setPinnedIndicator(current => {
      if (current?.id === indicator.id) {
        setIsCompareMode(false);
        if (selectedIndicator?.id === indicator.id) {
          setSelectedIndicator(null);
        }
        return null;
      }

      const selectedYear = selectedIndicator?.id === indicator.id
        ? selectedIndicator.selectedYear
        : undefined;

      setIsCompareMode(true);
      if (selectedIndicator?.id === indicator.id) {
        setSelectedIndicator(null);
      }

      return {
        ...indicator,
        selectedYear: selectedYear
      };
    });
  }, [selectedIndicator]);

  const setPinnedIndicatorYear = useCallback((year: number | undefined) => {
    if (pinnedIndicator) {
      setPinnedIndicator({
        ...pinnedIndicator,
        selectedYear: year
      });
    }
  }, [pinnedIndicator]);

  const value = {
    selectedIndicator,
    pinnedIndicator,
    isCompareMode,
    showNaturaAreas,
    setSelectedIndicator,
    setPinnedIndicator,
    setIsCompareMode,
    isPinned,
    togglePin,
    setPinnedIndicatorYear,
    setShowNaturaAreas
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