# Database Migration Troubleshooting

## Current Status ✅
- ✅ Build completed successfully
- ✅ Frontend running at http://172.31.46.192:3000
- ✅ PostgreSQL running
- ❌ Backend not responding (migration issue)

## Issue
Prisma migration failed with:
- OpenSSL warning (can be ignored)
- "Could not parse schema engine response" error

## Quick Fix

Run these commands on your Ubuntu server:

```bash
# Option 1: Use the fix script (recommended)
chmod +x fix-migration.sh
./fix-migration.sh
```

OR

```bash
# Option 2: Manual fix
# Check backend logs
docker-compose logs backend

# Run migration in production mode
docker-compose exec backend npx prisma migrate deploy

# If that fails, use db push
docker-compose exec backend npx prisma db push --accept-data-loss

# Restart backend
docker-compose restart backend

# Wait and test
sleep 10
curl http://localhost:4000
```

## Check Backend Logs

```bash
# View recent logs
docker-compose logs backend --tail=50

# Follow logs in real-time
docker-compose logs -f backend
```

## Common Issues & Solutions

### 1. Backend Container Keeps Restarting
```bash
# Check if it's a startup error
docker-compose logs backend | grep -i error

# Common causes:
# - Database connection failed
# - Prisma Client not generated
# - Port already in use
```

### 2. Database Connection Error
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U oms_user -d oms_db -c "SELECT 1;"
```

### 3. Prisma Client Not Generated
```bash
# Regenerate Prisma Client
docker-compose exec backend npx prisma generate

# Restart backend
docker-compose restart backend
```

### 4. Migration Files Missing
```bash
# Create initial migration
docker-compose exec backend npx prisma migrate dev --name init

# Or push schema directly
docker-compose exec backend npx prisma db push
```

## Verify Everything is Working

```bash
# 1. Check all containers are running
docker-compose ps

# Should show:
# oms_postgres  - Up
# oms_backend   - Up
# oms_frontend  - Up

# 2. Test endpoints
curl http://localhost:4000  # Should return: Cannot GET /
curl http://localhost:4000/api  # Should return Swagger UI HTML
curl http://localhost:3000  # Should return Next.js HTML

# 3. Check logs for errors
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
```

## Create First Tenant

Once backend is responding:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@shop.lk",
    "password": "password123",
    "name": "Shop Owner",
    "tenantName": "My Shop"
  }'
```

You should get a response with `access_token` and user details.

## Access from Browser

If you want to access from your local machine:

1. **Make sure AWS Security Group allows:**
   - Port 3000 (Frontend)
   - Port 4000 (Backend)

2. **Access URLs:**
   - Frontend: http://YOUR_EC2_IP:3000
   - Backend API: http://YOUR_EC2_IP:4000
   - API Docs: http://YOUR_EC2_IP:4000/api

## Still Not Working?

### Full Reset (⚠️ Deletes all data)

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and start
docker-compose up --build -d

# Initialize database
docker-compose exec backend npx prisma db push
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Check Resource Usage

```bash
# Check if server has enough resources
docker stats

# Check disk space
df -h

# Check memory
free -h
```

## Next Steps After Fix

1. ✅ Verify backend responds: `curl http://localhost:4000`
2. ✅ Create first tenant (see above)
3. ✅ Test creating products, customers, orders
4. ✅ Access frontend UI
5. ✅ Set up Nginx reverse proxy (optional)
6. ✅ Configure SSL with Let's Encrypt (optional)

## Useful Commands

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart a service
docker-compose restart backend

# Rebuild a service
docker-compose up --build -d backend

# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U oms_user -d oms_db

# Check Prisma schema
docker-compose exec backend npx prisma format
docker-compose exec backend npx prisma validate
```
