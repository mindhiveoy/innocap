export interface ChatRequest {
  question: string;
  context: Record<string, unknown>;
  chatflowid: string;
  overrideConfig?: Record<string, unknown>;
}

export interface FlowiseResponse {
  message: string;
  type: string;
  // Add other Flowise response fields as needed
}

export interface TransformedResponse extends FlowiseResponse {
  timestamp: number;
  // Add other custom fields as needed
} 