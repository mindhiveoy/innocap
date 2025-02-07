import { fetchFirebaseData } from '@/utils/firebaseOperations';

export async function getDataFromContext(selectedId?: string, pinnedId?: string) {
  // Fetch data from Firebase
  const data = await fetchFirebaseData();
  
  // Get full data for selected indicator
  const selectedIndicator = selectedId ? data.indicators?.find(i => i.id === selectedId) : null;
  const selectedMunicipalityData = selectedId ? data.municipalityLevelData?.filter(d => d.id === selectedId) || [] : [];
  const selectedMarkerData = selectedId ? data.markerData?.filter(d => d.id === selectedId) || [] : [];
  const selectedBarChartData = selectedId ? data.barChartData?.filter(d => d.id === selectedId) || [] : [];

  // Get full data for pinned indicator
  const pinnedIndicator = pinnedId ? data.indicators?.find(i => i.id === pinnedId) : null;
  const pinnedMunicipalityData = pinnedId ? data.municipalityLevelData?.filter(d => d.id === pinnedId) || [] : [];
  const pinnedMarkerData = pinnedId ? data.markerData?.filter(d => d.id === pinnedId) || [] : [];
  const pinnedBarChartData = pinnedId ? data.barChartData?.filter(d => d.id === pinnedId) || [] : [];

  return {
    selectedData: selectedIndicator ? {
      indicator: selectedIndicator,
      municipalityData: selectedMunicipalityData,
      markerData: selectedMarkerData,
      barChartData: selectedBarChartData
    } : null,
    pinnedData: pinnedIndicator ? {
      indicator: pinnedIndicator,
      municipalityData: pinnedMunicipalityData,
      markerData: pinnedMarkerData,
      barChartData: pinnedBarChartData
    } : null
  };
} 