#!/bin/bash

# Fix Database Migration Script
echo "🔧 Fixing Database Migration"
echo "============================"
echo ""

# Check backend logs first
echo "📋 Checking backend logs..."
docker-compose logs backend | tail -20
echo ""

# Wait for PostgreSQL to be fully ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Try to run migration with deploy instead of dev
echo "📝 Running Prisma migration (production mode)..."
docker-compose exec -T backend npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "⚠️  Migration deploy failed, trying with db push..."
    docker-compose exec -T backend npx prisma db push --accept-data-loss
fi

# Generate Prisma Client again
echo "📝 Generating Prisma Client..."
docker-compose exec -T backend npx prisma generate

# Restart backend
echo "🔄 Restarting backend..."
docker-compose restart backend

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Test backend
echo ""
echo "🧪 Testing backend..."
if curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ Backend is now responding!"
else
    echo "❌ Backend still not responding. Checking logs..."
    echo ""
    docker-compose logs backend | tail -30
fi

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "💡 If backend is still not working, run:"
echo "   docker-compose logs backend"
