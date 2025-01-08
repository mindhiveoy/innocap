import { NextRequest } from 'next/server';
import { CHAT_CONFIG } from '@/config/chat';

export const runtime = 'edge';

// Define the Flowise host
const FLOWISE_HOST = 'https://bot.mindhive.fi';

// Type guard for origin check
const isAllowedOrigin = (origin: string | null): origin is typeof CHAT_CONFIG.ALLOWED_ORIGINS[number] => 
  origin !== null && (CHAT_CONFIG.ALLOWED_ORIGINS as readonly string[]).includes(origin);

// Helper to forward relevant headers
function getForwardHeaders(req: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': req.headers.get('Content-Type') || 'application/json',
  };

  // Forward authorization if present
  const auth = req.headers.get('Authorization');
  if (auth) {
    headers['Authorization'] = auth;
  }

  // Add CORS headers
  const origin = req.headers.get('origin');
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  return headers;
}

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight
  const origin = req.headers.get('origin');
  if (isAllowedOrigin(origin)) {
    return new Response(null, {
      status: 204,
      headers: getForwardHeaders(req),
    });
  }
  return new Response(null, { status: 403 });
}
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleRequest(req, path, 'GET');
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleRequest(req, path, 'POST');
}

async function handleRequest(
  req: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    // Create URL with the correct host
    const targetUrl = new URL(`/api/v1/${path}`, FLOWISE_HOST);

    // Only handle POST requests to the specific prediction endpoint
    if (path.includes('prediction') && method === 'POST') {
      const predictionResponse = await fetch(`${req.nextUrl.origin}/api/v1/chat/prediction`, {
        method: 'POST',
        headers: getForwardHeaders(req),
        body: req.body
      });
      return predictionResponse;
    }

    // All other requests go directly to Flowise
    const originalSearchParams = new URL(req.url).searchParams;
    originalSearchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Get the request body if it exists
    let body = null;
    if (method !== 'GET') {
      try {
        const clonedReq = req.clone();
        const contentType = req.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          body = await clonedReq.json();
        } else if (contentType.includes('text/plain')) {
          body = await clonedReq.text();
        } else {
          body = await clonedReq.blob();
        }
      } catch (error) {
        console.warn('Failed to read request body:', error);
      }
    }

    // Forward the request to Flowise
    const flowiseResponse = await fetch(targetUrl, {
      method,
      headers: getForwardHeaders(req),
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });

    // Handle streaming responses
    if (flowiseResponse.headers.get('Content-Type')?.includes('text/event-stream')) {
      const transformedHeaders = {
        ...getForwardHeaders(req),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      };

      return new Response(flowiseResponse.body, {
        headers: transformedHeaders,
      });
    }

    // For regular responses
    const responseData = await flowiseResponse.text();
    if (!flowiseResponse.headers.get('Content-Type')?.includes('text/event-stream')) {
      console.log('Response data:', responseData);
    }
    return new Response(responseData, {
      status: flowiseResponse.status,
      headers: {
        ...getForwardHeaders(req),
        'Content-Type': flowiseResponse.headers.get('Content-Type') || 'application/json',
      },
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 