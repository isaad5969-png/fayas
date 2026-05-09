@echo off
echo.
echo ============================================
echo   BilletterieMa - Lancement de l'application
echo ============================================
echo.

:: Start backend
echo [1/2] Demarrage du backend (port 5000)...
start "Backend API" cmd /k "cd /d "%~dp0backend" && node server.js"

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Start frontend
echo [2/2] Demarrage du frontend (port 5173)...
start "Frontend React" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak > nul
echo.
echo ============================================
echo   Application lancee !
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo   Admin:    admin@billetterie.ma / Admin123!
echo ============================================
echo.
pause
