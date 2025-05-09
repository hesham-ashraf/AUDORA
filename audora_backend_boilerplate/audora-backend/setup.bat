@echo off
echo Setting up Audora Backend...

REM Create .env file if it doesn't exist
echo Creating or updating .env file...
echo DATABASE_URL=postgresql://postgres:vampire8122003@localhost:5432/audora > .env
echo PORT=5000 >> .env
echo JWT_SECRET=audora_jwt_secret_key_$#@!2025_secure >> .env
echo CLOUDINARY_CLOUD_NAME=dnbk3iouw >> .env
echo CLOUDINARY_API_KEY=557375173761133 >> .env
echo CLOUDINARY_API_SECRET=ij4KGS2YiiiT1VZFic-oCmdls3g >> .env

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Create database migrations
echo Creating database migrations...
npx prisma migrate dev --name init

REM Seed the database
echo Seeding the database...
npm run seed

echo Setup complete! You can now run the server with 'npm run dev' or use 'start.bat' 