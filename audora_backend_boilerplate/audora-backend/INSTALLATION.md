# Installation Guide for Audora Backend

This guide provides detailed instructions for setting up the Audora backend.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- A Cloudinary account for media storage

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd audora-backend
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/audora
PORT=5000
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the placeholders with your actual values:
- `yourpassword`: Your PostgreSQL password
- `your_jwt_secret_key`: A strong secret key for JWT token generation
- `your_cloudinary_*`: Your Cloudinary credentials

## Step 4: Initialize the Database

You can use the provided setup script to initialize the database:

### Windows
```bash
.\setup.bat
```

### Manual Setup
If you prefer to set up manually:

1. Create the database:
```bash
createdb audora
```

2. Run Prisma migrations:
```bash
npx prisma migrate dev
```

3. Seed the database:
```bash
npm run seed
```

## Step 5: Start the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Verifying Installation

Once the server is running, you can verify the installation by accessing:
- API endpoint: http://localhost:5000/api

## Default Users

The seed script creates two default users:
- Admin: admin@audora.com / admin123
- Regular user: user@audora.com / password123

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Verify your DATABASE_URL in the .env file

### Migration Issues
- Reset the database with: `npx prisma migrate reset`
- Re-run migrations: `npx prisma migrate dev`

### Port Conflicts
If port 5000 is already in use, change the PORT in your .env file. 