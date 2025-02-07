import { NextRequest } from 'next/server';
import { getSessionId } from '@/hooks/useSession';
import { contextCache } from '@/utils/contextCache';

export async function GET(req: NextRequest) {
  const sessionId = await getSessionId(req);
  const context = contextCache.get(sessionId) || {
    selected: undefined,
    pinned: undefined,
    specialStats: undefined
  };

  return Response.json({ 
    success: true, 
    data: context,
    sessionId,
    cacheStats: contextCache.getStats()
  });
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionId(request);
    const body = await request.json();
    
    console.log('Context PERKELE: ' + sessionId);
    console.log(body);

    await contextCache.set(sessionId, body);
    
    return Response.json({ 
      success: true, 
      updated: Date.now(),
      context: contextCache.get(sessionId),
      sessionId
    });
  } catch (error) {
    console.error('Error updating context:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update context' 
    }, { status: 500 });
  }
} 