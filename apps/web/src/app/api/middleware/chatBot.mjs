import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'https://innocap-staging.mindhive.fi'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-selected-indicator', 'x-municipality-data'],
  exposedHeaders: ['Content-Type', 'Authorization', 'x-selected-indicator', 'x-municipality-data'],
  credentials: true,
  optionsSuccessStatus: 204
}));

const FLOWISE_API_HOST = 'https://bot.mindhive.fi';
const CHATFLOW_ID = '5f815f00-6aa4-4d73-801c-5623185319ba';

let currentContext = {
  selectedIndicator: null,
  municipalityData: null
};

// Add endpoint to update context
app.post('/api/context', (req, res) => {
  currentContext = req.body;
  res.json({ success: true });
});

// Middleware route for chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { question, context } = req.body;
    console.log("🚀 ~ app.post ~ context:", context);
    console.log("🚀 ~ app.post ~ question:", question);

    // Enrich the question with context from the map
    const enrichedQuestion = `Context: ${JSON.stringify(context)}. Question: ${question}`;

    // Forward the enriched question to the Flowise API
    const response = await axios.post(
      `${FLOWISE_API_HOST}/api/v1/chatflow/${CHATFLOW_ID}/query`,
      { question: enrichedQuestion }
    );

    // Send the bot's response back to the React frontend
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error processing chatbot query:', errorMessage);
    res.status(500).json({ error: 'Failed to process chatbot query' });
  }
});

// Proxy all Flowise API requests
app.use('/api/v1', async (req, res) => {
  try {
    console.log('Incoming request to:', req.path);
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    // If this is a prediction request, enrich the question with context
    if (req.path.includes('/prediction/')) {
      // Get indicator data
      const indicatorData = currentContext.municipalityData
        ?.filter(m => m.id === currentContext.selectedIndicator?.id)
        ?.map(m => ({
          municipality: m.municipalityName,
          value: m.value,
          year: m.year
        }));

      const enrichedQuestion = `
        Current Analysis Context:
        
        Selected Indicator: ${currentContext.selectedIndicator?.indicatorNameEn || 'None'}
        Type: ${currentContext.selectedIndicator?.indicatorType || 'None'}
        Group: ${currentContext.selectedIndicator?.group || 'None'}
        Description: ${currentContext.selectedIndicator?.descriptionEn || 'None'}
        Unit: ${indicatorData?.[0]?.unit || 'None'}
        Year: ${currentContext.selectedIndicator?.selectedYear || 'None'}

        Data Points:
        ${indicatorData?.map(d => 
          `${d.municipality}: ${d.value} (${d.year})`
        ).join('\n')}

        Statistical Summary:
        Average: ${calculateAverage(indicatorData)}
        Highest: ${findHighest(indicatorData)}
        Lowest: ${findLowest(indicatorData)}

        Question: ${req.body.question}
      `.trim();

      req.body.question = enrichedQuestion;
      console.log('Enriched question:', enrichedQuestion);
    }

    // Handle streaming responses
    if (req.path.includes('/prediction/') && req.body.streaming) {
      const response = await axios({
        method: req.method,
        url: `${FLOWISE_API_HOST}/api/v1${req.path}`,
        data: req.body,
        headers: {
          'Content-Type': 'application/json',
          'x-selected-indicator': req.headers['x-selected-indicator'],
          'x-municipality-data': req.headers['x-municipality-data']
        },
        responseType: 'stream'
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.data.pipe(res);
      
      response.data.on('end', () => {
        console.log('Stream ended');
        res.end();
      });

      return;
    }

    // Handle non-streaming responses
    const response = await axios({
      method: req.method,
      url: `${FLOWISE_API_HOST}/api/v1${req.path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Flowise API response:', response.data);
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error proxying request:', errorMessage);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(500).json({ error: 'Failed to proxy request', details: errorMessage });
  }
});

// Helper functions
function calculateAverage(data) {
  if (!data?.length) return 'No data';
  const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  return `${avg.toFixed(2)}`;
}

function findHighest(data) {
  if (!data?.length) return 'No data';
  const highest = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);
  return `${highest.municipality} (${highest.value})`;
}

function findLowest(data) {
  if (!data?.length) return 'No data';
  const lowest = data.reduce((min, d) => d.value < min.value ? d : min, data[0]);
  return `${lowest.municipality} (${lowest.value})`;
}

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Middleware is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    server.close();
    app.listen(PORT + 1, () => {
      console.log(`Middleware is running on http://localhost:${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});