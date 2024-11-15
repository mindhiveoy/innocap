'use client';

import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { useRef } from 'react';
import { municipalityBoundaries } from './data/municipality-boundaries';
import { Indicator, MunicipalityLevelData, MarkerData, IndicatorType, BarChartData } from '@repo/ui/types/indicators';
import { calculateOpacity, Unit } from '../../types/units';
import { MunicipalityTooltip } from './MunicipalityTooltip';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';
import { useMemo, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import './leafletMap.css';
import styled from '@emotion/styled';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Typography } from '@mui/material';
import { BarChartPopup } from './BarChartPopup';
import { getMunicipalityCenter } from './data/municipality-centers';
import PushPinIcon from '@mui/icons-material/PushPin';

interface LeafletMapProps {
  center: LatLngTuple;
  zoom: number;
  children?: React.ReactNode;
  maxBounds?: LatLngBoundsExpression;
  minZoom?: number;
  maxZoom?: number;
  municipalityData?: MunicipalityLevelData[];
  markerData?: MarkerData[];
  barChartData?: BarChartData[];
  selectedIndicator?: Indicator | null;
  onMapMount?: (map: L.Map) => void;
  isPinned?: boolean;
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

const IndicatorOverlay = styled.div(({ theme }) => `
  position: absolute;
  top: 20px;
  right: 2%;
  background-color: rgba(255, 255, 255, 0.9);
  padding: ${theme.spacing(1)} ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius}px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
  pointer-events: none;
  max-width: 80%;
  text-align: center;
  display: flex;
  align-items: center;
  gap: ${theme.spacing(1)};
  
  .pin-icon {
    position: relative;
    top: 3px;
    transform: rotate(-45deg);
    color: ${theme.palette.primary.main};
  }
  
  @media (max-width: 600px) {
    font-size: 12px;
    padding: ${theme.spacing(0.5)} ${theme.spacing(1)};
  }
`);

function DraggablePopupContent({
  data,
  index,
  popupRefs,
  dragRefs,
  color,
}: {
  data: BarChartData;
  index: number;
  popupRefs: React.MutableRefObject<(L.Popup | null)[]>;
  dragRefs: React.MutableRefObject<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>;
  color?: string;
}) {
  const map = useMap();
  const dragAreaRef = useRef<HTMLDivElement>(null);

  const handlePopupMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    const popup = popupRefs.current[index];
    if (!popup) return;

    dragRefs.current[index] = {
      isDragging: true,
      startPos: map.mouseEventToContainerPoint({
        clientX: e.clientX,
        clientY: e.clientY
      } as MouseEvent),
      initialLatLng: popup.getLatLng() ?? null
    };

    // Add dragging class to the entire popup
    popup.getElement()?.classList.add('is-dragging');
    map.dragging.disable();

    // Capture mouse events
    document.addEventListener('mousemove', handlePopupMouseMove);
    document.addEventListener('mouseup', handlePopupMouseUp);
  }, [map, index, popupRefs, dragRefs]);

  const handlePopupMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const popup = popupRefs.current[index];
    const dragRef = dragRefs.current[index];
    if (!popup || !dragRef?.isDragging || !dragRef.startPos || !dragRef.initialLatLng) return;

    const currentPoint = map.mouseEventToContainerPoint({
      clientX: e.clientX,
      clientY: e.clientY
    } as MouseEvent);

    const offset = currentPoint.subtract(dragRef.startPos);
    const initialPoint = map.latLngToContainerPoint(dragRef.initialLatLng);
    const newPoint = initialPoint.add(offset);
    const newLatLng = map.containerPointToLatLng(newPoint);

    popup.setLatLng(newLatLng);
  }, [map, index, popupRefs, dragRefs]);

  const handlePopupMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const popup = popupRefs.current[index];
    if (!popup) return;

    if (dragRefs.current[index]) {
      dragRefs.current[index].isDragging = false;
      dragRefs.current[index].startPos = null;
    }

    popup.getElement()?.classList.remove('is-dragging');
    map.dragging.enable();

    // Remove event listeners
    document.removeEventListener('mousemove', handlePopupMouseMove);
    document.removeEventListener('mouseup', handlePopupMouseUp);
  }, [map, index, popupRefs, dragRefs]);

  return (
    <div
      ref={dragAreaRef}
      onMouseDown={handlePopupMouseDown}
      style={{
        cursor: 'move',
        userSelect: 'none',
        width: '100%',
        height: '100%'
      }}
    >
      <BarChartPopup data={data} color={color} />
    </div>
  );
}

export function LeafletMap({
  center,
  zoom,
  children,
  maxBounds,
  minZoom,
  maxZoom,
  municipalityData = [],
  markerData = [],
  barChartData = [],
  selectedIndicator,
  onMapMount,
  isPinned = false,
}: LeafletMapProps) {
  const filteredMarkerData = useMemo(() => {
    if (!selectedIndicator || !markerData) return [];
    return markerData.filter(marker => marker.id === selectedIndicator.id);
  }, [selectedIndicator?.id, markerData]);

  const getFeatureData = useCallback((feature: any) => {
    if (!selectedIndicator || !municipalityData) return null;
    return municipalityData
      .filter(d => d.id === selectedIndicator.id)
      .find(d => d.municipalityCode === feature.properties.kunta);
  }, [selectedIndicator, municipalityData]);

  const geoJsonStyle = useMemo(() => {
    return (feature: any) => {
      const featureData = getFeatureData(feature);

      if (featureData && selectedIndicator?.indicatorType === IndicatorType.MunicipalityLevel) {
        const allValues = municipalityData
          .filter(d => d.id === selectedIndicator.id)
          .map(d => d.value);

        return {
          fillColor: selectedIndicator.color,
          weight: 1,
          opacity: 0.7,
          color: '#444',
          fillOpacity: calculateOpacity(
            featureData.value,
            allValues,
            featureData.unit as Unit
          ),
          pane: 'overlayPane',
          className: 'geojson-feature'
        };
      }

      return {
        ...geoJSONStyle,
        pane: 'overlayPane',
        className: 'geojson-feature'
      };
    };
  }, [selectedIndicator, municipalityData, getFeatureData]);

  const handleMouseover = useCallback((e: L.LeafletEvent, feature: any, tooltip: L.Tooltip, currentStyle: any) => {
    const layer = e.target;
    layer.setStyle({
      ...currentStyle,
      weight: 2,
      color: '#666',
    });
    layer.bringToFront();

    const container = document.createElement('div');
    const root = createRoot(container);

    const tooltipData = getFeatureData(feature);

    root.render(
      <ThemeProvider theme={theme}>
        <MunicipalityTooltip
          name={feature.properties.name}
          data={tooltipData || undefined}
          color={selectedIndicator?.color}
          opacity={currentStyle.fillOpacity}
        />
      </ThemeProvider>
    );
    tooltip.setContent(container);
  }, [selectedIndicator?.color, getFeatureData]);

  const handleMouseout = useCallback((e: L.LeafletEvent, feature: any) => {
    const layer = e.target;
    layer.setStyle(geoJsonStyle(feature));
  }, [geoJsonStyle]);

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
            mouseover: (e) => handleMouseover(e, feature, tooltip, geoJsonStyle(feature)),
            mouseout: (e) => handleMouseout(e, feature)
          });
        }
      }
    };
  }, [selectedIndicator?.indicatorType, getFeatureData, handleMouseover, handleMouseout, geoJsonStyle]);

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
                  <PopupDescription variant='label'>{marker.descriptionEn}</PopupDescription>
                  {marker.info && <PopupDescription variant='paragraph'>{marker.info}</PopupDescription>}
                  {marker.sourceUrl && (
                    <PopupLink href={marker.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Source <OpenInNewIcon fontSize='small' />
                    </PopupLink>
                  )}
                </PopupContent>
              </PopupContainer>
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    );
  }, [filteredMarkerData, selectedIndicator?.indicatorType]);

  // Create refs for popups
  const popupRefs = useRef<(L.Popup | null)[]>([]);
  const dragRefs = useRef<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>([]);

  const barChartElements = useMemo(() => {
    if (selectedIndicator?.indicatorType !== IndicatorType.BarChart || !barChartData) {
      return null;
    }

    const filteredBarChartData = barChartData.filter(
      d => d.id === selectedIndicator.id
    );

    if (popupRefs.current.length !== filteredBarChartData.length) {
      popupRefs.current = new Array(filteredBarChartData.length).fill(null);
      dragRefs.current = new Array(filteredBarChartData.length).fill({
        isDragging: false,
        startPos: null,
        initialLatLng: null
      });
    }

    return (
      <LayerGroup>
        {filteredBarChartData.map((data, index) => (
          <Marker
            key={`${data.id}-${data.municipalityName}-${index}`}
            position={getMunicipalityCenter(data.municipalityCode)}
            icon={defaultIcon}
          >
            <Popup
              ref={popup => {
                popupRefs.current[index] = popup;
              }}
              closeButton={true}
              closeOnClick={false}
              autoClose={false}
              className="draggable-popup"
              autoPan={false}
            >
              <DraggablePopupContent
                data={data}
                index={index}
                popupRefs={popupRefs}
                dragRefs={dragRefs}
                color={selectedIndicator.color}
              />
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    );
  }, [selectedIndicator, barChartData]);

  // Memoize map container props
  const mapContainerProps = useMemo(() => ({
    center,
    zoom,
    style: { height: "100%" },
    maxBounds,
    maxBoundsViscosity: 1,
    minZoom,
    maxZoom,
    inertia: false,
    zoomControl: true,
    zoomSnap: 0.5,
    zoomDelta: 1,
  }), [center, zoom, maxBounds, minZoom, maxZoom]);

  return (
    <>
      {selectedIndicator && (
        <IndicatorOverlay>
          {isPinned && (
            <span className="pin-icon">
              <PushPinIcon fontSize="small" />
            </span>
          )}
          <Typography variant='label'>{selectedIndicator.indicatorNameEn}</Typography>
        </IndicatorOverlay>
      )}
      <MapContainer
        attributionControl={false}
        {...mapContainerProps}
        ref={map => {
          if (map && onMapMount) {
            onMapMount(map);
          }
        }}
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
          interactive={selectedIndicator?.indicatorType === IndicatorType.MunicipalityLevel}
          bubblingMouseEvents={false}
        />
        {markerElements}
        {barChartElements}
        {children}
      </MapContainer>
    </>
  );
} 