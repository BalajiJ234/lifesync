@echo off
REM LifeSync - Windows Setup Script
REM This script sets up the LifeSync application for development on Windows

echo.
echo 🚀 Setting up LifeSync...
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Display Node.js version
echo ✅ Node.js version:
node -v

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Build the application
echo.
echo 🏗️  Building application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful!

echo.
echo 🎉 LifeSync setup complete!
echo.
echo To start developing:
echo   npm run dev
echo.
echo To start in production:
echo   npm start
echo.
echo To deploy to Vercel:
echo   npm install -g vercel
echo   vercel --prod
echo.
echo Happy Life Syncing! 🚀
echo.
pause