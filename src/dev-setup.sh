#!/bin/bash

echo "🚀 Group-12-Project-CSCE3444-fa25 Development Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Frontend setup
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend installation failed"
    exit 1
fi

echo ""

# Backend setup
echo "📦 Installing backend dependencies..."
cd server
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend installation failed"
    exit 1
fi

cd ..

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env (edit if needed)"
fi

if [ ! -f server/.env ]; then
    echo ""
    echo "📝 Creating server/.env file..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env (edit if needed)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd server"
echo "    npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Happy coding! 🎮"
