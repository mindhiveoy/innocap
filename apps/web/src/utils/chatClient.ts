/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './apiClient';
import { 
  ProcessedIndicatorData,  
} from '@/types/chat';

interface PredictionRequest {
  question: string;
  context?: {
    selected?: ProcessedIndicatorData;
    pinned?: ProcessedIndicatorData;
    specialStats?: string;
  };
}

interface PredictionResponse {
  success: boolean;
  data?: {
    text: string;
    sourceDocuments?: Array<{
      pageContent: string;
      metadata: Record<string, unknown>;
    }>;
  };
  error?: string;
}

interface SimpleIndicatorData {
  indicator: {
    id: string;
    indicatorNameEn: string;
    indicatorType: string;
    group: string;
  };
}

interface SimpleIndicatorRequest {
  selected?: SimpleIndicatorData;
  pinned?: SimpleIndicatorData;
  municipalityCode?: string;
}

export const ChatService = {
  prediction: async (data: PredictionRequest) => {
    console.debug('💬 Making prediction request:', data);
    return apiClient.post<PredictionResponse, PredictionRequest>(
      '/api/v1/chat/prediction', 
      data
    );
  },

  processIndicators: async (request: SimpleIndicatorRequest) => {
    const response = await fetch('/api/v1/indicators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}; 