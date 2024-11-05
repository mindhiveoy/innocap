'use client';

import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { municipalityBoundaries } from './data/municipality-boundaries';
import { Indicator, MunicipalityLevelData, MarkerData } from '@repo/ui/types/indicators';
import { calculateOpacity, Unit } from '../../types/units';
import { MunicipalityTooltip } from './MunicipalityTooltip';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';
import { useMemo, useCallback } from 'react';
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
  // Memoize the filtered data for the selected indicator
  const selectedMunicipalityData = useMemo(() => {
    if (!selectedIndicator || !municipalityData) return [];
    return municipalityData.filter(d => d.id === selectedIndicator.id);
  }, [selectedIndicator?.id, municipalityData]);

  // Memoize all values for opacity calculation
  const allValues = useMemo(() => {
    return selectedMunicipalityData.map(d => d.value);
  }, [selectedMunicipalityData]);

  const getFeatureData = useCallback((feature: any) => {
    if (!selectedMunicipalityData.length) return null;
    return selectedMunicipalityData.find(
      d => d.municipalityCode === feature.properties.kunta
    );
  }, [selectedMunicipalityData]);

  const calculateFeatureOpacity = useCallback((feature: any) => {
    const featureData = getFeatureData(feature);
    
    if (!featureData || !selectedIndicator || !allValues.length) {
      return 0;
    }

    return calculateOpacity(
      featureData.value,
      allValues,
      featureData.unit as Unit
    );
  }, [getFeatureData, selectedIndicator, allValues]);

  const getStyle = useCallback((feature: any) => {
    if (!selectedIndicator || !getFeatureData(feature)) {
      return geoJSONStyle;
    }

    return {
      ...geoJSONStyle,
      fillColor: selectedIndicator.color,
      fillOpacity: calculateFeatureOpacity(feature),
    };
  }, [selectedIndicator, getFeatureData, calculateFeatureOpacity]);

  const createTooltipContent = useCallback((feature: any) => {
    const municipalityData = getFeatureData(feature);
    const opacity = calculateFeatureOpacity(feature);
    
    const container = document.createElement('div');
    
    const root = createRoot(container);
    root.render(
      <ThemeProvider theme={theme}>
        <MunicipalityTooltip 
          name={feature.properties.name}
          data={municipalityData || undefined}
          color={selectedIndicator?.color || '#ccc'}
          opacity={opacity}
        />
      </ThemeProvider>
    );

    return container;
  }, [getFeatureData, calculateFeatureOpacity, selectedIndicator?.color]);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    const municipalityData = getFeatureData(feature);
    
    if (municipalityData) {
      const tooltip = L.tooltip({
        permanent: false,
        direction: 'center',
        className: 'municipality-tooltip-container',
        opacity: 1
      });

      layer.bindTooltip(tooltip);

      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          
          const currentStyle = getStyle(feature);
          layer.setStyle({
            ...currentStyle,
            weight: 3,
            color: selectedIndicator?.color || '#666',
            dashArray: ''
          });
          
          layer.bringToFront();
          tooltip.setContent(createTooltipContent(feature));
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(getStyle(feature));
        }
      });
    }
  }, [getStyle, createTooltipContent, getFeatureData]);

  // Memoize marker data rendering
  const markerElements = useMemo(() => {
    if (selectedIndicator?.indicatorType !== 'Marker') return null;
    
    return markerData?.map((marker) => (
      <Marker
        key={`marker-${marker.id}`}
        position={marker.location}
        icon={L.icon({
          iconUrl: `/icons/${marker.markerIcon}.svg`,
          iconSize: [25, 25],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        })}
      >
        <Popup>
          <div>
            <h3>{marker.indicatorNameEn}</h3>
            <p>{marker.descriptionEn}</p>
            {marker.info && <p>{marker.info}</p>}
            {marker.sourceUrl && (
              <a href={marker.sourceUrl} target="_blank" rel="noopener noreferrer">
                Learn more
              </a>
            )}
          </div>
        </Popup>
      </Marker>
    ));
  }, [markerData, selectedIndicator?.indicatorType]);

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
        key={`geojson-${selectedIndicator?.id}`}
        data={municipalityBoundaries}
        style={getStyle}
        onEachFeature={onEachFeature}
      />
      {markerElements}
      {children}
    </MapContainer>
  );
} 