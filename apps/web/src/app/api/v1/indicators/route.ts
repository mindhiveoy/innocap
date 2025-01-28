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
 *               required:
 *                 - id
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the indicator (e.g., "GAS_VEHICLE_REFUELING")
 *         pinned:
 *           type: object
 *           properties:
 *             indicator:
 *               type: object
 *               required:
 *                 - id
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the indicator (e.g., "ELECTRIC_REGISTRATION")
 * 
 *     ProcessedIndicatorData:
 *       type: object
 *       properties:
 *         indicator:
 *           type: object
 *           required:
 *             - name
 *             - type
 *             - group
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
 *               required:
 *                 - year
 *                 - average
 *                 - highest
 *                 - lowest
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
 *         data:
 *           type: object
 *           required:
 *             - byMunicipality
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
 *       required:
 *         - success
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
 *           example:
 *             selected:
 *               indicator:
 *                 id: "GAS_VEHICLE_REFUELING"
 *             pinned:
 *               indicator:
 *                 id: "ELECTRIC_REGISTRATION"
 *     responses:
 *       200:
 *         description: Successfully processed indicators
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndicatorResponse'
 *       404:
 *         description: No data found for the provided indicator IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 debug:
 *                   type: object
 *                   properties:
 *                     selectedId:
 *                       type: string
 *                     pinnedId:
 *                       type: string
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
    
    // Get full data using indicator IDs
    const {
      selectedData,
      pinnedData
    } = await getDataFromContext(body.selected?.indicator.id, body.pinned?.indicator.id);

    if (!selectedData && !pinnedData) {
      return Response.json({
        success: false,
        error: 'No data found for the provided indicator IDs',
        debug: {
          selectedId: body.selected?.indicator?.id,
          pinnedId: body.pinned?.indicator?.id
        }
      }, { status: 404 });
    }

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
      error: 'Failed to process indicators',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
