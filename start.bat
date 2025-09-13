@echo off
echo Starting Task Manager Application...
echo.

echo Starting Backend API Server...
start "Backend API" cmd /k "npm install && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Application...
start "Frontend App" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Both services are starting...
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
