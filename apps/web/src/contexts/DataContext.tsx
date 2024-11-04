'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Indicator, IndicatorData } from '@/types/indicators';
interface DataContextType {
  indicators: Indicator[];
  data: IndicatorData[];
  loading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [data, setData] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sheets');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.details || 'Failed to fetch data');
        }

        const data = await response.json();
      
        setIndicators(data.indicators);
        setData(data.data);
      } catch (err) {
        console.error('Error in DataProvider:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ indicators, data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 