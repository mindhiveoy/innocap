import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // Path to API folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Municipality Indicators API',
        version: '1.0.0',
        description: 'API documentation for Municipality Indicators',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'Development API Server',
        },
        {
          url: 'http://localhost:3001',
          description: 'Documentation Server',
        }
      ],
    },
  });
  return spec;
}; 