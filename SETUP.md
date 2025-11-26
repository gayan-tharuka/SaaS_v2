# 🚀 Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- Git installed

## Step 1: Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The default values work for local development. For production, update:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` with strong random strings
- `DATABASE_URL` if using external PostgreSQL

## Step 2: Start the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Backend (NestJS)** on port 4000
- **Frontend (Next.js)** on port 3000

## Step 3: Initialize Database

In a new terminal, run:

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev --name init

# Generate Prisma Client
docker-compose exec backend npx prisma generate
```

## Step 4: Seed Initial Data (Optional)

Create a test tenant and user:

```bash
# Access the backend container
docker-compose exec backend sh

# Run seed script (you'll need to create this)
npm run seed
```

Or use the API directly:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "name": "Shop Owner",
    "tenantName": "My Shop"
  }'
```

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api

## Development Workflow

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start dev server
npm run start:dev

# Open Prisma Studio (Database GUI)
npx prisma studio
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# Access backend shell
docker-compose exec backend sh

# Access PostgreSQL
docker-compose exec postgres psql -U oms_user -d oms_db
```

## Testing the API

### 1. Register a Tenant

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@shop.lk",
    "password": "password123",
    "name": "Test Owner",
    "tenantName": "Test Shop"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@shop.lk",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### 3. Create a Product

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Hot Sauce - Mild",
    "sku": "HS-MILD-001",
    "category": "Sauces",
    "price": 500,
    "cost": 250,
    "unit": "bottle",
    "stock": 100
  }'
```

### 4. Create a Customer

```bash
curl -X POST http://localhost:4000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Kasun Perera",
    "phone": "0771234567",
    "address": "123 Galle Road",
    "city": "Colombo"
  }'
```

### 5. Create a Delivery Template

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

### 6. Create an Order

```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customerId": "CUSTOMER_ID_HERE",
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 2
      }
    ],
    "deliveryTemplateId": "TEMPLATE_ID_HERE",
    "totalWeight": 1.5,
    "discount": 0,
    "paymentMethod": "Cash",
    "orderSource": "WhatsApp"
  }'
```

## Troubleshooting

### Port Already in Use

If ports 3000, 4000, or 5432 are already in use, edit `docker-compose.yml` to change the port mappings.

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Can't Connect to Backend

1. Check that backend is running: http://localhost:4000
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env`
3. Check browser console for CORS errors

### Prisma Client Not Generated

```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

## Production Deployment

### 1. Update Environment Variables

Create a `.env.production` file with secure values:

```env
DATABASE_URL=postgresql://user:password@your-db-host:5432/oms_db
JWT_SECRET=your-very-long-random-secret-key
JWT_REFRESH_SECRET=another-very-long-random-secret-key
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2. Build for Production

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Set Up Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Next Steps

1. ✅ Create your first tenant via registration
2. ✅ Add products to your inventory
3. ✅ Add customers
4. ✅ Set up delivery templates
5. ✅ Create your first order!

For more information, see the [README.md](../README.md)
