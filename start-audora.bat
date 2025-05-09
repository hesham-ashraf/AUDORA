@echo off
echo ===== Audora Startup Script =====

echo Starting backend...
start cmd /k "cd audora_backend_boilerplate\audora-backend && call init-backend.bat"

echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak

echo Starting frontend...
start cmd /k "cd audora_starter_project\audora_starter_project && call start-frontend.bat"

echo ===== Audora Started =====
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo ============================== 