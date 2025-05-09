@echo off
echo Starting Audora Backend...

REM Create .env file if it doesn't exist
echo Creating or updating .env file...
echo DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/audora > .env
echo PORT=5000 >> .env
echo JWT_SECRET=audora_jwt_secret_key_$#@!2025_secure >> .env
echo CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name >> .env
echo CLOUDINARY_API_KEY=your_cloudinary_api_key >> .env
echo CLOUDINARY_API_SECRET=your_cloudinary_api_secret >> .env

REM Run the server
echo Running server...
npm run dev 