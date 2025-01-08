import { NextRequest } from 'next/server';
import { IndicatorContext } from '@/types/chat';

let currentContext: IndicatorContext = {
  selected: undefined,
  pinned: undefined,
  specialStats: undefined
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Updating context with:', body); // Debug log
    currentContext = body;
    
    return new Response(JSON.stringify({ 
      success: true, 
      updated: Date.now(),
      context: currentContext // Return current context for verification
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating context:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update context' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ 
    success: true, 
    data: currentContext 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
} 