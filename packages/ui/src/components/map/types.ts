export interface NaturaAreaProperties {
  isocode: string;
  category: string;
  maptype: string;
  ryhmä: string;
  luontotyyppikoodi: string;
  nimi: string;
  nimiruotsi: string;
  nimienglanti: string;
  borlevinneisyysalue: string;
  boresiintymisalue: string;
  borrakennetoiminta: string;
  borennuste: string;
  borkokonaisarvio: string;
  borminesiint_km2: number | null;
  bormaxesiint_km2: number | null;
  borparasarvioesiint_km2: number | null;
  boraikavali: string;
}

export interface NaturaAreaFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: NaturaAreaProperties;
} 