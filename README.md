# Audora Music Streaming Platform

Audora is a music and podcast streaming platform with a beautiful UI and powerful backend.

## Running the Application

### Easy Method (Windows)
1. Double-click the `start-audora.bat` file in the root directory
2. This will start both the backend and frontend automatically

### Manual Method

#### Start the Backend
1. Navigate to `audora_backend_boilerplate/audora-backend`
2. Create a `.env` file with the following:
```
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-secret-key"
NODE_ENV="development"
JWT_EXPIRY="7d"
```
3. Run the following commands:
```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

#### Start the Frontend
1. Navigate to `audora_starter_project/audora_starter_project`
2. Run the following commands:
```bash
npm install
npm run dev
```

## Accessing the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Features
- Music and podcast streaming
- User authentication
- Playlist creation and management
- Trending content and recommendations
- Search functionality
- User profiles

## Technologies Used
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express, Prisma
- Database: SQLite (development) / PostgreSQL (production) 