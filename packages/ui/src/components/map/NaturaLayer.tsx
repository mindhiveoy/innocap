import L from 'leaflet';
import type { Layer } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { LayerGroup, GeoJSON } from 'react-leaflet';
import { naturaAreas } from './data/natura-areas';
/* import { useEffect } from 'react'; */
import { useMap } from 'react-leaflet';

interface NaturaLayerProps {
  visible: boolean;
}

export const NaturaLayer = ({ visible }: NaturaLayerProps) => {
  const map = useMap();

  if (!visible) return null;

  const style = {
    fillColor: '#00ff00',
    fillOpacity: 0.3,
    weight: 2,
    opacity: 1,
    color: '#006400',
  };

  const onEachFeature = (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    if (feature.properties) {
      layer.bindTooltip(feature.properties.nimi || feature.properties.luontotyyppikoodi);

      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            fillOpacity: 0.6,
            weight: 3,
          });
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(style);
        },
      });
    }
  };

  return (
    <LayerGroup>
      <GeoJSON
        key="natura-areas-debug"
        data={naturaAreas}
        style={style}
        onEachFeature={onEachFeature}
      />
    </LayerGroup>
  );
}; 