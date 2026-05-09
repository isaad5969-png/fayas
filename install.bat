@echo off
echo.
echo ============================================
echo   BilletterieMa - Installation des dependances
echo ============================================
echo.

echo [1/2] Installation du backend...
cd /d "%~dp0backend"
call npm install
echo Backend OK

echo.
echo [2/2] Installation du frontend...
cd /d "%~dp0frontend"
call npm install
echo Frontend OK

echo.
echo ============================================
echo   Installation terminee !
echo   Lancez start.bat pour demarrer l'application.
echo ============================================
echo.
pause
