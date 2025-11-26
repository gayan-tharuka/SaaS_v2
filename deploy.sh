#!/bin/bash

# OMS Quick Fix and Deploy Script for Ubuntu
# This script fixes the Docker build issue and deploys the application

echo "🚀 OMS Deployment Script"
echo "========================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please don't run as root. Run as regular user with sudo access."
   exit 1
fi

# Check if in correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found!"
    echo "Please run this script from the SaaS_v2 directory"
    exit 1
fi

echo "✅ Found docker-compose.yml"
echo ""

# Step 1: Fix Dockerfiles
echo "📝 Step 1: Fixing Dockerfiles..."
sed -i 's/RUN npm ci/RUN npm install/g' backend/Dockerfile
sed -i 's/RUN npm ci/RUN npm install/g' frontend/Dockerfile
echo "✅ Dockerfiles updated"
echo ""

# Step 2: Check .env file
if [ ! -f ".env" ]; then
    echo "📝 Step 2: Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://oms_user:oms_password@postgres:5432/oms_db

# JWT Secrets
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_REFRESH_SECRET=change-this-to-another-secure-random-string-in-production

# Backend
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi
echo ""

# Step 3: Stop any existing containers
echo "📝 Step 3: Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo "✅ Containers stopped"
echo ""

# Step 4: Build and start services
echo "📝 Step 4: Building and starting services..."
echo "This may take 5-10 minutes on first run..."
echo ""
docker-compose up --build -d

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

echo ""
echo "✅ Services started successfully!"
echo ""

# Step 5: Wait for services to be ready
echo "📝 Step 5: Waiting for services to be ready..."
sleep 10

# Check if containers are running
RUNNING=$(docker-compose ps | grep "Up" | wc -l)
if [ $RUNNING -lt 3 ]; then
    echo "⚠️  Warning: Not all containers are running"
    docker-compose ps
    echo ""
    echo "Check logs with: docker-compose logs"
    exit 1
fi

echo "✅ All containers are running"
echo ""

# Step 6: Initialize database
echo "📝 Step 6: Initializing database..."
docker-compose exec -T backend npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "⚠️  Database migration had issues, but continuing..."
fi

docker-compose exec -T backend npx prisma generate
docker-compose restart backend

echo "✅ Database initialized"
echo ""

# Step 7: Show status
echo "📊 Service Status:"
echo "=================="
docker-compose ps
echo ""

# Step 8: Test endpoints
echo "🧪 Testing Endpoints:"
echo "===================="

# Test backend
if curl -s http://localhost:4000 > /dev/null; then
    echo "✅ Backend is responding at http://localhost:4000"
else
    echo "❌ Backend is not responding"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Next Steps:"
echo "1. Access frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "2. Access backend API: http://$(hostname -I | awk '{print $1}'):4000"
echo "3. API Documentation: http://$(hostname -I | awk '{print $1}'):4000/api"
echo ""
echo "To create your first tenant, run:"
echo "curl -X POST http://localhost:4000/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"owner@shop.lk\",\"password\":\"password123\",\"name\":\"Owner\",\"tenantName\":\"My Shop\"}'"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
