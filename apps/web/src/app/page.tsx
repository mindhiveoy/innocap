'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { SideNav } from '@/components/SideNav';
import { useData } from '@/contexts/DataContext';
import { useIndicator } from '@/contexts/IndicatorContext';
import type { LatLngTuple, LatLngBoundsExpression } from 'leaflet';
import { NAV_WIDTH, NAV_HEIGHT } from '@/constants/layout';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { IndicatorType } from '@repo/ui/types/indicators';

const Map = dynamic(
  () => import('@repo/ui/components/map').then(mod => mod.LeafletMap),
  { ssr: false }
);

const SplitMap = dynamic(
  () => import('@repo/ui/components/map').then(mod => mod.SplitMapView),
  { ssr: false }
);

// Adjusted bounds based on municipality data:
// Most western point: ~26.22 (Kangasniemi)
// Most eastern point: ~29.69 (Savonlinna)
// Most southern point: ~61.15 (Mäntyharju)
// Most northern point: ~62.65 (Heinävesi)
const MAP_BOUNDS: LatLngBoundsExpression = [
  [61.10, 25.70], // Southwest corner
  [62.60, 29.75]  // Northeast corner
];

export default function Home() {
  const { municipalityData, markerData, barChartData, isLoading } = useData();
  const { selectedIndicator, pinnedIndicator, isCompareMode } = useIndicator();
  const center: LatLngTuple = [61.90, 27.70];
  const zoom = 9;

  // Only use split view when comparing two municipality-level indicators
  const showSplitView = isCompareMode && 
    pinnedIndicator?.indicatorType === IndicatorType.MunicipalityLevel && 
    selectedIndicator?.indicatorType === IndicatorType.MunicipalityLevel;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      pb: { xs: `${NAV_HEIGHT}px`, md: 0 },
      pl: { xs: 0, md: `${NAV_WIDTH}px` },
    }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
        {isLoading && <LoadingOverlay />}
        
        {showSplitView ? (
          <SplitMap
            pinnedIndicator={pinnedIndicator}
            selectedIndicator={selectedIndicator}
            municipalityData={municipalityData}
            markerData={markerData}
            barChartData={barChartData}
            center={center}
            zoom={zoom}
            maxBounds={MAP_BOUNDS}
          />
        ) : (
          <Map 
            center={center} 
            zoom={zoom}
            maxBounds={MAP_BOUNDS}
            minZoom={8}
            maxZoom={10}
            municipalityData={municipalityData}
            markerData={markerData}
            barChartData={barChartData}
            selectedIndicator={selectedIndicator}
            pinnedIndicator={pinnedIndicator}
            isPinned={!!pinnedIndicator}
          />
        )}
      </Box>
    </Box>
  );
}
