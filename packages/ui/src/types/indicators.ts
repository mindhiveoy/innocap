import { LatLngTuple } from 'leaflet';
import { type Unit } from './units';

export const INDICATORS = {
  PUBLIC_TRANSPORT: 'PT_AREAS',
  BUILDING_EMISSIONS: 'EMISSIONS',
  ENERGY_CONSUMPTION: 'ENERGY',
} as const;

export type IndicatorId = typeof INDICATORS[keyof typeof INDICATORS];

export interface Indicator {
  id: string;
  indicatorNameEn: string;
  indicatorNameFi: string;
  category: string;
  indicatorType: IndicatorType;
  color: string;
  sourceUrl: string;
  sourceName: string;
  showOnMap: string;
  iconName: string;
}

export enum IndicatorType {
  MunicipalityLevel = "Municipality Level Data",
  Marker = "Marker",
}

export interface BaseIndicatorData {
  id: string;
  indicatorNameEn: string;
  descriptionEn: string;
  descriptionFi: string;
}

export interface MunicipalityLevelData extends BaseIndicatorData {
  municipalityName: string;
  municipalityCode: string;
  year: number;
  value: number;
  unit: string;
}

export interface MarkerData extends BaseIndicatorData {
  location: LatLngTuple;
  descriptionEn: string;
  descriptionFi: string;
  municipalityName: string;
  municipalityCode: string;
  year: number;
  value: number;
  unit: string;
  theme: string;
  markerIcon: string;
  phase: string;
  sourceUrl: string;
  info: string;
}

export type IndicatorData = MunicipalityLevelData | MarkerData; 