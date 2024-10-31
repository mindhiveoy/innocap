'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { SideNav } from '@/components/SideNav';
import type { LatLngTuple } from 'leaflet';

const Map = dynamic(
  () => import('@repo/ui/components/map').then(mod => mod.LeafletMap),
  { ssr: false }
);

export default function Home() {
  const center: LatLngTuple = [61.6885, 27.2723];
  const zoom = 10;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Map center={center} zoom={zoom} />
      </Box>
    </Box>
  );
}
