@echo off
echo.
echo 🚀 Group-12-Project-CSCE3444-fa25 Development Setup
echo ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js is installed
node -v
echo.

REM Frontend setup
echo 📦 Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend installation failed
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

REM Backend setup
echo 📦 Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend installation failed
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Copy environment files if they don't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✅ Created .env (edit if needed)
)

if not exist server\.env (
    echo.
    echo 📝 Creating server\.env file...
    copy server\.env.example server\.env
    echo ✅ Created server\.env (edit if needed)
)

echo.
echo 🎉 Setup complete!
echo.
echo To start development:
echo.
echo   Terminal 1 (Backend):
echo     cd server
echo     npm run dev
echo.
echo   Terminal 2 (Frontend):
echo     npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
echo Happy coding! 🎮
pause
