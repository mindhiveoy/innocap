'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { municipalityBoundaries } from './data/municipality-boundaries';
import type { IndicatorData, Indicator } from '@repo/ui/types/indicators';
import { calculateOpacity, type Unit } from '../../types/units';
import { MunicipalityTooltip } from './MunicipalityTooltip';
import 'leaflet/dist/leaflet.css';
import './leafletMap.css';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';

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
  indicatorData,
  selectedIndicator
}: LeafletMapProps) {
  const getFeatureData = (feature: any) => {
    if (!selectedIndicator || !indicatorData) return null;

    const selectedIndicatorData = indicatorData.filter(
      d => d.id === selectedIndicator.id
    );

    return selectedIndicatorData.find(
      d => d.municipalityCode === feature.properties.kunta
    );
  };

  const getStyle = (feature: any) => {
    const municipalityData = getFeatureData(feature);
    
    if (!municipalityData || !selectedIndicator || !indicatorData) {
      return geoJSONStyle;
    }

    const selectedIndicatorData = indicatorData.filter(
      d => d.id === selectedIndicator.id
    );
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

  const onEachFeature = (feature: any, layer: L.Layer) => {
    // Create tooltip content using React
    const getTooltipContent = () => {
      const municipalityData = getFeatureData(feature);
      
      // Create a container for React rendering
      const container = document.createElement('div');
      
      // Render React component to container
      const root = createRoot(container);
      root.render(
        <ThemeProvider theme={theme}>
          <MunicipalityTooltip 
            name={feature.properties.name}
            data={municipalityData || undefined}
          />
        </ThemeProvider>
      );

      return container;
    };

    // Add tooltip to the layer
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
          weight: 3,
          color: '#666',
          dashArray: ''
        });
        
        layer.bringToFront();

        // Update tooltip content
        tooltip.setContent(getTooltipContent());
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getStyle(feature));
      }
    });
  };

  const key = `geojson-${selectedIndicator?.id}-${JSON.stringify(indicatorData)}`;

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
        key={key}
        data={municipalityBoundaries}
        style={getStyle}
        onEachFeature={onEachFeature}
      />
      {children}
    </MapContainer>
  );
} 