import cors from 'cors';
import type { Context } from 'koa';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const corsMiddleware = cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:3000',
          'https://study-tracker-frontend.onrender.com',
          'https://study-tracker-backend.onrender.com'
        ];
        
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Origin', 
        'Accept', 
        'Access-Control-Allow-Headers', 
        'Access-Control-Allow-Origin'
      ]
    });

    return new Promise((resolve, reject) => {
      corsMiddleware(ctx.req, ctx.res, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(next());
      });
    });
  };
};
