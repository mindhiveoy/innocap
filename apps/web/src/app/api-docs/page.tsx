'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SwaggerSpec } from '@/types/swagger';

// @ts-expect-error - Known type issue with swagger-ui-react
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  const [spec, setSpec] = useState<SwaggerSpec>();

  useEffect(() => {
    fetch('/api/docs')
      .then((response) => response.json())
      .then((data: SwaggerSpec) => setSpec(data));
  }, []);

  if (!spec) return <div>Loading...</div>;

  return <SwaggerUI spec={spec} />;
} 