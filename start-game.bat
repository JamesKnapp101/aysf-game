@echo off
echo Starting AYSF Game with Claude AI...
echo.

REM Check if server/.env.local exists
if not exist "server\.env.local" (
    echo ERROR: server/.env.local not found!
    echo.
    echo Please create server/.env.local with your Anthropic API key.
    echo Copy server/.env.local.example and add your API key.
    echo.
    pause
    exit /b 1
)

REM Check if server dependencies are installed
if not exist "server\node_modules\" (
    echo Installing server dependencies...
    cd server
    call pnpm install
    cd ..
    echo.
)

REM Check if main dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call pnpm install
    echo.
)

echo Starting backend server and frontend...
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.

pnpm run dev:full
