'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Indicator, MunicipalityLevelData, MarkerData } from '@repo/ui/types/indicators';

interface DataContextType {
  indicators: Indicator[];
  municipalityData: MunicipalityLevelData[];
  markerData: MarkerData[];
  isLoading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [municipalityData, setMunicipalityData] = useState<MunicipalityLevelData[]>([]);
  const [markerData, setMarkerData] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

        const responseData = await response.json();
        setIndicators(responseData.indicators);
        
        // Destructure the data more cleanly
        const { data } = responseData;
        setMunicipalityData(data['Municipality Level Data'] || []);
        setMarkerData(data['Marker'] || []);
      } catch (err) {
        console.error('Error in DataProvider:', err);
        setError(err as Error);
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