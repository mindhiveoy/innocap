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
  res.json({ success: true, updated: Date.now() });
});

// Middleware route for chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { question, context } = req.body;

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
    // If this is a prediction request, enrich the question with context
    if (req.path.includes('/prediction/')) {
      const { selected, pinned } = currentContext;
      
      let contextDescription = '';
      
      // Add selected indicator context if available
      if (selected) {
        contextDescription += `
          Selected Indicator Analysis:
          Name: ${selected.indicator.name}
          Type: ${selected.indicator.type}
          Group: ${selected.indicator.group}
          ${selected.indicator.description ? `Description: ${selected.indicator.description}` : ''}
          ${selected.indicator.unit ? `Unit: ${selected.indicator.unit}` : ''}
          Year: ${selected.summary?.latest.year || 'N/A'}

          Summary:
          Average: ${selected.summary?.latest.average.toFixed(2) || 'N/A'}
          Highest: ${selected.summary?.latest.highest.municipality} (${selected.summary?.latest.highest.value})
          Lowest: ${selected.summary?.latest.lowest.municipality} (${selected.summary?.latest.lowest.value})
          Overall Trend: ${selected.summary?.trend || 'N/A'}

          Latest Data by Municipality:
          ${Object.entries(selected.data.byMunicipality)
            .map(([municipality, data]) => 
              `${municipality}: ${data.latest?.value} (${data.latest?.year})`
            ).join('\n')}
        `;
      }

      // Add pinned indicator context if available
      if (pinned) {
        contextDescription += `
          \nPinned Indicator for Comparison:
          Name: ${pinned.indicator.name}
          Type: ${pinned.indicator.type}
          Group: ${pinned.indicator.group}
          ${pinned.indicator.description ? `Description: ${pinned.indicator.description}` : ''}
          ${pinned.indicator.unit ? `Unit: ${pinned.indicator.unit}` : ''}
          Year: ${pinned.summary?.latest.year || 'N/A'}

          ${pinned.summary ? `
          Summary:
          Average: ${pinned.summary.latest.average.toFixed(2) || 'N/A'}
          Highest: ${pinned.summary.latest.highest.municipality} (${pinned.summary.latest.highest.value})
          Lowest: ${pinned.summary.latest.lowest.municipality} (${pinned.summary.latest.lowest.value})
          Overall Trend: ${pinned.summary.trend || 'N/A'}
          ` : ''}

          Latest Data by Municipality:
          ${Object.entries(pinned.data.byMunicipality)
            .map(([municipality, data]) => 
              `${municipality}: ${data.latest?.value} (${data.latest?.year})`
            ).join('\n')}
        `;
      }

      const enrichedQuestion = `
        ${contextDescription}

        Question: ${req.body.question}
      `.trim();

      req.body.question = enrichedQuestion;
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

   // console.log('Flowise API response:', response.data);
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