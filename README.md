# Study Tracker App

A comprehensive study tracking application built with Next.js and Strapi, designed to help monitor and visualize student performance.

## Features

- User authentication
- Daily student data logging (GPA, grades, attendance)
- Visual analytics dashboard
- Responsive design

## Tech Stack

- Frontend: Next.js 14
- Backend: Strapi 4
- Database: SQLite (default with Strapi)
- UI Components: Tailwind CSS, Chart.js
- Authentication: NextAuth.js

## Prerequisites

- Node.js >= 18
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Set up the Strapi backend:
   ```bash
   cd backend
   npm install
   npm run develop
   ```
3. Set up the Next.js frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Strapi Admin: http://localhost:1337/admin

## Environment Variables

Create `.env` files in both frontend and backend directories with the following variables:

### Frontend (.env.local)
```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Backend (.env)
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```
