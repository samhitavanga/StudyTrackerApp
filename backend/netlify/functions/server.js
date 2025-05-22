// Simple proxy for Strapi API
const { createProxyMiddleware } = require('http-proxy-middleware');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Strapi API proxy is running' });
});

// Redirect API requests to Strapi server
app.use('/api', createProxyMiddleware({
  target: process.env.STRAPI_URL || 'http://localhost:1337',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

// Export the serverless handler
exports.handler = serverless(app);
