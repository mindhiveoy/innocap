export interface IndicatorContext {
  selected?: IndicatorData;
  pinned?: IndicatorData;
  specialStats?: Record<string, unknown>;
}

export interface IndicatorData {
  indicator: {
    name: string;
    type: string;
    group: string;
    description?: string;
    unit?: string;
  };
  summary?: {
    latest: {
      year: number;
      average: number;
      highest: { municipality: string; value: number };
      lowest: { municipality: string; value: number };
    };
    trend?: string;
  };
  data: {
    byMunicipality: Record<string, {
      latest?: { value: number; year: number };
    }>;
  };
}

export interface ChatResponse {
  success: boolean;
  updated?: number;
  error?: string;
  data?: unknown;
}

export interface MunicipalityData {
  latest?: {
    value: number;
    year: number;
  };
}

export interface ChatRequest {
  chatflowid: string;
  question: string;
  overrideConfig?: Record<string, unknown>;
}

export interface FlowiseResponse {
  message: string;
  type: string;
}

export interface TransformedResponse extends FlowiseResponse {
  timestamp: number;
} 