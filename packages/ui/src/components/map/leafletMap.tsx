'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import { municipalityBoundaries } from './data/municipality-boundaries';
import type { IndicatorData, Indicator } from '@repo/ui/types/indicators';
import { calculateOpacity, type Unit } from '../../types/units';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  center: LatLngTuple;
  zoom: number;
  children?: React.ReactNode;
  maxBounds?: LatLngBoundsExpression;
  minZoom?: number;
  maxZoom?: number;
  indicatorData?: IndicatorData[];
  selectedIndicator?: Indicator | null;
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
  maxZoom,
  indicatorData,
  selectedIndicator
}: LeafletMapProps) {

  const getStyle = (feature: any) => {
    if (!selectedIndicator || !indicatorData) return geoJSONStyle;

    // Get all values for the selected indicator to calculate the scale
    const selectedIndicatorData = indicatorData.filter(
      d => d.id === selectedIndicator.id
    );

    // Find data for this specific municipality
    const municipalityData = selectedIndicatorData.find(
      d => d.municipalityCode === feature.properties.kunta
    );

    if (!municipalityData) return geoJSONStyle;

    // Get all values for this indicator to calculate the scale
    const allValues = selectedIndicatorData.map(d => d.value);

    return {
      ...geoJSONStyle,
      fillColor: selectedIndicator.color,
      fillOpacity: calculateOpacity(
        municipalityData.value,
        allValues,
        municipalityData.unit as Unit
      ),
    };
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom || 10}
      zoomControl={true}
      zoomSnap={0.5}
      zoomDelta={0.5}
      style={{ height: "100vh" }}
      maxBounds={maxBounds}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        className="grayscale-tiles"
      />
      <GeoJSON 
        data={municipalityBoundaries}
        style={getStyle}
      />
      {children}
    </MapContainer>
  );
} 