import { useRef } from 'react';
import L from 'leaflet';
import type { Layer } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry, FeatureCollection } from 'geojson';
import { LayerGroup, GeoJSON } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import { naturaAreas } from './data/natura-areas';
import { Indicator, SPECIAL_INDICATORS } from '@repo/ui/types/indicators';
import { createRoot } from 'react-dom/client';
import { DraggablePopup } from './DraggablePopup';
import { Typography } from '@mui/material';
import styled from '@emotion/styled';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';

const typedNaturaAreas = naturaAreas as FeatureCollection;

if (process.env.NODE_ENV === 'development') {
  console.log('Natura areas stats:', {
    areas: typedNaturaAreas.features.length,
    size: `${(JSON.stringify(typedNaturaAreas).length / 1024).toFixed(1)}KB`
  });
}

const PopupContainer = styled.div(({ theme }) => `
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(0.4)};
  padding: ${theme.spacing(1.5)};
  border-radius: ${theme.shape.borderRadius}px;
  min-width: 220px;

  @media (max-width: 600px) {
    min-width: 160px;
  }
`);

interface NaturaLayerProps {
  selectedIndicator?: Indicator | null;
  pinnedIndicator?: Indicator | null;
}

// Add type definition for the colors
type NaturaAreaType = 'SAC' | 'SAC/SPA';

const NATURA_COLORS: Record<NaturaAreaType, {
  fillColor: string;
  color: string;
  fillOpacity: number;
}> = {
  SAC: {
    fillColor: '#00ff00',
    color: '#006400',
    fillOpacity: 0.3,
  },
  'SAC/SPA': {
    fillColor: '#5992B6',
    color: '#325971',
    fillOpacity: 0.3,
  }
};

export const NaturaLayer = ({ selectedIndicator, pinnedIndicator }: NaturaLayerProps) => {
  const map = useMap();
  const popupRefs = useRef<(L.Popup | null)[]>([]);
  const dragRefs = useRef<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>([]);

  const isVisible = selectedIndicator?.id === SPECIAL_INDICATORS.NATURA_2000 ||
    pinnedIndicator?.id === SPECIAL_INDICATORS.NATURA_2000;

  if (!isVisible) return null;

  const getStyleForFeature = (feature: Feature<Geometry, GeoJsonProperties>) => {
    const areaType = feature.properties?.aluetyyppi || 'SAC';
    return {
      ...NATURA_COLORS[areaType as keyof typeof NATURA_COLORS],
      weight: 2,
      opacity: 1,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    if (feature.properties) {
      // Apply initial style
      const initialStyle = getStyleForFeature(feature);
      (layer as L.Path).setStyle(initialStyle);

      const popup = L.popup({
        closeButton: true,
        closeOnClick: false,
        autoClose: false,
        className: 'draggable-popup municipality-popup',
        autoPan: false,
        offset: L.point(-100, 0),
      });

      layer.bindPopup(popup);

      // Add click handler to the popup container to bring it to front
      popup.on('add', (e) => {
        const popupElement = e.target.getElement();
        if (popupElement) {
          popupElement.addEventListener('mousedown', () => {
            const allPopups = document.querySelectorAll('.leaflet-popup');
            allPopups.forEach(p => {
              (p as HTMLElement).style.zIndex = '600';
            });
            popupElement.style.zIndex = '650';
          });
        }
      });

      layer.on('click', (e) => {
        const index = feature.properties?.id || 0;
        const geoJSONLayer = layer as L.Polygon;  // Cast to Polygon type
        const center = geoJSONLayer.getBounds().getCenter();
        layer.openPopup(center);

        // Ensure we have space in our refs arrays
        while (popupRefs.current.length <= index) {
          popupRefs.current.push(null);
          dragRefs.current.push({
            isDragging: false,
            startPos: null,
            initialLatLng: null
          });
        }

        const container = document.createElement('div');
        const root = createRoot(container);

        root.render(
          <ThemeProvider theme={theme}>
            <DraggablePopup
              index={index}
              popupRefs={popupRefs}
              dragRefs={dragRefs}
              map={map}
            >
              <PopupContainer>
                <Typography variant="label" color="primary.dark">
                  {feature.properties?.nimisuomi}
                </Typography>
                <Typography variant="paragraph" color="text.secondary">{feature.properties?.aluetyyppi}</Typography>
                {feature.properties?.luontotyyppikoodi && (
                  <Typography variant="label" color="text.secondary">
                    {feature.properties.luontotyyppikoodi}
                  </Typography>
                )}
                {feature.properties?.area_m2 && (
                  <Typography variant="paragraph" color="text.secondary">
                    {(feature.properties.area_m2 / 1000000).toFixed(1)} km²
                  </Typography>
                )}
              </PopupContainer>
            </DraggablePopup>
          </ThemeProvider>
        );

        popup.setContent(container);
        popupRefs.current[index] = popup;
        layer.openPopup();
      });

      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          const areaType = feature.properties?.aluetyyppi || 'SAC';
          const colors = NATURA_COLORS[areaType as keyof typeof NATURA_COLORS];
          layer.setStyle({
            ...colors,
            fillOpacity: 0.6,
            weight: 3,
          });
        },
        mouseout: (e) => {
          const layer = e.target;
          const style = getStyleForFeature(feature);
          layer.setStyle(style);
        },
      });
    }
  };

  return (
    <LayerGroup>
      <GeoJSON
        key={`natura-${selectedIndicator?.id || ''}-${pinnedIndicator?.id || ''}`}
        data={typedNaturaAreas}
        style={(feature?: Feature<Geometry, GeoJsonProperties>) => {
          if (!feature) return {};
          return {
            ...getStyleForFeature(feature),
            pane: 'naturaPane',
            className: 'natura-feature'
          };
        }}
        interactive={true}
        onEachFeature={onEachFeature}
      />
    </LayerGroup>
  );
}; 