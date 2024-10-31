'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  center: LatLngTuple;
  zoom: number;
}

export function LeafletMap({ center, zoom }: LeafletMapProps) {

  return (
    <MapContainer
      center={center}
      zoom={zoom || 10}
      scrollWheelZoom={false}
      style={{ height: "100vh" }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

    </MapContainer>
  );
} 