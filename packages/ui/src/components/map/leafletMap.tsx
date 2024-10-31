'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import { municipalityBoundaries } from './data/municipality-boundaries.js';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  center: LatLngTuple;
  zoom: number;
  children?: React.ReactNode;
  maxBounds?: LatLngBoundsExpression;
  minZoom?: number;
  maxZoom?: number;
}

const geoJSONStyle = {
  fillColor: 'transparent',
  weight: 1.5,
  opacity: 0.7,
  color: '#444',
  fillOpacity: 0,
  dashArray: '3'
};

export function LeafletMap({
  center,
  zoom,
  children,
  maxBounds,
  minZoom,
  maxZoom }: LeafletMapProps) {

  return (
    <MapContainer
      center={center}
      zoom={zoom || 10}
      style={{ 
        height: "100vh",
        filter: "grayscale(90%)"
      }}
      maxBounds={maxBounds}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
      />
      <GeoJSON 
        data={municipalityBoundaries}
        style={geoJSONStyle}
      />
      {children}
    </MapContainer>
  );
} 