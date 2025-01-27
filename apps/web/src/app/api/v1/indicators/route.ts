import { NextRequest } from 'next/server';
import { processChatData } from '@/utils/chatDataProcessor';
import { SimpleIndicatorRequest } from '@/types/chat';
import { getDataFromContext } from '@/utils/dataContext';

/**
 * @swagger
 * components:
 *   schemas:
 *     SimpleIndicatorRequest:
 *       type: object
 *       properties:
 *         selected:
 *           type: object
 *           properties:
 *             indicator:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 indicatorNameEn:
 *                   type: string
 *                 indicatorType:
 *                   type: string
 *                 group:
 *                   type: string
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   municipalityCode:
 *                     type: string
 *                   value:
 *                     type: number
 *                   year:
 *                     type: number
 *         pinned:
 *           type: object
 *           properties:
 *             indicator:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 indicatorNameEn:
 *                   type: string
 *                 indicatorType:
 *                   type: string
 *                 group:
 *                   type: string
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   municipalityCode:
 *                     type: string
 *                   value:
 *                     type: number
 *                   year:
 *                     type: number
 *         municipalityCode:
 *           type: string
 *           description: Municipality code for context
 * 
 *     ProcessedIndicatorData:
 *       type: object
 *       properties:
 *         indicator:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             type:
 *               type: string
 *             group:
 *               type: string
 *             description:
 *               type: string
 *             unit:
 *               type: string
 *             year:
 *               type: number
 *         summary:
 *           type: object
 *           properties:
 *             latest:
 *               type: object
 *               properties:
 *                 year:
 *                   type: number
 *                 average:
 *                   type: number
 *                 highest:
 *                   type: object
 *                   properties:
 *                     municipality:
 *                       type: string
 *                     value:
 *                       type: number
 *                 lowest:
 *                   type: object
 *                   properties:
 *                     municipality:
 *                       type: string
 *                     value:
 *                       type: number
 *             trend:
 *               type: string
 *               description: "e.g., 'increasing', 'decreasing', 'stable'"
 *         data:
 *           type: object
 *           properties:
 *             byMunicipality:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   latest:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       year:
 *                         type: number
 *                   trend:
 *                     type: object
 *                     properties:
 *                       values:
 *                         type: array
 *                         items:
 *                           type: number
 *                       years:
 *                         type: array
 *                         items:
 *                           type: number
 *                   details:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         phase:
 *                           type: string
 *                         info:
 *                           type: string
 *                         value:
 *                           type: number
 *                         year:
 *                           type: number
 * 
 *     IndicatorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             selected:
 *               $ref: '#/components/schemas/ProcessedIndicatorData'
 *             pinned:
 *               $ref: '#/components/schemas/ProcessedIndicatorData'
 *             specialStats:
 *               type: string
 *               description: Additional statistics for special indicators (Natura 2000, Organic Farming)
 * 
 * /api/v1/indicators:
 *   post:
 *     summary: Process indicator data for AI analysis
 *     description: Returns processed data for selected and/or pinned indicators with municipality-level statistics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SimpleIndicatorRequest'
 *     responses:
 *       200:
 *         description: Successfully processed indicators
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndicatorResponse'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SimpleIndicatorRequest;
    
    // Get full data from context using indicator IDs
    const {
      selectedData,
      pinnedData
    } = await getDataFromContext(body.selected?.indicator.id, body.pinned?.indicator.id);

    // Process the indicator data with full context data
    const processedData = processChatData(
      selectedData?.indicator || null,
      selectedData?.municipalityData || [],
      selectedData?.markerData || [],
      selectedData?.barChartData || [],
      pinnedData?.indicator || null,
      pinnedData?.municipalityData || [],
      pinnedData?.markerData || [],
      pinnedData?.barChartData || [],
      body.municipalityCode
    );

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
