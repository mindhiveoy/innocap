'use client';

import dynamic from 'next/dynamic';
import type { LatLngTuple } from 'leaflet';

interface MapProps {
  center?: LatLngTuple;
  zoom?: number;
  className?: string;
}

const LeafletMap = dynamic(
  () => import('./leaflet-map'),
  { 
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
  }
);

export function Map({ center = [60.1699, 24.9384], zoom = 5, className }: MapProps) {
  return (
    <div style={{ width: '100%', height: '100%' }} className={className}>
      <LeafletMap center={center} zoom={zoom} />
    </div>
  );
} 