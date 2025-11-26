# Order Management System (OMS)

A production-ready Order Management System tailored for Sri Lankan SMEs. Built with Next.js, NestJS, PostgreSQL, and Prisma.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React Query, TailwindCSS, ShadCN UI
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT with Refresh Tokens
- **Architecture**: Multi-tenant SaaS (Single Database with tenant_id)
- **Deployment**: Docker + Docker Compose

## 📁 Project Structure

```
V2/
├── backend/                 # NestJS Backend
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── orders/         # Orders module with delivery logic
│   │   ├── products/       # Products & inventory
│   │   ├── customers/      # Customer management
│   │   ├── delivery/       # Delivery templates
│   │   ├── analytics/      # Analytics & reports
│   │   └── common/         # Shared utilities
│   └── Dockerfile
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (useOrderCalculator)
│   │   ├── lib/           # Utilities & API client
│   │   └── types/         # TypeScript types
│   └── Dockerfile
└── docker-compose.yml     # Docker orchestration
```

## 🛠️ Quick Start

### Ubuntu Server (Automated)
```bash
# Clone the repository
git clone https://github.com/gayan-tharuka/SaaS_v2.git
cd SaaS_v2

# Run automated deployment script
chmod +x deploy.sh
./deploy.sh
```

See **DEPLOY_UBUNTU.md** for detailed Ubuntu deployment guide.

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### 1. Clone and Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your settings (optional for local dev)
```

### 2. Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Initialize Database
```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev

# Seed initial data (optional)
docker-compose exec backend npm run seed
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api

## 🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio
npx prisma studio
```

## 📦 Key Features

### Smart Order Creation
- Dynamic delivery fee calculation based on weight and templates
- Quick customer lookup by phone number
- Real-time price calculations

### Delivery Management
- Multiple delivery templates (Colombo, Outstation, etc.)
- Export "Ready to Dispatch" orders to CSV
- Bulk courier upload format

### Analytics Dashboard
- Daily/Weekly/Monthly revenue charts
- Most sold products
- Inventory health & low stock alerts

### Multi-tenant Architecture
- Complete tenant isolation
- Role-based access control (Owner, Manager, Cashier)
- Secure JWT authentication

## 🌐 Deployment

### Production Build
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### VPS Deployment
1. Copy project to VPS
2. Update `.env` with production values
3. Run `docker-compose up -d`
4. Set up reverse proxy (Nginx/Caddy)
5. Configure SSL certificates

## 📝 License

MIT License - Built for Sri Lankan SMEs
