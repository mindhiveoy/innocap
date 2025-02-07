import { getApiDocs } from '@/utils/swagger';

export async function GET() {
  const spec = getApiDocs();
  return Response.json(spec);
} 