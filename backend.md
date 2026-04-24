# NodeFerro Backend Specification

## Overview

NodeFerro backend is a lightweight API that handles:
1. **Stripe Checkout** — Payment processing for hardware orders
2. **Order Management** — Store configured builds, shipping addresses, track fulfillment
3. **Inventory** — Track Mac Studio SKU availability across warehouses

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Express.js (Node) | Fast, minimal, battle-tested |
| Database | PostgreSQL | Reliable, ACID for orders |
| ORM | Drizzle | Type-safe, lightweight |
| Payments | Stripe | Industry standard, global support |
| Shipping | EasyPost / Shippo | Multi-carrier, worldwide |
| Auth | None (v1) | Anonymous checkout with email |
| Hosting | Railway / Render | Simple deploy, auto-scaling |

## Database Schema

```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  email TEXT NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  chip_id TEXT NOT NULL, -- m4-max | m3-ultra
  cpu_upgraded BOOLEAN DEFAULT false,
  memory_gb INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  unit_count INTEGER NOT NULL DEFAULT 1,
  total_price_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  grand_total_cents INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory table (simple SKU tracking)
CREATE TABLE inventory (
  sku TEXT PRIMARY KEY, -- e.g. "m3-ultra-512gb"
  chip_id TEXT NOT NULL,
  memory_gb INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse TEXT NOT NULL DEFAULT 'us-west'
);
```

## API Routes

### POST /api/checkout/create-payment-intent
Create a Stripe PaymentIntent for the configured build.

**Request Body:**
```json
{
  "chipId": "m3-ultra",
  "cpuUpgraded": true,
  "memoryGb": 512,
  "storageGb": 1024,
  "unitCount": 2,
  "shipping": {
    "name": "John Doe",
    "email": "john@company.com",
    "address": "123 Innovation Dr",
    "city": "San Francisco",
    "country": "United States",
    "zip": "94105"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_123_secret_456",
  "orderId": "uuid-here"
}
```

### POST /api/checkout/confirm
Webhook handler for Stripe `payment_intent.succeeded`.
- Updates order status to `paid`
- Sends confirmation email via Resend
- Deducts from inventory

### GET /api/orders/:id
Get order status for tracking page.

### POST /api/shipping/quote
Get shipping cost estimate.

**Request:** `{ "country": "Germany", "unitCount": 2 }`
**Response:** `{ "cost": 0, "carrier": "DHL", "days": "5-7" }`

## Stripe Setup

1. Create Stripe account
2. Get **Publishable Key** and **Secret Key**
3. Create **PaymentIntent** server-side (never client-side)
4. Use Stripe Elements or Checkout for card collection
5. Set up webhook endpoint for `payment_intent.succeeded`

### Stripe Checkout Flow
```
Frontend (ConfigMatrix)
  → POST /api/checkout/create-payment-intent
    → Stripe.createPaymentIntent({ amount, currency: 'usd' })
    → Save order to DB (status: pending)
    → Return clientSecret
  → Frontend: stripe.confirmCardPayment(clientSecret)
    → Card charged
  → Stripe webhook → POST /api/checkout/confirm
    → Update order status: paid
    → Email customer
    → Notify warehouse
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
EASYPOST_API_KEY=EZ...
PORT=3000
```

## Deployment

### Railway (Recommended)
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login & create project
railway login
railway init

# 3. Add PostgreSQL plugin
railway add --plugin postgresql

# 4. Set env vars
railway vars set STRIPE_SECRET_KEY=sk_...

# 5. Deploy
railway up
```

### Render
1. Create Web Service from GitHub repo
2. Add PostgreSQL managed database
3. Set environment variables
4. Auto-deploy on push to `main`

## Quick Start (Local Dev)

```bash
git clone <repo>
cd nodeferro-backend
npm install

# Set up DB
npx drizzle-kit push:pg

# Seed inventory
npx tsx scripts/seed.ts

# Run dev server
npm run dev
```

## Frontend Integration

The frontend already has:
- `CheckoutModal.tsx` — shipping form + Stripe payment button
- Mock flow simulating success

**To connect real backend:**
1. Replace `handlePayment` mock with:
```typescript
const res = await fetch('/api/checkout/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({ chipId, memoryGb, unitCount, shipping })
});
const { clientSecret } = await res.json();
const stripe = await loadStripe(PUBLISHABLE_KEY);
await stripe!.confirmCardPayment(clientSecret);
```
2. Add `REACT_APP_API_URL` env var pointing to backend

## Shipping Integration

### EasyPost (Worldwide)
- Create shipment: `POST /api/shipments`
- Buy label: `POST /api/shipments/:id/buy`
- Track: `GET /api/trackers/:id`

Supported carriers: DHL, FedEx, UPS, USPS, and 100+ regional carriers.

## Order Fulfillment Flow

```
Customer clicks "Add to Bag"
  → Config saved to localStorage
  → CheckoutModal opens
  → Shipping form filled
  → Stripe payment confirmed
  → Order created in DB (status: paid)
  → Inventory deducted
  → Confirmation email sent
  → Warehouse notified
  → Shipping label generated
  → Tracking email sent
  → Customer tracks at /track/:orderId
```

## v1 Scope (MVP)

- [x] Stripe payment (one-time)
- [x] Order storage in PostgreSQL
- [x] Email confirmations (Resend)
- [x] Shipping quotes (EasyPost)
- [x] Basic inventory tracking
- [ ] Auth/accounts (v2)
- [ ] Saved configurations (v2)
- [ ] Admin dashboard (v2)
- [ ] Subscription/rental (v2)
