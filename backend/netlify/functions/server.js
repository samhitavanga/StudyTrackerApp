// Enhanced proxy for Strapi API with authentication handling
const { createProxyMiddleware } = require('http-proxy-middleware');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON request bodies
app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Strapi API proxy is running', 
    env: {
      nodeEnv: process.env.NODE_ENV,
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      frontendUrl: process.env.FRONTEND_URL || '*'
    }
  });
});

// Add a specific endpoint for auth check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Authentication service is running' });
});

// Handle authentication endpoints with special care
app.post('/api/auth/local', async (req, res) => {
  try {
    console.log('Authentication request received:', req.body);
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    
    const response = await fetch(`${strapiUrl}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log('Auth response status:', response.status);
    
    // Return the Strapi response with appropriate status
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication service error', details: error.message });
  }
});

// Special handler for registration
app.post('/api/auth/local/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    
    const response = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log('Registration response status:', response.status);
    
    // Return the Strapi response with appropriate status
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration service error', details: error.message });
  }
});

// Redirect all other API requests to Strapi server
app.use('/api', createProxyMiddleware({
  target: process.env.STRAPI_URL || 'http://localhost:1337',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the request being proxied
    console.log(`Proxying ${req.method} request to ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy service error', details: err.message });
  }
}));

// Export the serverless handler
exports.handler = serverless(app);
