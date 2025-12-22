'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SwaggerSpec } from '@/types/swagger';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

/**
 * Renders Swagger UI by fetching the OpenAPI spec from `/api/docs` on the client.
 */
const ApiDocs = () => {
  const [spec, setSpec] = useState<SwaggerSpec | undefined>();

  useEffect(() => {
    const loadSpec = async () => {
      const response = await fetch('/api/docs');
      const data = (await response.json()) as SwaggerSpec;
      setSpec(data);
    };

    void loadSpec();
  }, []);

  if (!spec) return <div>Loading...</div>;

  return <SwaggerUI spec={spec} />;
};

export default ApiDocs;