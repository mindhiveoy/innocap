export interface Indicator {
  id: number;
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
  indicatorNameEn: string;
  descriptionEn: string;
  descriptionFi: string;
  municipalityName: string;
  municipalityCode: string;
  year: number;
  value: number;
  unit: string;
} 