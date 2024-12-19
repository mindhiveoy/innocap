import { useRef } from 'react';
import L from 'leaflet';
import type { Layer } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry, FeatureCollection } from 'geojson';
import { LayerGroup, GeoJSON } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import { luomupellot } from './data/luomupellot';
import { Indicator, IndicatorType, SPECIAL_INDICATORS } from '@repo/ui/types/indicators';
import { createRoot } from 'react-dom/client';
import { DraggablePopup } from './DraggablePopup';
import { Typography, Box } from '@mui/material';
import styled from '@emotion/styled';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@repo/shared';
import { useLanguage, type Language } from '@repo/shared';

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

interface LuomupellotLayerProps {
  selectedIndicator?: Indicator | null;
  pinnedIndicator?: Indicator | null;
}

const LUOMUPELLOT_STYLE = {
  fillColor: '#A7C63A',
  color: '#6B8325',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.3,
};

const translations = {
  fi: {
    organicField: 'Luomupelto',
    area: 'Pinta-ala',
    year: 'Vuosi'
  },
  en: {
    organicField: 'Organic field',
    area: 'Area',
    year: 'Year'
  }
} as const;

type TranslationsType = typeof translations;
type TranslationKeys = keyof TranslationsType;

export const LuomupellotLayer = ({ selectedIndicator, pinnedIndicator }: LuomupellotLayerProps) => {
  const map = useMap();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage as TranslationKeys];
  const popupRefs = useRef<(L.Popup | null)[]>([]);
  const dragRefs = useRef<{ isDragging: boolean; startPos: L.Point | null; initialLatLng: L.LatLng | null }[]>([]);
  const zoom = map.getZoom();
  
  const getStyle = (feature: Feature<Geometry, GeoJsonProperties> | undefined) => {
    if (!feature) return LUOMUPELLOT_STYLE;
  
    return {
      ...LUOMUPELLOT_STYLE,
      fillOpacity: 0.3,
      className: 'luomupelto-feature'
    };
  };

  const isVisible = selectedIndicator?.id === SPECIAL_INDICATORS.ORGANIC_FARMING ||
    pinnedIndicator?.id === SPECIAL_INDICATORS.ORGANIC_FARMING;

  if (!isVisible) return null;

  const onEachFeature = (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    
    if (feature.properties) {
      const popup = L.popup({
        closeButton: true,
        closeOnClick: false,
        autoClose: false,
        className: 'draggable-popup',
        autoPan: false,
      });

      layer.bindPopup(popup);
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

      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            ...LUOMUPELLOT_STYLE,
            fillOpacity: 0.8,
            weight: 2,
          });
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(getStyle(feature));
        },
        click: (e) => {
          const index = feature.properties?.fid || 0;

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
                    {t.organicField} <br/> {feature.properties?.PERUSLOHKOTUNNUS}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
                    <Typography variant="paragraph">
                      {t.area}: {feature.properties?.PINTA_ALA} ha
                    </Typography>
                    <Typography variant="paragraph">
                      {t.year}: {feature.properties?.VUOSI}
                    </Typography>
                  </Box>
                </PopupContainer>
              </DraggablePopup>
            </ThemeProvider>
          );

          popup.setContent(container);
          popupRefs.current[index] = popup;
          layer.openPopup();
        }
      });
    }
  };

  return (
    <LayerGroup>
      <GeoJSON
        key={[
          'luomupellot',
          selectedIndicator?.id || '',
          pinnedIndicator?.id || '',
          currentLanguage
        ].join('-')}
        data={luomupellot}
        style={getStyle}
        interactive={true}
        onEachFeature={onEachFeature}
        pane="overlayPane"
      />
    </LayerGroup>
  );
}; 