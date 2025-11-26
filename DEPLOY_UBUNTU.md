# Ubuntu Server Deployment Guide

## Prerequisites Installed ✅
- Docker
- Docker Compose

## Deployment Steps

### 1. Clone Repository ✅
```bash
git clone https://github.com/gayan-tharuka/SaaS_v2.git
cd SaaS_v2
```

### 2. Create Environment File ✅
```bash
nano .env
```

Add the following content:
```env
# Database
DATABASE_URL=postgresql://oms_user:oms_password@postgres:5432/oms_db

# JWT Secrets (⚠️ Change these!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Backend
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://your-server-ip:3000

# Frontend
NEXT_PUBLIC_API_URL=http://your-server-ip:4000
```

### 3. Build and Start Services
```bash
# Build and start all containers
docker-compose up --build -d

# This will:
# - Pull PostgreSQL image
# - Build backend (NestJS)
# - Build frontend (Next.js)
# - Start all services
```

### 4. Initialize Database
```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev --name init

# Generate Prisma Client
docker-compose exec backend npx prisma generate

# Restart backend
docker-compose restart backend
```

### 5. Verify Services
```bash
# Check all containers are running
docker-compose ps

# Should show:
# - oms_postgres (Up)
# - oms_backend (Up)
# - oms_frontend (Up)

# Check logs
docker-compose logs -f
```

### 6. Test the Application

**Backend API:**
```bash
curl http://localhost:4000
# Should return: Cannot GET /

curl http://localhost:4000/api
# Should return Swagger UI HTML
```

**Frontend:**
```bash
curl http://localhost:3000
# Should return Next.js HTML
```

### 7. Create First Tenant
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

Save the `access_token` from the response!

### 8. Add Sample Data

**Create a Product:**
```bash
TOKEN="your-access-token-here"

curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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

**Create a Customer:**
```bash
curl -X POST http://localhost:4000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "phone": "0771234567",
    "address": "123 Main Street",
    "city": "Colombo"
  }'
```

**Create a Delivery Template:**
```bash
curl -X POST http://localhost:4000/delivery-templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Colombo Standard",
    "firstKgPrice": 350,
    "extraKgPrice": 100,
    "isDefault": true
  }'
```

## Firewall Configuration

If you want to access from outside the server:

```bash
# Allow ports
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 4000/tcp  # Backend API
sudo ufw allow 22/tcp    # SSH

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## AWS EC2 Security Group

If running on AWS EC2, add these inbound rules:
- Port 3000 (TCP) - Frontend
- Port 4000 (TCP) - Backend API
- Port 22 (TCP) - SSH

## Production Considerations

### 1. Use Strong Secrets
```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### 2. Set Up Nginx Reverse Proxy
```bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/oms
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    server_name api.your-domain.com;

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

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/oms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### 4. Auto-restart on Reboot
```bash
# Docker containers will auto-restart if you used:
# restart: unless-stopped (already in docker-compose.yml)
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Update code
git pull
docker-compose up --build -d

# Backup database
docker-compose exec postgres pg_dump -U oms_user oms_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U oms_user oms_db < backup.sql
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
sudo lsof -i :3000
sudo lsof -i :4000

# Kill the process
sudo kill -9 <PID>
```

### Check Container Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Access Database
```bash
docker-compose exec postgres psql -U oms_user -d oms_db
```

### Prisma Studio (Database GUI)
```bash
docker-compose exec backend npx prisma studio
# Access at http://your-server-ip:5555
```

## Monitoring

### Check Resource Usage
```bash
docker stats
```

### Check Disk Space
```bash
df -h
docker system df
```

### Clean Up Docker
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Success Criteria

✅ All containers running: `docker-compose ps`
✅ Backend accessible: `curl http://localhost:4000`
✅ Frontend accessible: `curl http://localhost:3000`
✅ Can register and login
✅ Can create products, customers, orders

---

**Your OMS is now deployed on Ubuntu! 🚀**
