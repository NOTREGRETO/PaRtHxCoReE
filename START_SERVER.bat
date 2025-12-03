@echo off
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║          🔐 Starting MFA Local API Server 🔐          ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.
echo Starting server...
echo.
node api-server.js

pause
