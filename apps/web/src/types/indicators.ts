export const INDICATORS = {
  PUBLIC_TRANSPORT: 'PT_AREAS',
  BUILDING_EMISSIONS: 'EMISSIONS',
  ENERGY_CONSUMPTION: 'ENERGY',
} as const;

export type IndicatorId = typeof INDICATORS[keyof typeof INDICATORS];

export interface Indicator {
  id: number;
  indicatorId: IndicatorId;
  indicatorNameEn: string;
  indicatorNameFi: string;
  category: string;
  indicatorType: string;
  color: string;
  sourceUrl: string;
  sourceName: string;
  showOnMap: string;
  iconName: string;
}

export interface IndicatorData {
  id: number;
  indicatorId: IndicatorId;
  indicatorNameEn: string;
  descriptionEn: string;
  descriptionFi: string;
  municipalityName: string;
  municipalityCode: string;
  year: number;
  value: number;
  unit: string;
} 