@echo off
echo ===== Audora Startup Script =====

REM Create uploads directory if it doesn't exist
if not exist "audora_backend_boilerplate\audora-backend\uploads" (
    echo Creating uploads directory...
    mkdir "audora_backend_boilerplate\audora-backend\uploads"
)

REM Verify Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting backend...
start cmd /k "cd audora_backend_boilerplate\audora-backend && call init-backend.bat"

echo Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak
echo Waiting for  5 more seconds, press CTRL+C to quit ...
timeout /t 5 /nobreak

echo Starting frontend...
start cmd /k "cd audora_starter_project\audora_starter_project && call start-frontend.bat"

echo ===== Audora Started =====
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo ==============================

REM Open browser automatically
timeout /t 3 /nobreak
start "" http://localhost:5173

echo Press any key to exit this window...
pause >nul 