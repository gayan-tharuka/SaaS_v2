# ✅ Quick Start Checklist

Follow these steps to get your OMS running in 5 minutes!

## Prerequisites Check

- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Ports 3000, 4000, 5432 available

## Setup Steps

### 1. Environment Setup
```bash
# Navigate to project directory
cd V2

# Create .env file (copy from .env.example)
cp .env.example .env
```

**Note**: Default values in `.env.example` work for local development!

### 2. Start Services
```bash
# Build and start all containers
docker-compose up --build

# Wait for all services to start (about 1-2 minutes)
# You should see:
# ✅ oms_postgres    | database system is ready to accept connections
# ✅ oms_backend     | 🚀 Backend running on http://localhost:4000
# ✅ oms_frontend    | ▲ Next.js 14.0.4
```

### 3. Initialize Database
Open a **new terminal** and run:

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev --name init

# Generate Prisma Client
docker-compose exec backend npx prisma generate

# Restart backend to load new Prisma Client
docker-compose restart backend
```

### 4. Verify Installation
Check these URLs in your browser:

- [ ] Frontend: http://localhost:3000 (should show order form)
- [ ] Backend: http://localhost:4000 (should show "Cannot GET /")
- [ ] API Docs: http://localhost:4000/api (should show Swagger UI)

## First-Time Setup

### Create Your Tenant Account

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@myshop.lk",
    "password": "password123",
    "name": "Shop Owner",
    "tenantName": "My Shop"
  }'
```

**Save the `access_token` from the response!**

### Add Sample Data

#### 1. Create a Product
```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Sample Product",
    "sku": "PROD-001",
    "category": "General",
    "price": 1000,
    "cost": 500,
    "unit": "piece",
    "stock": 50
  }'
```

#### 2. Create a Customer
```bash
curl -X POST http://localhost:4000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "phone": "0771234567",
    "address": "123 Main Street",
    "city": "Colombo"
  }'
```

#### 3. Create a Delivery Template
```bash
curl -X POST http://localhost:4000/delivery-templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Colombo Standard",
    "firstKgPrice": 350,
    "extraKgPrice": 100,
    "isDefault": true
  }'
```

## Test the Order Form

1. Open http://localhost:3000
2. Search for customer by phone: `0771234567`
3. Add a product
4. Select delivery template
5. Enter weight: `2.5` kg
6. Watch the delivery fee calculate automatically!
7. Click "Create Order"

## Common Issues & Solutions

### Issue: "Port already in use"
**Solution**: 
```bash
# Find what's using the port
netstat -ano | findstr :3000
# Kill the process or change port in docker-compose.yml
```

### Issue: "Cannot connect to database"
**Solution**:
```bash
# Check if PostgreSQL container is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Issue: "Prisma Client not generated"
**Solution**:
```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Issue: "Frontend shows connection error"
**Solution**:
```bash
# Check backend is running
curl http://localhost:4000

# Check NEXT_PUBLIC_API_URL in .env
cat .env | grep NEXT_PUBLIC_API_URL

# Should be: NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Issue: "401 Unauthorized"
**Solution**: Your token expired or is invalid. Login again:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@myshop.lk",
    "password": "password123"
  }'
```

## Development Workflow

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Services
```bash
# Stop (keeps data)
docker-compose down

# Stop and remove volumes (⚠️ deletes database!)
docker-compose down -v
```

### Access Database
```bash
# Using Prisma Studio (GUI)
docker-compose exec backend npx prisma studio
# Opens at http://localhost:5555

# Using psql
docker-compose exec postgres psql -U oms_user -d oms_db
```

### Update Code
```bash
# After changing backend code
docker-compose restart backend

# After changing frontend code
docker-compose restart frontend

# After changing Prisma schema
docker-compose exec backend npx prisma migrate dev --name your_migration_name
docker-compose restart backend
```

## Next Steps

Once everything is running:

1. [ ] Explore the API docs at http://localhost:4000/api
2. [ ] Create more products, customers, and delivery templates
3. [ ] Test the order creation flow
4. [ ] Check the database with Prisma Studio
5. [ ] Review the code in `backend/src/orders/orders.service.ts`
6. [ ] Review the frontend in `frontend/src/components/CreateOrderForm.tsx`

## Production Deployment

When ready to deploy:

1. [ ] Update `.env` with production values
2. [ ] Generate secure JWT secrets: `openssl rand -base64 32`
3. [ ] Set up production PostgreSQL database
4. [ ] Configure domain and SSL
5. [ ] See `SETUP.md` for detailed deployment guide

## Support & Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed setup guide
- **ARCHITECTURE.md** - System architecture
- **PROJECT_STRUCTURE.md** - File structure
- **ENV_SETUP.md** - Environment variables guide
- **BUILD_COMPLETE.md** - Build summary

## Success Criteria

You're ready to use the system when:

✅ All containers are running (`docker-compose ps`)
✅ Frontend loads at http://localhost:3000
✅ API docs load at http://localhost:4000/api
✅ You can register and login
✅ You can create products, customers, and delivery templates
✅ You can create an order with automatic delivery fee calculation

---

**Need help?** Check the documentation files or review the error logs with `docker-compose logs -f`

🚀 **Happy ordering!**
