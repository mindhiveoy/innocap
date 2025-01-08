import { NextRequest } from 'next/server';
import { CHAT_CONFIG } from '@/config/chat';
import { IndicatorContext, IndicatorData, MunicipalityData } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = new Headers(req.headers);
    
    const contextResponse = await fetch('/api/chat/context');
    const context = (await contextResponse.json()).data as IndicatorContext;
    
    const enrichedBody = {
      ...body,
      question: `
        ${generateContextDescription(context)}
        Question: ${body.question}
      `.trim()
    };

    const response = await fetch(
      `${CHAT_CONFIG.FLOWISE_API_HOST}/api/v1/prediction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-indicator': headers.get('x-selected-indicator') || '',
          'x-municipality-data': headers.get('x-municipality-data') || '',
        },
        body: JSON.stringify(enrichedBody),
      }
    );

    if (body.streaming) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing prediction:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process prediction' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateContextDescription(context: IndicatorContext): string {
  let description = '';
  
  if (context.selected) {
    description += generateIndicatorDescription('Selected Indicator Analysis', context.selected);
  }
  
  if (context.pinned) {
    description += '\n' + generateIndicatorDescription('Pinned Indicator for Comparison', context.pinned);
  }
  
  return description;
}

function generateIndicatorDescription(title: string, data: IndicatorData): string {
  return `
    ${title}:
    Name: ${data.indicator.name}
    Type: ${data.indicator.type}
    Group: ${data.indicator.group}
    ${data.indicator.description ? `Description: ${data.indicator.description}` : ''}
    ${data.indicator.unit ? `Unit: ${data.indicator.unit}` : ''}
    Year: ${data.summary?.latest.year || 'N/A'}

    ${data.summary ? `
    Summary:
    Average: ${data.summary.latest.average.toFixed(2) || 'N/A'}
    Highest: ${data.summary.latest.highest.municipality} (${data.summary.latest.highest.value})
    Lowest: ${data.summary.latest.lowest.municipality} (${data.summary.latest.lowest.value})
    Overall Trend: ${data.summary.trend || 'N/A'}
    ` : ''}

    Latest Data by Municipality:
    ${Object.entries(data.data.byMunicipality)
      .map(([municipality, mData]: [string, MunicipalityData]) => 
        `${municipality}: ${mData.latest?.value} (${mData.latest?.year})`
      ).join('\n')}
  `;
} 