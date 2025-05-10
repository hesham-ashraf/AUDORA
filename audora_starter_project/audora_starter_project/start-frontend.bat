@echo off
echo ===== Frontend Initialization =====

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies. Check your connection and try again.
    pause
    exit /b 1
)

REM Create .env file if not exists
if not exist .env (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:5000/api > .env
)

echo Frontend initialization complete!
echo Starting frontend development server...
call npm run dev 