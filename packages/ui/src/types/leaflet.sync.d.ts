import * as L from 'leaflet';

declare module 'leaflet.sync' {
}

declare module 'leaflet' {
  interface Map {
    sync(map: L.Map, options?: { syncCursor?: boolean }): this;
    unsync(map: L.Map): this;
    isSynced(): boolean;
  }
} 