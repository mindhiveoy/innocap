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
 *       description: Request containing selected and/or pinned indicator IDs
 *       properties:
 *         municipalityCode:
 *           type: string
 *           description: Optional municipality code for filtering data (currently unused)
 *         selected:
 *           type: object
 *           description: Currently selected indicator
 *           properties:
 *             indicator:
 *               type: object
 *               required:
 *                 - id
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Indicator ID (e.g., "EMISSIONS", "ELECTRIC_CHARGING")
 *                   enum: [
 *                     "PT_AREAS", "EMISSIONS", "ENERGY", "INV_RENEWABLE",
 *                     "INV_HYDROGEN", "INV_BIO_ENERGY", "GAS_EMISSION",
 *                     "REC_PLASTIC", "REC_WEEE", "REC_TEXTILE",
 *                     "GREEN_GAS_SECTOR", "GREEN_GAS_CAPITA", "GREEN_GAS_TOTAL",
 *                     "GAS_VEHICLE_REFUELING", "ELECTRIC_CHARGING",
 *                     "ELECTRIC_REGISTRATION", "ENV_EDUCATION",
 *                     "NATURA_2000", "ORGANIC_FARMING", "LAND_USE_A", "LAND_USE_B"
 *                   ]
 *         pinned:
 *           type: object
 *           description: Secondary pinned indicator for comparison
 *           properties:
 *             indicator:
 *               type: object
 *               required:
 *                 - id
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Same indicator IDs as above
 * 
 *     ProcessedIndicatorData:
 *       type: object
 *       description: |
 *         Processed indicator data with four possible structures based on indicator type:
 *         1. Municipality Level Data: Simple numerical values tracked over time
 *         2. Markers: Investment projects/locations with status phases (0-5)
 *         3. Bar Charts: Category-based data showing breakdowns
 *         4. Special (NATURA_2000, ORGANIC_FARMING): Protected areas and organic farming stats
 *         
 *         Key interpretation notes:
 *         - Values always include units (see indicator.unit field)
 *         - "Region" entries show totals for entire area
 *         - Marker phases progress: 0.Preliminary → 1.Planning → 2.Decision → 3.Initiation → 4.Construction → 5.In Use
 *         - Trends ("stable", "increasing", etc.) consider all historical data
 *         - Special indicators include additional human-readable context in specialStats
 *         
 *         For Bar Charts:
 *         - Multiple categories per municipality
 *         - Values can be compared across categories and municipalities
 *         - Years show when measurements were taken
 *         
 *         For Markers:
 *         - Each entry may have detailed info and current phase
 *         - Higher phase numbers indicate more advanced progress
 *         - Some markers (like charging stations) count unique locations
 *       properties:
 *         indicator:
 *           type: object
 *           description: Basic metadata about the indicator
 *           required:
 *             - name
 *             - type
 *             - group
 *           properties:
 *             name:
 *               type: string
 *               description: Human-readable name of the indicator
 *             type:
 *               type: string
 *               enum: ["Municipality Level", "Marker", "Bar Chart", "Special"]
 *               description: Determines data structure and interpretation
 *             group:
 *               type: string
 *               description: Thematic category (e.g., "Land use", "Emissions")
 *             description:
 *               type: string
 *               description: Detailed explanation, includes breakdowns for markers
 *             unit:
 *               type: string
 *               description: Measurement unit (e.g., "km2", "M€", "ktCO2e")
 *             year:
 *               type: number
 *               description: Latest data year available
 *         summary:
 *           type: object
 *           description: Statistical overview across municipalities
 *           properties:
 *             latest:
 *               type: object
 *               description: Most recent statistics
 *               properties:
 *                 year:
 *                   type: number
 *                   description: Year of latest measurements
 *                 average:
 *                   type: number
 *                   description: Mean value across municipalities
 *                 highest:
 *                   type: object
 *                   description: Municipality with maximum value
 *                 lowest:
 *                   type: object
 *                   description: Municipality with minimum value
 *             trend:
 *               type: string
 *               enum: ["stable", "slightly increasing", "slightly decreasing", "increasing", "decreasing", "rapidly increasing", "rapidly decreasing"]
 *               description: Overall trend based on historical data
 *         data:
 *           type: object
 *           description: Detailed data for each municipality
 *           required:
 *             - byMunicipality
 *           properties:
 *             byMunicipality:
 *               type: object
 *               description: Municipality-specific data
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   latest:
 *                     type: object
 *                     description: Most recent data point
 *                     properties:
 *                       value:
 *                         type: number
 *                         description: Latest measured value
 *                       year:
 *                         type: number
 *                         description: Year of measurement
 *                   trend:
 *                     type: object
 *                     description: Historical data points
 *                     properties:
 *                       values:
 *                         type: array
 *                         items:
 *                           type: number
 *                         description: Historical values
 *                       years:
 *                         type: array
 *                         items:
 *                           type: number
 *                         description: Corresponding years
 *                   details:
 *                     type: array
 *                     description: Additional details (especially for markers)
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: Project/item name
 *                         phase:
 *                           type: string
 *                           description: Current phase (for markers)
 *                         info:
 *                           type: string
 *                           description: Detailed information
 *                         value:
 *                           type: number
 *                           description: Associated value
 *                         year:
 *                           type: number
 *                           description: Associated year
 * 
 *     IndicatorResponse:
 *       type: object
 *       description: Complete response containing selected and pinned indicators
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
 *               description: Primary indicator data
 *             pinned:
 *               $ref: '#/components/schemas/ProcessedIndicatorData'
 *               description: Secondary comparison indicator
 *             specialStats:
 *               type: string
 *               description: Human-readable context for special indicators
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
      data: processedData,
      metadata: {
        indicatorTypes: {
          "Municipality Level": "Simple numerical values tracked over time",
          "Marker": "Location-based data with phases (0-5) showing project progress",
          "Bar Chart": "Multi-category data with value breakdowns",
          "Special": "Protected areas and organic farming statistics"
        },
        markerPhases: {
          "0.Preliminary": "Initial assessment phase",
          "1.Planning": "Active planning phase",
          "2.Decision": "Investment decision made",
          "3.Initiation": "Project initiated",
          "4.Construction": "Under construction",
          "5.In Use": "Operational"
        },
        groups: {
          "Sustainable Mobility": ["PT_AREAS", "GAS_VEHICLE_REFUELING", "ELECTRIC_CHARGING", "ELECTRIC_REGISTRATION"],
          "Energy Efficiency": ["EMISSIONS", "ENERGY"],
          "Sustainable Investments": ["INV_RENEWABLE", "INV_HYDROGEN", "INV_BIO_ENERGY"],
          "Greenhouse Gas Emissions": ["GAS_EMISSION", "GREEN_GAS_SECTOR", "GREEN_GAS_CAPITA", "GREEN_GAS_TOTAL"],
          "Recycling": ["REC_PLASTIC", "REC_WEEE", "REC_TEXTILE"],
          "Education": ["ENV_EDUCATION"],
          "Land use": ["NATURA_2000", "ORGANIC_FARMING", "LAND_USE_A", "LAND_USE_B"]
        },
        interpretation: {
          "units": "All values include units specified in indicator.unit",
          "region": "Region entries show totals for entire area",
          "trends": "Trends (stable, increasing, etc.) consider all historical data",
          "special": "Special indicators include human-readable context in specialStats"
        }
      }
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
