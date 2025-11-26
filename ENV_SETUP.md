# Environment Variables Setup

## For Local Development

Create a `.env` file in the root directory (`V2/.env`) with these values:

```env
# Database
DATABASE_URL=postgresql://oms_user:oms_password@localhost:5432/oms_db

# JWT Secrets (⚠️ CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-long-random-string
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-use-long-random-string

# Backend
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Quick Setup Command

```bash
# Copy the example file
cp .env.example .env

# Or create manually
cat > .env << 'EOF'
DATABASE_URL=postgresql://oms_user:oms_password@localhost:5432/oms_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-long-random-string
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-use-long-random-string
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
```

## For Production

Update these values in your production `.env`:

```env
# Database (use your production PostgreSQL)
DATABASE_URL=postgresql://prod_user:strong_password@your-db-host:5432/oms_production

# JWT Secrets (generate strong random strings)
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>

# Backend
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Generate Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

## Docker Compose Override

If running with Docker and need different database host:

```env
# For Docker Compose (container-to-container)
DATABASE_URL=postgresql://oms_user:oms_password@postgres:5432/oms_db

# For local development (host machine)
DATABASE_URL=postgresql://oms_user:oms_password@localhost:5432/oms_db
```

## Verification

After creating `.env`, verify it's working:

```bash
# Check if Docker can read the variables
docker-compose config

# Start the services
docker-compose up
```

You should see:
- ✅ PostgreSQL starting on port 5432
- ✅ Backend starting on port 4000
- ✅ Frontend starting on port 3000

## Troubleshooting

**Problem**: "DATABASE_URL is not defined"
**Solution**: Make sure `.env` is in the root directory (same level as `docker-compose.yml`)

**Problem**: "Connection refused to PostgreSQL"
**Solution**: 
- If using Docker: Use `postgres` as hostname
- If running locally: Use `localhost` as hostname

**Problem**: Frontend can't connect to backend
**Solution**: Check `NEXT_PUBLIC_API_URL` matches your backend URL

## Security Notes

⚠️ **NEVER commit `.env` to Git!** (It's already in `.gitignore`)

✅ **DO** use different secrets for development and production

✅ **DO** use strong, random secrets in production

✅ **DO** rotate secrets periodically

✅ **DO** use environment-specific `.env` files:
- `.env.development`
- `.env.production`
- `.env.test`
