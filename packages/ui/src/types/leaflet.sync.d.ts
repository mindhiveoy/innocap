import * as L from 'leaflet';

declare module 'leaflet' {
  interface Map {
    sync(map: L.Map): this;
    unsync(map: L.Map): this;
  }
} 