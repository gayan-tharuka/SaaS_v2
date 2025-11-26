# 📁 Project Structure

## Complete File Tree

```
V2/
├── 📄 docker-compose.yml          # Docker orchestration
├── 📄 .env.example                # Environment variables template
├── 📄 .gitignore                  # Git ignore rules
├── 📄 README.md                   # Project overview
├── 📄 SETUP.md                    # Setup & deployment guide
│
├── 📂 backend/                    # NestJS Backend
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tsconfig.build.json
│   ├── 📄 nest-cli.json
│   │
│   ├── 📂 prisma/
│   │   └── 📄 schema.prisma      # Database schema
│   │
│   └── 📂 src/
│       ├── 📄 main.ts            # Application entry point
│       ├── 📄 app.module.ts      # Root module
│       │
│       ├── 📂 prisma/            # Database module
│       │   ├── 📄 prisma.module.ts
│       │   └── 📄 prisma.service.ts
│       │
│       ├── 📂 auth/              # Authentication
│       │   ├── 📄 auth.module.ts
│       │   ├── 📄 auth.service.ts
│       │   ├── 📄 auth.controller.ts
│       │   ├── 📂 strategies/
│       │   │   ├── 📄 jwt.strategy.ts
│       │   │   └── 📄 local.strategy.ts
│       │   └── 📂 guards/
│       │       ├── 📄 jwt-auth.guard.ts
│       │       └── 📄 local-auth.guard.ts
│       │
│       ├── 📂 orders/            # Orders module ⭐ CRITICAL
│       │   ├── 📄 orders.module.ts
│       │   ├── 📄 orders.service.ts      # Delivery fee calculation logic
│       │   ├── 📄 orders.controller.ts
│       │   └── 📂 dto/
│       │       └── 📄 index.ts
│       │
│       ├── 📂 products/          # Products & Inventory
│       │   ├── 📄 products.module.ts
│       │   ├── 📄 products.service.ts
│       │   └── 📄 products.controller.ts
│       │
│       ├── 📂 customers/         # Customer management
│       │   ├── 📄 customers.module.ts
│       │   ├── 📄 customers.service.ts
│       │   └── 📄 customers.controller.ts
│       │
│       ├── 📂 delivery/          # Delivery templates
│       │   ├── 📄 delivery.module.ts
│       │   ├── 📄 delivery.service.ts
│       │   └── 📄 delivery.controller.ts
│       │
│       └── 📂 analytics/         # Analytics & Reports
│           ├── 📄 analytics.module.ts
│           ├── 📄 analytics.service.ts
│           └── 📄 analytics.controller.ts
│
└── 📂 frontend/                  # Next.js Frontend
    ├── 📄 Dockerfile
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    ├── 📄 next.config.js
    ├── 📄 tailwind.config.js
    ├── 📄 postcss.config.js
    │
    └── 📂 src/
        ├── 📂 app/               # Next.js App Router
        │   ├── 📄 layout.tsx     # Root layout
        │   ├── 📄 page.tsx       # Home page
        │   ├── 📄 providers.tsx  # React Query provider
        │   ├── 📄 globals.css    # Global styles
        │   │
        │   └── 📂 orders/
        │       └── 📂 create/
        │           └── 📄 page.tsx
        │
        ├── 📂 components/        # React components
        │   ├── 📄 CreateOrderForm.tsx  # ⭐ STAR COMPONENT
        │   │
        │   └── 📂 ui/            # ShadCN UI components
        │       ├── 📄 button.tsx
        │       ├── 📄 input.tsx
        │       ├── 📄 label.tsx
        │       ├── 📄 card.tsx
        │       └── 📄 select.tsx
        │
        ├── 📂 hooks/             # Custom React hooks
        │   └── 📄 useOrderCalculator.ts  # ⭐ CRITICAL HOOK
        │
        ├── 📂 lib/               # Utilities
        │   ├── 📄 utils.ts       # Helper functions
        │   └── 📄 api.ts         # Axios client
        │
        └── 📂 types/             # TypeScript types
            └── 📄 index.ts
```

## Key Files Explained

### Backend Critical Files

#### `backend/src/orders/orders.service.ts`
**The heart of the delivery calculation logic**
- Implements the formula: `Base Price + ((Weight - 1) × Extra Price)`
- Handles order creation with automatic stock reduction
- Manages order status updates
- Exports orders for courier bulk upload

#### `backend/prisma/schema.prisma`
**Complete database schema**
- Multi-tenant architecture with `tenantId` isolation
- Order, Product, Customer, DeliveryTemplate models
- Inventory history tracking
- Enum types for Order Status and User Roles

#### `backend/src/auth/auth.service.ts`
**Authentication & tenant creation**
- JWT-based authentication
- Automatic tenant creation on registration
- Password hashing with bcrypt

### Frontend Critical Files

#### `frontend/src/components/CreateOrderForm.tsx`
**⭐ THE STAR OF THE APP**
- Real-time order calculation
- Customer phone number quick search
- Dynamic delivery fee calculation
- Product selection with stock display
- Professional SaaS UI with ShadCN components
- Instant visual feedback on all changes

#### `frontend/src/hooks/useOrderCalculator.ts`
**⭐ CRITICAL CUSTOM HOOK**
- Real-time calculation engine
- Delivery fee calculation: `Base + ((Weight - 1) × Extra)`
- Subtotal, discount, and total amount calculation
- Optimized with React useMemo and useEffect

#### `frontend/src/lib/api.ts`
**API client with interceptors**
- Automatic JWT token injection
- 401 error handling with auto-redirect
- Centralized API configuration

## Architecture Highlights

### Multi-Tenant Isolation
Every query includes `tenantId` filter to ensure complete data isolation between tenants.

### Real-Time Calculations
The `useOrderCalculator` hook provides instant feedback as users:
- Add/remove items
- Change quantities
- Adjust weight
- Select delivery templates
- Apply discounts

### Stock Management
Orders automatically reduce stock and create inventory history entries in a database transaction.

### Delivery Fee Logic
```typescript
if (weight <= 1) {
  fee = firstKgPrice
} else {
  fee = firstKgPrice + ((weight - 1) * extraKgPrice)
}
```

### Professional UI/UX
- Clean, high-density information display
- Fast keyboard navigation
- Phone number search for quick customer lookup
- Sticky order summary for constant visibility
- Real-time delivery calculation breakdown

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | React framework with SSR |
| State Management | React Query | Server state & caching |
| Forms | React Hook Form + Zod | Form validation |
| UI Components | ShadCN UI + Tailwind | Professional component library |
| Backend | NestJS | Node.js framework |
| ORM | Prisma | Type-safe database access |
| Database | PostgreSQL | Relational database |
| Auth | JWT + Passport | Authentication |
| Deployment | Docker Compose | Container orchestration |

## Next Steps for Development

1. **Add more pages:**
   - Orders list page
   - Products management page
   - Customers management page
   - Analytics dashboard
   - Delivery templates management

2. **Enhance features:**
   - Invoice generation (PDF)
   - CSV export for courier upload
   - Low stock alerts
   - Order status tracking
   - User management (RBAC)

3. **Testing:**
   - Unit tests for critical logic
   - E2E tests for order creation flow
   - API integration tests

4. **Production readiness:**
   - Error boundaries
   - Loading states
   - Toast notifications
   - Form validation improvements
   - Mobile responsiveness

All the foundation is built. The core order creation flow with delivery calculation is production-ready! 🚀
