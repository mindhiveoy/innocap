import L from 'leaflet';
import type { Layer } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { LayerGroup, GeoJSON } from 'react-leaflet';
import { naturaAreas } from './data/natura-areas';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface NaturaLayerProps {
  visible: boolean;
}

export const NaturaLayer = ({ visible }: NaturaLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (visible) {
      try {
        const naturaBounds = L.geoJSON(naturaAreas).getBounds();
        console.log("Natura areas bounds:", naturaBounds);
        console.log("Map bounds:", map.getBounds());
      } catch (error) {
        console.error("Error with natura areas:", error);
      }
    }
  }, [visible, map]);

  if (!visible) return null;

  const style = {
    fillColor: '#00ff00',    // Bright green fill
    fillOpacity: 0.3,        // 30% opacity
    weight: 2,               // Border width
    opacity: 1,
    color: '#darkb',        // Dark green border
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