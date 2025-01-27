'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { SwaggerSpec } from '@/types/swagger';

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