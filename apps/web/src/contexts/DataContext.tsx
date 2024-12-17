'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Indicator, MunicipalityLevelData, MarkerData, BarChartData } from '@repo/ui/types/indicators';
import { fetchFirebaseData } from '@/utils/firebaseOperations';

interface DataContextType {
  indicators: Indicator[];
  municipalityData: MunicipalityLevelData[];
  markerData: MarkerData[];
  barChartData: BarChartData[];
  isLoading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [municipalityData, setMunicipalityData] = useState<MunicipalityLevelData[]>([]);
  const [markerData, setMarkerData] = useState<MarkerData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFirebaseData();
        
        // Sort all data by year in descending order (latest first)
        const sortedMunicipalityData = [...(data.municipalityLevelData || [])].sort(
          (a, b) => b.year - a.year
        );
        
        const sortedMarkerData = [...(data.markerData || [])].sort(
          (a, b) => b.year - a.year
        );
        
        const sortedBarChartData = [...(data.barChartData || [])].sort(
          (a, b) => b.year - a.year
        );

        setIndicators(data.indicators || []);
        setMunicipalityData(sortedMunicipalityData);
        setMarkerData(sortedMarkerData);
        setBarChartData(sortedBarChartData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{
      indicators,
      municipalityData,
      markerData,
      barChartData,
      isLoading,
      error
    }}>
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