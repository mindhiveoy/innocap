'use client';

import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayerGroup } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { useRef, useCallback, useMemo } from 'react';
import { municipalityBoundaries } from './data/municipality-boundaries';
import { Indicator, MunicipalityLevelData, MarkerData, IndicatorType, BarChartData } from '@repo/ui/types/indicators';
import { calculateOpacity, Unit } from '../../types/units';
import { MunicipalityTooltip } from './MunicipalityTooltip';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';
import 'leaflet/dist/leaflet.css';
import './leafletMap.css';
import styled from '@emotion/styled';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Typography, Box } from '@mui/material';
import { BarChartPopup } from './BarChartPopup';
import { getMunicipalityCenter } from './data/municipality-centers';
import PushPinIcon from '@mui/icons-material/PushPin';
import { createMarkerIcon } from './DynamicIcon';
import { DraggablePopup } from './DraggablePopup';
import { NaturaLayer } from './NaturaLayer';

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
  isPinned?: boolean;
  zoomControl?: boolean;
  onMapMount?: (map: L.Map) => void;
  pinnedIndicator?: Indicator | null;
  showNaturaAreas?: boolean;
}

const geoJSONStyle = {
  fillColor: 'transparent',
  weight: 1,
  opacity: 0.7,
  color: '#444',
  fillOpacity: 0,
};

const PopupContainer = styled.div(({
  theme
}) => ` background-color: #fff;
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(2)};
    padding: ${theme.spacing(4, 3, 3, 3)};
    border-radius: ${theme.shape.borderRadius}px;
    min-width: 310px;
`);

const PopupContent = styled.div(({
  theme
}) => ` 
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  max-width: 85%;
`);

const PhaseText = styled(Typography)(({
  theme
}) => ` 
  color: ${theme.palette.primary.darkest};
`);

const PopupTitle = styled(Typography)(({
  theme
}) => ` 
  color: ${theme.palette.primary.darkest};
`);

const PopupDescription = styled(Typography)(({
  theme
}) => ` 
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  color: #7B7B7B;
  margin: 0;
`);

const PopupLink = styled.a(({
  theme
}) => ` 
  display: flex;
  align-items: center;
  gap: ${theme.spacing(0.6)};
  color: ${theme.palette.primary.main};
  text-decoration: none;
  font-size: 14px;
  margin-top: ${theme.spacing(1)};

  &:hover {
    text-decoration: underline;
  }

  svg {
    font-size: 1rem;
    margin-top: -1px;
  }

`);

const OverlaysContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 2%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  z-index: 1000;
`;

const BaseOverlay = styled.div(({ theme }) => `
  background-color: rgba(255, 255, 255, 0.9);
  padding: ${theme.spacing(1)} ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius}px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  pointer-events: none;
  max-width: fit-content;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing(1)};
  
  @media (max-width: 600px) {
    font-size: 12px;
    padding: ${theme.spacing(0.5)} ${theme.spacing(1)};
  }
`);

const PinnedOverlay = styled(BaseOverlay)`
  .pin-icon {
    position: relative;
    top: 3px;
    transform: rotate(-45deg);
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const SelectedOverlay = styled(BaseOverlay)``;

const YearText = styled(Typography)(({ theme }) => `
  color: ${theme.palette.text.primary};
  margin-left: ${theme.spacing(1)};
`);

// Add a static style for base borders
const baseStyle = {
  fillColor: 'transparent',
  weight: 1,
  opacity: 0.7,
  color: '#444',
  fillOpacity: 0,
  pane: 'overlayPane',
  className: 'geojson-feature'
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
  barChartData = [],
  selectedIndicator,
  isPinned = false,
  zoomControl = true,
  onMapMount,
  pinnedIndicator,
  showNaturaAreas = false,
}: LeafletMapProps) {

  const popupRefs = useRef<(L.Popup | null)[]>([]);
  const dragRefs = useRef<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  const filteredMarkerData = useMemo(() => {
    if (!markerData) return [];

    const relevantMarkers = [];

    // If we have a pinned marker indicator
    if (pinnedIndicator?.indicatorType === IndicatorType.Marker) {
      const pinnedMarkers = markerData
        .filter(marker => marker.id === pinnedIndicator.id)
        .map(marker => ({
          ...marker,
          iconName: pinnedIndicator.iconName,
          color: pinnedIndicator.color
        }));
      relevantMarkers.push(...pinnedMarkers);
    }

    // If we have a selected marker indicator (different from pinned)
    if (selectedIndicator?.indicatorType === IndicatorType.Marker &&
      selectedIndicator.id !== pinnedIndicator?.id) {
      const selectedMarkers = markerData
        .filter(marker => marker.id === selectedIndicator.id)
        .map(marker => ({
          ...marker,
          iconName: selectedIndicator.iconName,
          color: selectedIndicator.color
        }));
      relevantMarkers.push(...selectedMarkers);
    }

    return relevantMarkers;
  }, [selectedIndicator, pinnedIndicator, markerData]);

  const activeIndicator = useMemo(() => {
    const isPinnedIndicator = pinnedIndicator?.indicatorType === IndicatorType.MunicipalityLevel;
    return isPinnedIndicator
      ? pinnedIndicator
      : selectedIndicator?.indicatorType === IndicatorType.MunicipalityLevel
        ? selectedIndicator
        : null;
  }, [pinnedIndicator, selectedIndicator]);


  const geoJsonStyle = useMemo(() => {
    return (feature: any) => {
      if (!activeIndicator) return geoJSONStyle;

      const featureData = municipalityData
        .filter(d => d.id === activeIndicator.id)
        .filter(d => !activeIndicator.selectedYear || d.year === activeIndicator.selectedYear)
        .find(d => d.municipalityCode === feature.properties.kunta);

      if (featureData) {
        const allValues = municipalityData
          .filter(d => d.id === activeIndicator.id)
          .map(d => d.value);

        return {
          fillColor: activeIndicator.color,
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
  }, [activeIndicator, municipalityData]);

  const onEachFeatureCallback = useMemo(() => {
    return (feature: any, layer: L.Layer) => {
      if (!activeIndicator) return;

      const popup = L.popup({
        closeButton: true,
        closeOnClick: false,
        autoClose: false,
        className: 'draggable-popup municipality-popup',
        autoPan: false,
        offset: L.point(-150, 0),
      });

      layer.bindPopup(popup);

      // Add click handler to the popup container to bring it to front
      popup.on('add', (e) => {
        const popupElement = e.target.getElement();
        if (popupElement) {
          popupElement.addEventListener('mousedown', () => {
            // Find all popups and set their z-index lower
            const allPopups = document.querySelectorAll('.leaflet-popup');
            allPopups.forEach(p => {
              (p as HTMLElement).style.zIndex = '600';
            });
            // Set clicked popup's z-index higher
            popupElement.style.zIndex = '650';
          });
        }
      });

      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          const style = geoJsonStyle(feature);
          layer.setStyle({
            ...style,
            weight: 2,
            color: '#666',
          });
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          // Use the same activeIndicator for styling
          layer.setStyle(geoJsonStyle(feature));
        },
        click: (e) => {
          const layer = e.target;
          const tooltipData = municipalityData
            .filter(d => d.id === activeIndicator.id)
            .filter(d => !activeIndicator.selectedYear || d.year === activeIndicator.selectedYear)
            .find(d => d.municipalityCode === feature.properties.kunta);

          const container = document.createElement('div');
          const root = createRoot(container);

          // Get or create an index for this municipality
          const index = feature.properties.kunta;

          // Ensure we have space in our refs arrays
          while (popupRefs.current.length <= index) {
            popupRefs.current.push(null);
            dragRefs.current.push({
              isDragging: false,
              startPos: null,
              initialLatLng: null
            });
          }

          root.render(
            <ThemeProvider theme={theme}>
              <MunicipalityTooltip
                name={feature.properties.name}
                data={tooltipData || undefined}
                color={activeIndicator?.color}
                opacity={geoJsonStyle(feature).fillOpacity}
                index={index}
                popupRefs={popupRefs}
                dragRefs={dragRefs}
                map={mapRef.current!}
              />
            </ThemeProvider>
          );

          popup.setContent(container);
          // Store the popup reference
          popupRefs.current[index] = popup;
          layer.openPopup();
        }
      });
    };
  }, [activeIndicator, municipalityData, geoJsonStyle]);

  const markerElements = useMemo(() => {
    if (!filteredMarkerData.length) {
      return null;
    }

    return (
      <LayerGroup>
        {filteredMarkerData.map((marker, i) => {
          const index = `marker-${i}`;

          while (popupRefs.current.length <= i) {
            popupRefs.current.push(null);
            dragRefs.current.push({
              isDragging: false,
              startPos: null,
              initialLatLng: null
            });
          }

          return (
            <Marker
              key={`${marker.id}-${marker.municipalityName}-${marker.location.join(',')}-${i}`}
              position={marker.location}
              icon={createMarkerIcon(marker.markerIcon, marker.color)}
            >
              <Popup
                ref={popup => {
                  popupRefs.current[i] = popup;
                }}
                closeButton={true}
                closeOnClick={false}
                autoClose={false}
                className="draggable-popup"
                autoPan={false}
              >
                <DraggablePopup
                  index={i}
                  popupRefs={popupRefs}
                  dragRefs={dragRefs}
                  map={mapRef.current!}
                >
                  <PopupContainer>
                    <PopupContent>
                      <PhaseText variant='paragraph'>{marker.phase}</PhaseText>
                      <PopupTitle variant='label'>{marker.descriptionEn}</PopupTitle>
                      <Box display='flex' gap={2}>
                        {marker.year &&
                          <Typography variant='paragraph'>{marker.year}</Typography>}
                        {marker.value !== null &&
                          <Box display='flex' gap={0.3}>
                            <Typography variant='paragraph'>{marker.value}</Typography>
                            <Typography variant='paragraph'>{marker.unit}</Typography>
                          </Box>}
                      </Box>
                      {marker.info &&
                        <PopupDescription variant='paragraph'>{marker.info}</PopupDescription>}
                      <Typography variant='paragraph'>{marker.municipalityName}</Typography>
                      {marker.sourceUrl && (
                        <PopupLink href={marker.sourceUrl} target="_blank" rel="noopener noreferrer">
                          Source <OpenInNewIcon fontSize='small' />
                        </PopupLink>
                      )}
                    </PopupContent>
                  </PopupContainer>
                </DraggablePopup>
              </Popup>
            </Marker>
          );
        })}
      </LayerGroup>
    );
  }, [filteredMarkerData]);

  const barChartElements = useMemo(() => {
    if (!barChartData || !mapRef.current) return null;

    const relevantBarChartData = [];

    // If we have a pinned bar chart indicator
    if (pinnedIndicator?.indicatorType === IndicatorType.BarChart) {
      const pinnedData = barChartData
        .filter(d => d.id === pinnedIndicator.id)
        .filter(d => !pinnedIndicator.selectedYear || d.year === pinnedIndicator.selectedYear)
        .map((d, idx) => ({
          ...d,
          iconName: pinnedIndicator.iconName,
          color: pinnedIndicator.color,
          isPinned: true,
          index: idx
        }));
      relevantBarChartData.push(...pinnedData);
    }

    // If we have a selected bar chart indicator (different from pinned)
    if (selectedIndicator?.indicatorType === IndicatorType.BarChart &&
      selectedIndicator.id !== pinnedIndicator?.id) {
      const selectedData = barChartData
        .filter(d => d.id === selectedIndicator.id)
        .filter(d => !selectedIndicator.selectedYear || d.year === selectedIndicator.selectedYear)
        .map((d, idx) => ({
          ...d,
          iconName: selectedIndicator.iconName,
          color: selectedIndicator.color,
          isPinned: false,
          index: relevantBarChartData.length + idx
        }));
      relevantBarChartData.push(...selectedData);
    }

    if (relevantBarChartData.length === 0) return null;

    // Ensure we have enough space in our refs arrays
    while (popupRefs.current.length < relevantBarChartData.length) {
      popupRefs.current.push(null);
      dragRefs.current.push({
        isDragging: false,
        startPos: null,
        initialLatLng: null
      });
    }

    return (
      <LayerGroup>
        {relevantBarChartData.map((data) => {
          const center = getMunicipalityCenter(data.municipalityCode);
          // Offset the selected indicators (non-pinned)
          const position: LatLngTuple = data.isPinned
            ? center
            : [
              center[0] - 0.03,
              center[1] - 0.01
            ];

          return (
            <Marker
              key={`${data.id}-${data.municipalityName}-${data.index}`}
              position={position}
              icon={createMarkerIcon(data.iconName, data.color)}
            >
              <Popup
                ref={popup => {
                  popupRefs.current[data.index] = popup;
                }}
                closeButton={true}
                closeOnClick={false}
                autoClose={false}
                className="draggable-popup"
                autoPan={false}
              >
                <BarChartPopup
                  data={data}
                  color={data.color}
                  index={data.index}
                  popupRefs={popupRefs}
                  dragRefs={dragRefs}
                  map={mapRef.current!}
                />
              </Popup>
            </Marker>
          );
        })}
      </LayerGroup>
    );
  }, [selectedIndicator, pinnedIndicator, barChartData, mapRef.current]);

  const mapContainerProps = useMemo(() => ({
    center,
    zoom,
    style: { height: "100%" },
    maxBounds,
    maxBoundsViscosity: 1,
    minZoom,
    maxZoom,
    inertia: false,
    zoomControl,
    zoomSnap: 0.5,
    zoomDelta: 1,
  }), [center, zoom, maxBounds, minZoom, maxZoom, zoomControl]);

  const handleMapMount = useCallback((map: L.Map) => {
    mapRef.current = map;
    if (onMapMount) {
      onMapMount(map);
    }
  }, [onMapMount]);

  return (
    <>
      <OverlaysContainer>
        {pinnedIndicator && (
          <PinnedOverlay>
            <span className="pin-icon">
              <PushPinIcon fontSize="small" />
            </span>
            <Typography variant='label'>
              {pinnedIndicator.indicatorNameEn}
              {pinnedIndicator.selectedYear && (
                <YearText variant='label'>
                  ({pinnedIndicator.selectedYear})
                </YearText>
              )}
            </Typography>
          </PinnedOverlay>
        )}
        {selectedIndicator && selectedIndicator.id !== pinnedIndicator?.id && (
          <SelectedOverlay>
            <Typography variant='label'>
              {selectedIndicator.indicatorNameEn}
              {selectedIndicator.selectedYear && (
                <YearText variant='label'>
                  ({selectedIndicator.selectedYear})
                </YearText>
              )}
            </Typography>
          </SelectedOverlay>
        )}
      </OverlaysContainer>
      <MapContainer
        attributionControl={false}
        {...mapContainerProps}
        ref={handleMapMount}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          className="grayscale-tiles"
        />
        {/* Static base layer for borders */}
        <GeoJSON
          key="geojson-base"
          data={municipalityBoundaries}
          style={baseStyle}
          interactive={false}
        />

        <NaturaLayer
          key="natura-layer"
          selectedIndicator={selectedIndicator}
          pinnedIndicator={pinnedIndicator}
        />

        {/* Choropleth layer only rendered when we have data */}
        {activeIndicator && (
          <GeoJSON
            key={`geojson-${selectedIndicator?.id || ''}-${pinnedIndicator?.id || ''}-${pinnedIndicator?.selectedYear || ''}-${isPinned}`}
            data={municipalityBoundaries}
            style={geoJsonStyle}
            onEachFeature={onEachFeatureCallback}
            interactive={true}
            bubblingMouseEvents={false}
          />
        )}
        {markerElements}
        {barChartElements}
        {children}
      </MapContainer>
    </>
  );
}