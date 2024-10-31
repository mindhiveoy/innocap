'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { SideNav } from '@/components/SideNav';
import type { LatLngTuple, LatLngBoundsExpression } from 'leaflet';

const Map = dynamic(
  () => import('@repo/ui/components/map').then(mod => mod.LeafletMap),
  { ssr: false }
);

// Adjusted bounds based on municipality data:
// Most western point: ~26.22 (Kangasniemi)
// Most eastern point: ~29.69 (Savonlinna)
// Most southern point: ~61.15 (Mäntyharju)
// Most northern point: ~62.65 (Heinävesi)
const MAP_BOUNDS: LatLngBoundsExpression = [
  [61.10, 25.70], // Southwest corner
  [62.70, 29.75]  // Northeast corner
];

export default function Home() {
  const center: LatLngTuple = [61.90, 27.70]; // Between Mikkeli and Savonlinna
  const zoom = 8;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Map 
          center={center} 
          zoom={zoom}
          maxBounds={MAP_BOUNDS}
          minZoom={8}
          maxZoom={11}
        />
      </Box>
    </Box>
  );
}
