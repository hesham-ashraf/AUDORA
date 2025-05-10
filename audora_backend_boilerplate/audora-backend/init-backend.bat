@echo off
echo ===== Backend Initialization =====

echo Checking if .env exists...
if exist .env (
    echo .env file already exists.
) else (
    echo Creating .env file...
    echo PORT=5000 > .env
    echo DATABASE_URL="file:./dev.db" >> .env
    echo JWT_SECRET="audora-secure-jwt-key-%RANDOM%%RANDOM%" >> .env
    echo NODE_ENV="development" >> .env
    echo JWT_EXPIRY="7d" >> .env
)

echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies. Check your connection and try again.
    pause
    exit /b 1
)

echo Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to generate Prisma client.
    pause
    exit /b 1
)

echo Pushing database schema changes...
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to push database schema.
    pause
    exit /b 1
)

echo Seeding database...
call npm run seed
if %ERRORLEVEL% neq 0 (
    echo WARNING: Database seeding may have encountered issues, but continuing...
)

echo Creating uploads directory if it doesn't exist...
if not exist "uploads" mkdir uploads

echo Backend initialization complete!
echo Starting backend server...
call npm run dev 