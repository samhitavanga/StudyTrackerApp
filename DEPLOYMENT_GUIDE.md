# Study Tracker Deployment Guide for Render

This guide will help you deploy your Study Tracker application (frontend and backend) to Render.com.

## Prerequisites

1. Create a [Render account](https://render.com)
2. Fork or have ownership of this repository
3. Have your repository connected to Render

## Deployment Steps

### 1. Deploy the Backend (Strapi)

1. Log in to your Render account and go to the Dashboard
2. Click "New +" button and select "Web Service"
3. Connect your GitHub repository
4. Configure the service with the following settings:
   - **Name**: `study-tracker-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose the Free plan or upgrade as needed

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_CLIENT`: `sqlite`
   - `JWT_SECRET`: Generate a secure random string
   - `ADMIN_JWT_SECRET`: Generate a secure random string
   - `APP_KEYS`: Generate a secure random string
   - `API_TOKEN_SALT`: Generate a secure random string

6. Click "Create Web Service"

### 2. Deploy the Frontend (Next.js)

1. After your backend service is deployed, go back to the Render Dashboard
2. Click "New +" button and select "Web Service"
3. Select the same repository
4. Configure the service with these settings:
   - **Name**: `study-tracker-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose the Free plan or upgrade as needed

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL (e.g., `https://study-tracker-backend.onrender.com`)
   - `NEXTAUTH_SECRET`: Generate a secure random string
   - `NEXTAUTH_URL`: This will be your frontend URL (e.g., `https://study-tracker-frontend.onrender.com`)

6. Click "Create Web Service"

## CORS Configuration

The CORS configuration in the backend is set up to accept requests from:
- http://localhost:3000 (local development)
- https://study-tracker-frontend.onrender.com (production frontend)
- https://study-tracker-backend.onrender.com (production backend)

If you choose different service names, make sure to update the CORS configuration in:
- `/backend/config/middlewares.ts`
- `/backend/src/middlewares/cors.ts`

## Alternative Deployment with render.yaml

This repository includes a `render.yaml` file for Blueprint deployments. To use it:

1. Fork this repository
2. In your Render dashboard, click "New +" and select "Blueprint"
3. Connect to your GitHub account and select this repository
4. Render will automatically detect the `render.yaml` file and set up both services

## Troubleshooting

- **CORS Issues**: If you're experiencing CORS errors, verify that your frontend URL is properly added to the CORS configuration in the backend.
- **Database Issues**: For production, consider upgrading to a more robust database solution like PostgreSQL.
- **Deployment Failures**: Check the build logs in Render for detailed error information.

## Monitoring and Scaling

Render provides built-in monitoring tools. For the free tier, your services will spin down after periods of inactivity. For production use, consider upgrading to a paid plan to keep your services always online.
