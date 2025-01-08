import { LatLngTuple } from 'leaflet';

export const SPECIAL_INDICATORS = {
  NATURA_2000: 'NATURA_2000',
  ORGANIC_FARMING: 'ORGANIC_FARMING'
} as const;

export type SpecialIndicatorId = typeof SPECIAL_INDICATORS[keyof typeof SPECIAL_INDICATORS];

export interface Indicator {
  id: string | SpecialIndicatorId;
  indicatorNameEn: string;
  indicatorNameFi: string;
  category: string;
  indicatorType: 'Municipality Level Data' | 'Marker' | 'Bar Chart' | 'Special';
  indicatorTypeIcon: string;
  group: string;
  groupFI: string;
  iconName: string;
  color: string;
  showOnMap?: string;
  sourceEn: string;
  sourceFi: string;
  sourceUrl?: string;
  selectedYear?: number;
}

export enum IndicatorType {
  MunicipalityLevel = "Municipality Level Data",
  Marker = "Marker",
  BarChart = "Bar Chart",
  Special = "Special"
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

export interface BarChartData extends BaseIndicatorData {
  labels: string[];
  labelsFi: string[];
  values: number[];
  municipalityName: string;
  municipalityCode: string;
  year: number;
  unit: string;
  indicatorNameFi: string;
}

export type IndicatorData = MunicipalityLevelData | MarkerData | BarChartData; 