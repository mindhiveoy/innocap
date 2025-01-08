import { NextRequest } from 'next/server';
import { CHAT_CONFIG } from '@/config/chat';
import { ChatRequest, FlowiseResponse, TransformedResponse } from '@/types/chat';

export const runtime = 'edge';

// Helper to transform Flowise response chunks
const transformFlowiseChunk = (chunk: string): string => {
  try {
    // Remove 'data: ' prefix if present
    const data = chunk.startsWith('data: ') ? chunk.slice(6) : chunk;
    if (data === '[DONE]') return data;
    
    const parsedData = JSON.parse(data) as FlowiseResponse;
    const transformedData: TransformedResponse = {
      ...parsedData,
      timestamp: Date.now(),
    };

    return JSON.stringify(transformedData);
  } catch (error) {
    console.error('Error transforming chunk:', error);
    return chunk; // Return original on error
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    
    // Create streams for transformation
    const transformer = new TransformStream({
      transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            const transformedLine = transformFlowiseChunk(line.trim());
            const newLine = `data: ${transformedLine}\n\n`;
            controller.enqueue(new TextEncoder().encode(newLine));
          }
        }
      }
    });

    // Forward the request to Flowise
    const flowiseResponse = await fetch(
      `${CHAT_CONFIG.FLOWISE_API_HOST}/api/v1/chatflow/${body.chatflowid}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: body.question,
          streaming: true,
          overrideConfig: body.overrideConfig
        }),
      }
    );

    if (!flowiseResponse.ok) {
      throw new Error(`Flowise API error: ${flowiseResponse.status}`);
    }

    // Transform and return the streaming response
    const transformedBody = flowiseResponse.body?.pipeThrough(transformer);
    if (!transformedBody) {
      throw new Error('No response body from Flowise');
    }

    return new Response(transformedBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
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