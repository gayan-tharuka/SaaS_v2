# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Shop Owner)                        │
│                    WhatsApp/FB/TikTok Orders                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│                     http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  CreateOrderForm │  │ useOrderCalculator│  │  ShadCN UI   │ │
│  │   ⭐ STAR        │  │   ⭐ CRITICAL     │  │  Components   │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│                                                                  │
│  Features:                                                       │
│  • Real-time delivery fee calculation                           │
│  • Customer phone search                                        │
│  • Dynamic product selection                                    │
│  • Instant visual feedback                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             │ (Axios + JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS)                            │
│                     http://localhost:4000                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │  Orders  │  │ Products │  │Customers │       │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                     │                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Delivery │  │Analytics │  │  Prisma  │                     │
│  │  Module  │  │  Module  │  │  Module  │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                  │
│  Key Logic:                                                      │
│  • Delivery Fee = Base + ((Weight - 1) × Extra)                │
│  • Multi-tenant isolation (tenantId)                            │
│  • Automatic stock reduction                                    │
│  • JWT authentication                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
                             │ (Type-safe queries)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│                     postgresql://localhost:5432                  │
├─────────────────────────────────────────────────────────────────┤
│  Tables:                                                         │
│  • Tenant          (Multi-tenancy)                              │
│  • User            (Authentication & RBAC)                       │
│  • Product         (Inventory)                                   │
│  • InventoryHistory (Stock tracking)                            │
│  • Customer        (Customer data)                               │
│  • Order           (Order records)                               │
│  • OrderItem       (Order line items)                            │
│  • DeliveryTemplate (Delivery pricing)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Creating an Order

```
┌──────────────┐
│   Cashier    │
│  Opens Form  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. Search Customer by Phone                                  │
│    GET /customers/search?phone=0771234567                    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Select Products                                           │
│    • Product A × 2                                           │
│    • Product B × 1                                           │
│    → useOrderCalculator calculates subtotal in real-time    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Select Delivery Template & Enter Weight                  │
│    Template: "Colombo" (Rs. 350 + Rs. 100/kg)              │
│    Weight: 2.5 kg                                            │
│    → useOrderCalculator calculates delivery fee:            │
│       350 + ((2.5 - 1) × 100) = Rs. 500                     │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Apply Discount (Optional)                                │
│    Discount: Rs. 50                                          │
│    → Total = Subtotal - Discount + Delivery Fee             │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Submit Order                                              │
│    POST /orders                                              │
│    {                                                         │
│      customerId: "...",                                      │
│      items: [...],                                           │
│      deliveryTemplateId: "...",                             │
│      totalWeight: 2.5,                                       │
│      discount: 50,                                           │
│      paymentMethod: "Cash",                                  │
│      orderSource: "WhatsApp"                                 │
│    }                                                         │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Backend Processing (Transaction):                           │
│ 1. Validate customer belongs to tenant                      │
│ 2. Validate products exist and have stock                   │
│ 3. Calculate delivery fee (server-side verification)        │
│ 4. Create order record                                      │
│ 5. Create order items                                       │
│ 6. Reduce product stock                                     │
│ 7. Create inventory history entries                         │
│ 8. Return order with order number                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Success Response:                                            │
│ {                                                            │
│   id: "...",                                                 │
│   orderNumber: 1001,                                         │
│   totalAmount: 1450,                                         │
│   status: "PENDING",                                         │
│   ...                                                        │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Single Database                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tenant A (Shop 1)                                     │  │
│  │ tenantId: "abc-123"                                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Users:     owner@shop1.lk, cashier@shop1.lk          │  │
│  │ Products:  Product A, Product B, Product C            │  │
│  │ Customers: Customer 1, Customer 2                     │  │
│  │ Orders:    Order #1001, Order #1002                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tenant B (Shop 2)                                     │  │
│  │ tenantId: "xyz-789"                                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Users:     owner@shop2.lk, manager@shop2.lk          │  │
│  │ Products:  Product X, Product Y                       │  │
│  │ Customers: Customer A, Customer B                     │  │
│  │ Orders:    Order #2001, Order #2002                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Every query includes: WHERE tenantId = currentUser.tenantId│
│  → Complete data isolation between tenants                  │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────┐
│ Registration │
└──────┬───────┘
       │
       ▼
POST /auth/register
{
  email: "owner@shop.lk",
  password: "password123",
  name: "Owner Name",
  tenantName: "My Shop"
}
       │
       ▼
┌──────────────────────────────┐
│ Backend creates:             │
│ 1. New Tenant record         │
│ 2. New User with role=OWNER  │
│ 3. Returns JWT token         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Frontend stores token        │
│ localStorage.setItem('token')│
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ All subsequent requests:     │
│ Authorization: Bearer <token>│
└──────────────────────────────┘
```

## Delivery Fee Calculation Logic

```
Input:
  • Delivery Template: { firstKgPrice: 350, extraKgPrice: 100 }
  • Total Weight: 2.5 kg

Calculation:
  if (weight <= 1) {
    deliveryFee = firstKgPrice
    deliveryFee = 350
  } else {
    deliveryFee = firstKgPrice + ((weight - 1) × extraKgPrice)
    deliveryFee = 350 + ((2.5 - 1) × 100)
    deliveryFee = 350 + (1.5 × 100)
    deliveryFee = 350 + 150
    deliveryFee = 500
  }

Output: Rs. 500
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer                                          │
│ • Next.js 14 (App Router)                                   │
│ • React 18                                                  │
│ • TailwindCSS + ShadCN UI                                   │
│ • React Hook Form + Zod                                     │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│ State Management Layer                                      │
│ • React Query (Server state)                                │
│ • React Hooks (Local state)                                 │
│ • Custom hooks (useOrderCalculator)                         │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│ API Layer                                                   │
│ • Axios (HTTP client)                                       │
│ • JWT interceptors                                          │
│ • REST endpoints                                            │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│ Business Logic Layer                                        │
│ • NestJS Controllers                                        │
│ • NestJS Services                                           │
│ • DTOs + Validation                                         │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│ Data Access Layer                                           │
│ • Prisma ORM                                                │
│ • Type-safe queries                                         │
│ • Migrations                                                │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│ Database Layer                                              │
│ • PostgreSQL 15                                             │
│ • ACID transactions                                         │
│ • Relational data                                           │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Host (VPS)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Docker Network: oms_network                          │  │
│  │                                                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ Frontend   │  │  Backend   │  │ PostgreSQL │    │  │
│  │  │ Container  │  │ Container  │  │ Container  │    │  │
│  │  │            │  │            │  │            │    │  │
│  │  │ Next.js    │  │  NestJS    │  │  Postgres  │    │  │
│  │  │ Port: 3000 │  │ Port: 4000 │  │ Port: 5432 │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │         │                │                │          │  │
│  └─────────┼────────────────┼────────────────┼─────────┘  │
│            │                │                │             │
└────────────┼────────────────┼────────────────┼─────────────┘
             │                │                │
             ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  yourdomain.com → Frontend (3000)                           │
│  api.yourdomain.com → Backend (4000)                        │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Internet Users                          │
└─────────────────────────────────────────────────────────────┘
```

## Security Layers

```
1. Authentication
   └─ JWT tokens with expiration
   └─ Bcrypt password hashing
   └─ Refresh token rotation

2. Authorization
   └─ Role-based access control (RBAC)
   └─ Tenant isolation (tenantId filtering)
   └─ Route guards

3. Data Validation
   └─ DTOs with class-validator
   └─ Zod schemas on frontend
   └─ Database constraints

4. Network Security
   └─ CORS configuration
   └─ HTTPS in production
   └─ Environment variables for secrets
```

This architecture is designed for:
✅ Scalability (horizontal scaling of containers)
✅ Maintainability (modular structure)
✅ Security (multi-layer protection)
✅ Performance (optimized queries, caching)
✅ Developer Experience (TypeScript, hot reload)
