import { NextRequest } from 'next/server';
import { processChatData } from '@/utils/chatDataProcessor';
import { getSessionId } from '@/hooks/useSession';
import { contextCache } from '@/utils/contextCache';
import { 
  Indicator, 
  MunicipalityLevelData, 
  MarkerData, 
  BarChartData 
} from '@repo/ui/types/indicators';

/**
 * @swagger
 * components:
 *   schemas:
 *     Indicator:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *     MunicipalityLevelData:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         value:
 *           type: number
 *     MarkerData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         value:
 *           type: number
 *     BarChartData:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *         value:
 *           type: number
 */

/**
 * @swagger
 * /api/v1/indicators:
 *   post:
 *     summary: Process indicator data for municipalities
 *     tags:
 *       - Indicators
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selected:
 *                 type: object
 *                 properties:
 *                   indicator:
 *                     $ref: '#/components/schemas/Indicator'
 *                   municipalityData:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/MunicipalityLevelData'
 *                   markerData:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/MarkerData'
 *                   barChartData:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/BarChartData'
 *               pinned:
 *                 type: object
 *                 properties:
 *                   indicator:
 *                     $ref: '#/components/schemas/Indicator'
 *                   municipalityData:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/MunicipalityLevelData'
 *                   markerData:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/MarkerData'
 *                   barChartData:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/BarChartData'
 *               municipalityCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully processed indicators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

interface IndicatorRequest {
  selected?: {
    indicator: Indicator;
    municipalityData: MunicipalityLevelData[];
    markerData: MarkerData[];
    barChartData: BarChartData[];
  };
  pinned?: {
    indicator: Indicator;
    municipalityData: MunicipalityLevelData[];
    markerData: MarkerData[];
    barChartData: BarChartData[];
  };
  municipalityCode: string;
}

export async function POST(request: NextRequest) {

  try {
    const sessionId = await getSessionId(request);
    const body = await request.json() as IndicatorRequest;

    // Process the indicator data
    const processedData = processChatData(
      body.selected?.indicator || null,
      body.selected?.municipalityData || [],
      body.selected?.markerData || [],
      body.selected?.barChartData || [],
      body.pinned?.indicator || null,
      body.pinned?.municipalityData || [],
      body.pinned?.markerData || [],
      body.pinned?.barChartData || [],
      body.municipalityCode
    );
    console.log("🚀 ~ POST ~ processedData:", processedData)

    // Update context cache
/*     await contextCache.set(sessionId, {
      selected: processedData.selected || undefined,
      pinned: processedData.pinned || undefined,
      specialStats: processedData.specialStats ? { value: processedData.specialStats } : undefined
    }); */

    return Response.json({
      success: true,
      data: processedData
    });

  } catch (error) {
    console.error('Error processing indicators:', error);
    return Response.json({
      success: false,
      error: 'Failed to process indicators'
    }, { status: 500 });
  }
}
