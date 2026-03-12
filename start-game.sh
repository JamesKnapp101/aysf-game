#!/bin/bash

echo "Starting AYSF Game with Claude AI..."
echo ""

# Check if server/.env.local exists
if [ ! -f "server/.env.local" ]; then
    echo "ERROR: server/.env.local not found!"
    echo ""
    echo "Please create server/.env.local with your Anthropic API key."
    echo "Copy server/.env.local.example and add your API key."
    echo ""
    exit 1
fi

# Check if server dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server
    pnpm install
    cd ..
    echo ""
fi

# Check if main dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
    echo ""
fi

echo "Starting backend server and frontend..."
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""

pnpm run dev:full
