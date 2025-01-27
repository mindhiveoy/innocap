/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './apiClient';
import { IndicatorContext, ProcessedIndicatorData } from '@/types/chat';
import { 
  Indicator, 
  MunicipalityLevelData, 
  MarkerData, 
  BarChartData 
} from '@repo/ui/types/indicators';

interface PredictionRequest {
  question: string;
  streaming?: boolean;
}

interface PredictionData {
  text: string;
  sourceDocuments?: Array<{
    pageContent: string;
    metadata: Record<string, unknown>;
  }>;
}

interface PredictionResponse {
  success: boolean;
  data?: PredictionData;
  error?: string;
}

interface ContextResponse {
  success: boolean;
  data?: IndicatorContext;
  error?: string;
}

interface IndicatorRequest {
  selected?: {
    indicator: Indicator;
    municipalityData: MunicipalityLevelData[];
    markerData: MarkerData[];
    barChartData: BarChartData[];
  };
  pinned?: {
    indicator: Indicator;
    municipalityData: MunicipalityLevelData[];
    markerData: MarkerData[];
    barChartData: BarChartData[];
  };
  municipalityCode: string;
}

interface IndicatorResponse {
  success: boolean;
  data?: {
    selected?: ProcessedIndicatorData;
    pinned?: ProcessedIndicatorData;
    specialStats?: string;
  };
  error?: string;
}

export const ChatService = {
  prediction: async (data: PredictionRequest, headers?: Record<string, string>) => {
    const currentSession = apiClient.getSessionId();
    console.debug('💬 Making prediction request:', { 
      data, 
      headers,
      currentSession
    });
    

    alert(JSON.stringify({
      data,
      headers,
      currentSession
    }));
    const mergedHeaders = currentSession ? {
      ...headers,
      'x-session-id': currentSession
    } : headers;

    return apiClient.post<PredictionResponse, PredictionRequest>(
      '/api/v1/chat/prediction', 
      data, 
      { headers: mergedHeaders, streaming: data.streaming }
    );
  },

  updateContext: async (context: any) => {
    const currentSession = apiClient.getSessionId();
    console.debug('💬 Updating context:', {
      context,
      currentSession
    });
    
    const headers = currentSession ? { 'x-session-id': currentSession } : undefined;
    
    return apiClient.post<ContextResponse, Partial<IndicatorContext>>(
      '/api/v1/chat/context', 
      context,
      headers ? { headers } : undefined
    );
  },

  getContext: async () => {
    const currentSession = apiClient.getSessionId();
    console.debug('💬 Getting context:', { currentSession });
    
    const headers = currentSession ? { 'x-session-id': currentSession } : undefined;
    
    return apiClient.get<ContextResponse>(
      '/api/v1/chat/context',
      headers ? { headers } : undefined
    );
  },

  clearSession: () => {
    console.debug('💬 Clearing session');
    return apiClient.clearSession();
  },

  processIndicators: async (data: IndicatorRequest) => {
    const currentSession = apiClient.getSessionId();
    
    const headers = currentSession ? { 'x-session-id': currentSession } : undefined;
    
    return apiClient.post<IndicatorResponse, IndicatorRequest>(
      '/api/v1/indicators',
      data,
      headers ? { headers } : undefined
    );
  },
}; 