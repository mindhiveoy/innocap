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
import styled from '@emotion/styled';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Typography } from '@mui/material';

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

const PopupContainer = styled.div(({
  theme
}) => ` background-color: #fff;
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(2)};
    padding: ${theme.spacing(1.5)};
    border-radius: ${theme.shape.borderRadius}px;
    min-width: 280px;
`);

const PopupContent = styled.div(({
  theme
}) => ` 
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
`);

const PopupDescription = styled(Typography)(({
  theme
}) => ` 
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  color: ${theme.palette.grey[600]};
  margin: 0;
`);

const PopupLink = styled.a(({
  theme
}) => ` 
  display: flex;
  align-items: center;
  gap: ${theme.spacing(0.5)};
  color: ${theme.palette.primary.main};
  text-decoration: none;
  font-size: 14px;
  margin-top: ${theme.spacing(1)};

  &:hover {
    text-decoration: underline;
  }

  svg {
    font-size: 1rem;
  }

`);

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

  const filteredMarkerData = useMemo(() => {
    if (!selectedIndicator || !markerData) return [];
    return markerData.filter(marker => marker.id === selectedIndicator.id);
  }, [selectedIndicator?.id, markerData]);

  const getFeatureData = (feature: any) => {
    if (!selectedIndicator || !municipalityData) return null;
    return municipalityData
      .filter(d => d.id === selectedIndicator.id)
      .find(d => d.municipalityCode === feature.properties.kunta);
  };

  const geoJsonStyle = useMemo(() => {
    return (feature: any) => {
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
  }, [selectedIndicator, municipalityData]);

  const onEachFeatureCallback = useMemo(() => {
    return (feature: any, layer: L.Layer) => {
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
              const currentStyle = geoJsonStyle(feature);
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
              layer.setStyle(geoJsonStyle(feature));
            }
          });
        }
      }
    };
  }, [selectedIndicator, municipalityData, geoJsonStyle]);

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
            icon={defaultIcon}>
            <Popup>
              <PopupContainer>
                <PopupContent>
                  <PopupDescription variant='label'> {marker.descriptionEn}</PopupDescription>
                  {marker.info && <PopupDescription variant='paragraph'>{marker.info}</PopupDescription>}
                  {marker.sourceUrl &&
                    <PopupLink href={marker.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"> Source <OpenInNewIcon fontSize='small'/>
                    </PopupLink> }
                </PopupContent>
              </PopupContainer>
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
      style={{ height: "100vh" }}
      maxBounds={maxBounds}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBoundsViscosity={1.0}
      zoomControl={true}
      zoomSnap={0.25}
      zoomDelta={1}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        className="grayscale-tiles"
      />
      <GeoJSON 
        key={`geojson-${selectedIndicator?.id || 'base'}`}
        data={municipalityBoundaries}
        style={geoJsonStyle}
        onEachFeature={onEachFeatureCallback}
      />
      {markerElements}
      {children}
    </MapContainer>
  );
} 