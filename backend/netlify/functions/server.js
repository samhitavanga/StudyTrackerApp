const path = require('path');
const strapiDir = path.resolve(__dirname, '../../');

// Environment variables are already set by Netlify

// Point to the Strapi application
process.chdir(strapiDir);

// Start Strapi
const strapi = require('@strapi/strapi');
strapi({ distDir: path.resolve(strapiDir, './dist') }).start();

// Export the handler function for Netlify Functions
exports.handler = async (event, context) => {
  // Return a 200 response to acknowledge receipt of the event
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Strapi server is running' }),
  };
};
