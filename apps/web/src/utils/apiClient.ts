// Create a singleton instance to maintain session state
let globalSessionId: string | null = null;

interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

interface RequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: TBody;
  streaming?: boolean;
}

export const createApiClient = ({ baseUrl = '', headers = {} }: ApiClientOptions = {}) => {
  console.debug('🌐 API Client created with base URL:', baseUrl);
  console.debug('🌐 Current global session:', globalSessionId);

  const request = async <TResponse, TBody = unknown>(
    path: string, 
    options: RequestOptions<TBody> = {}
  ): Promise<TResponse> => {
    const {
      method = 'GET',
      headers: requestHeaders = {},
      body,
      streaming = false
    } = options;

    // Use global session ID instead of instance-level
    const mergedHeaders = {
      'Content-Type': 'application/json',
      ...headers,
      ...requestHeaders,
      ...(globalSessionId ? { 'x-session-id': globalSessionId } : {}),
    };

    console.debug(`🌐 Making ${method} request to: ${path}`);
    console.debug('🌐 Request headers:', mergedHeaders);
    if (body) console.debug('🌐 Request body:', body);

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Update global session ID from response if present
    const responseSessionId = response.headers.get('x-session-id');
    if (responseSessionId) {
      globalSessionId = responseSessionId;
      console.debug('🌐 Updated global session ID:', globalSessionId);
    }

    console.debug(`🌐 Response status: ${response.status}`);
    console.debug('🌐 Response headers:', Object.fromEntries(response.headers.entries()));

    if (streaming) {
      console.debug('🌐 Returning streaming response');
      return response.body as unknown as TResponse;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('🌐 Request failed:', error);
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    console.debug('🌐 Response data:', data);
    return data;
  };

  return {
    get: <TResponse>(
      path: string, 
      options?: Omit<RequestOptions, 'method' | 'body'>
    ) => request<TResponse>(path, { ...options, method: 'GET' }),
    
    post: <TResponse, TBody>(
      path: string, 
      body: TBody, 
      options?: Omit<RequestOptions<TBody>, 'method'>
    ) => request<TResponse, TBody>(path, { ...options, method: 'POST', body }),
    
    put: <TResponse, TBody>(
      path: string, 
      body: TBody, 
      options?: Omit<RequestOptions<TBody>, 'method'>
    ) => request<TResponse, TBody>(path, { ...options, method: 'PUT', body }),
    
    delete: <TResponse>(
      path: string, 
      options?: Omit<RequestOptions, 'method' | 'body'>
    ) => request<TResponse>(path, { ...options, method: 'DELETE' }),

    clearSession: () => {
      console.debug('🌐 Clearing global session ID');
      globalSessionId = null;
    },

    getSessionId: () => globalSessionId,

    getSessionHeaders: () => (globalSessionId ? {
      'x-session-id': globalSessionId
    } : {} as Record<string, string>),
  };
};

// Create a single instance to be used throughout the app
export const apiClient = createApiClient(); 