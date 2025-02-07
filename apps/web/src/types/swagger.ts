interface SwaggerPathItem {
  get?: SwaggerOperation;
  post?: SwaggerOperation;
  put?: SwaggerOperation;
  delete?: SwaggerOperation;
  options?: SwaggerOperation;
  head?: SwaggerOperation;
  patch?: SwaggerOperation;
}

interface SwaggerOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  requestBody?: SwaggerRequestBody;
  responses: Record<string, SwaggerResponse>;
}

interface SwaggerRequestBody {
  required?: boolean;
  content: Record<string, { schema: SwaggerSchema }>;
}

interface SwaggerResponse {
  description: string;
  content?: Record<string, { schema: SwaggerSchema }>;
}

interface SwaggerSchema {
  type?: string;
  properties?: Record<string, SwaggerSchema>;
  items?: SwaggerSchema;
  $ref?: string;
  required?: string[];
}

interface SwaggerComponents {
  schemas?: Record<string, SwaggerSchema>;
  responses?: Record<string, SwaggerResponse>;
  parameters?: Record<string, unknown>;
  securitySchemes?: Record<string, unknown>;
}

export interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths?: Record<string, SwaggerPathItem>;
  components?: SwaggerComponents;
} 