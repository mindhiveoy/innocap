'use client';

import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayerGroup } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { municipalityBoundaries } from './data/municipality-boundaries';
import { Indicator, MunicipalityLevelData, MarkerData, IndicatorType } from '@repo/ui/types/indicators';
import { calculateOpacity, Unit } from '../../types/units';
import { MunicipalityTooltip } from './MunicipalityTooltip';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';
import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import './leafletMap.css';

interface LeafletMapProps {
  center: LatLngTuple;
  zoom: number;
  children?: React.ReactNode;
  maxBounds?: LatLngBoundsExpression;
  minZoom?: number;
  maxZoom?: number;
  municipalityData?: MunicipalityLevelData[];
  markerData?: MarkerData[];
  selectedIndicator?: Indicator | null;
}

const geoJSONStyle = {
  fillColor: 'transparent',
  weight: 1,
  opacity: 0.7,
  color: '#444',
  fillOpacity: 0,
};

// Create a simple marker icon for debugging
const defaultIcon = L.divIcon({
  html: `<div style="
    width: 32px;
    height: 32px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    color: #014B70;
    font-size: 20px;
  ">•</div>`,
  className: 'custom-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export function LeafletMap({
  center,
  zoom,
  children,
  maxBounds,
  minZoom,
  maxZoom,
  municipalityData = [],
  markerData = [],
  selectedIndicator
}: LeafletMapProps) {
  // Filter marker data based on selected indicator
  const filteredMarkerData = useMemo(() => {
    if (!selectedIndicator || !markerData) return [];
    return markerData.filter(marker => marker.id === selectedIndicator.id);
  }, [selectedIndicator?.id, markerData]);

  // Handle choropleth data
  const getFeatureData = (feature: any) => {
    if (!selectedIndicator || !municipalityData) return null;
    return municipalityData
      .filter(d => d.id === selectedIndicator.id)
      .find(d => d.municipalityCode === feature.properties.kunta);
  };

  const getStyle = (feature: any) => {
    const featureData = getFeatureData(feature);
    
    if (featureData && selectedIndicator?.indicatorType === IndicatorType.MunicipalityLevel) {
      const allValues = municipalityData
        .filter(d => d.id === selectedIndicator.id)
        .map(d => d.value);

      return {
        ...geoJSONStyle,
        fillColor: selectedIndicator.color,
        fillOpacity: calculateOpacity(
          featureData.value,
          allValues,
          featureData.unit as Unit
        ),
      };
    }

    return geoJSONStyle;
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (selectedIndicator?.indicatorType === IndicatorType.MunicipalityLevel) {
      const municipalityData = getFeatureData(feature);
      
      if (municipalityData) {
        const tooltip = L.tooltip({
          permanent: false,
          direction: 'center',
          className: 'municipality-tooltip-container',
          opacity: 0.9
        });

        layer.bindTooltip(tooltip);

        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            const currentStyle = getStyle(feature);
            layer.setStyle({
              ...currentStyle,
              weight: 2,
              color: '#666',
            });
            layer.bringToFront();

            const container = document.createElement('div');
            const root = createRoot(container);
            root.render(
              <ThemeProvider theme={theme}>
                <MunicipalityTooltip 
                  name={feature.properties.name}
                  data={municipalityData}
                  color={selectedIndicator?.color}
                  opacity={currentStyle.fillOpacity}
                />
              </ThemeProvider>
            );
            tooltip.setContent(container);
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle(getStyle(feature));
          }
        });
      }
    }
  };

  // Render markers
  const markerElements = useMemo(() => {
    if (selectedIndicator?.indicatorType !== IndicatorType.Marker || !filteredMarkerData.length) {
      return null;
    }

    return (
      <LayerGroup>
        {filteredMarkerData.map((marker) => (
          <Marker
            key={`${marker.id}-${marker.municipalityName}-${marker.location.join(',')}`}
            position={marker.location}
            icon={defaultIcon}
          >
            <Popup>
              <div>
                <h3>{marker.indicatorNameEn}</h3>
                <p>{marker.descriptionEn}</p>
                {marker.info && <p>{marker.info}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    );
  }, [filteredMarkerData, selectedIndicator?.indicatorType]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
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
        key={`geojson-${selectedIndicator?.id || 'base'}`}
        data={municipalityBoundaries}
        style={getStyle}
        onEachFeature={onEachFeature}
      />
      {markerElements}
      {children}
    </MapContainer>
  );
} 