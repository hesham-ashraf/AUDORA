# Audora Backend API

## Overview
Backend API for the Audora music and podcast streaming platform. This service provides endpoints for user authentication, content management (albums, tracks, podcasts, episodes), playlists, and media uploads.

## Tech Stack
- Node.js & Express
- PostgreSQL with Prisma ORM
- JWT Authentication
- Cloudinary for Media Storage
- Jest for testing

## Project Structure
```
audora-backend/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma schema
│   ├── migrations/         # Database migrations
│   └── seed.js             # Database seeding script
├── src/
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── routes/             # API routes
│   ├── services/           # Business logic and external services
│   └── __tests__/          # Test files
├── uploads/                # Temporary storage for uploads
└── setup.bat               # Setup script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get single album with tracks
- `POST /api/albums` - Create a new album (admin only)
- `PATCH /api/albums/:id` - Update album (admin only)
- `DELETE /api/albums/:id` - Delete album (admin only)

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get single track

### Playlists
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get single playlist with tracks
- `POST /api/playlists` - Create a new playlist (protected)
- `PATCH /api/playlists/:id` - Update playlist (protected)
- `DELETE /api/playlists/:id` - Delete playlist (protected)

### Podcasts & Episodes
- `GET /api/podcasts` - Get all podcasts
- `GET /api/podcasts/:id` - Get single podcast with episodes
- `GET /api/episodes/:id` - Get single episode

### Media Upload
- `POST /api/upload/audio` - Upload audio file (protected)
- `POST /api/upload/image` - Upload image file (protected)

## Setup & Run

### Prerequisites
- Node.js
- PostgreSQL

### Setup
1. Clone the repository
2. Run `npm install`
3. Set up your `.env` file with the following:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/audora
PORT=5000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
4. Run the setup script: `./setup.bat`

### Development
```
npm run dev
```

### Testing
```
npm test
```

## Seed Data
The database comes with seed data for testing including:
- Admin user (admin@audora.com / admin123)
- Regular user (user@audora.com / password123)
- Sample albums, tracks, podcasts, and playlists 