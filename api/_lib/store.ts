import { Pool } from 'pg';
import { randomUUID } from 'crypto';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderRecord {
  id: string;
  stripePaymentIntentId: string | null;
  status: OrderStatus;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingZip: string;
  chipId: string;
  cpuUpgraded: boolean;
  memoryGb: number;
  storageGb: number;
  unitCount: number;
  totalPriceCents: number;
  shippingCostCents: number;
  taxCents: number;
  grandTotalCents: number;
  createdAt: string;
  updatedAt: string;
}

interface NewOrderInput {
  stripePaymentIntentId?: string | null;
  status?: OrderStatus;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingZip: string;
  chipId: string;
  cpuUpgraded: boolean;
  memoryGb: number;
  storageGb: number;
  unitCount: number;
  totalPriceCents: number;
  shippingCostCents: number;
  taxCents: number;
  grandTotalCents: number;
}

const memoryOrders = new Map<string, OrderRecord>();
const memoryInventory = new Map<string, { sku: string; quantity: number }>();

let pool: Pool | null = null;
let schemaReady = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return pool;
}

async function ensureSchema() {
  const db = getPool();
  if (!db || schemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      stripe_payment_intent_id TEXT,
      status TEXT DEFAULT 'pending',
      email TEXT NOT NULL,
      shipping_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_country TEXT NOT NULL,
      shipping_zip TEXT NOT NULL,
      chip_id TEXT NOT NULL,
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
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      sku TEXT PRIMARY KEY,
      chip_id TEXT NOT NULL,
      memory_gb INTEGER NOT NULL,
      storage_gb INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      warehouse TEXT NOT NULL DEFAULT 'us-west'
    );
  `);

  schemaReady = true;
}

function mapOrder(row: any): OrderRecord {
  return {
    id: row.id,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? null,
    status: row.status,
    email: row.email,
    shippingName: row.shipping_name,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    shippingCountry: row.shipping_country,
    shippingZip: row.shipping_zip,
    chipId: row.chip_id,
    cpuUpgraded: row.cpu_upgraded,
    memoryGb: row.memory_gb,
    storageGb: row.storage_gb,
    unitCount: row.unit_count,
    totalPriceCents: row.total_price_cents,
    shippingCostCents: row.shipping_cost_cents,
    taxCents: row.tax_cents,
    grandTotalCents: row.grand_total_cents,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function createOrder(input: NewOrderInput): Promise<OrderRecord> {
  const now = new Date().toISOString();
  const id = randomUUID();
  const status = input.status ?? 'pending';

  const db = getPool();
  if (!db) {
    const record: OrderRecord = {
      id,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      status,
      email: input.email,
      shippingName: input.shippingName,
      shippingAddress: input.shippingAddress,
      shippingCity: input.shippingCity,
      shippingCountry: input.shippingCountry,
      shippingZip: input.shippingZip,
      chipId: input.chipId,
      cpuUpgraded: input.cpuUpgraded,
      memoryGb: input.memoryGb,
      storageGb: input.storageGb,
      unitCount: input.unitCount,
      totalPriceCents: input.totalPriceCents,
      shippingCostCents: input.shippingCostCents,
      taxCents: input.taxCents,
      grandTotalCents: input.grandTotalCents,
      createdAt: now,
      updatedAt: now,
    };

    memoryOrders.set(id, record);
    return record;
  }

  await ensureSchema();
  const res = await db.query(
    `
      INSERT INTO orders (
        id, stripe_payment_intent_id, status, email, shipping_name, shipping_address, shipping_city,
        shipping_country, shipping_zip, chip_id, cpu_upgraded, memory_gb, storage_gb, unit_count,
        total_price_cents, shipping_cost_cents, tax_cents, grand_total_cents
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18
      )
      RETURNING *
    `,
    [
      id,
      input.stripePaymentIntentId ?? null,
      status,
      input.email,
      input.shippingName,
      input.shippingAddress,
      input.shippingCity,
      input.shippingCountry,
      input.shippingZip,
      input.chipId,
      input.cpuUpgraded,
      input.memoryGb,
      input.storageGb,
      input.unitCount,
      input.totalPriceCents,
      input.shippingCostCents,
      input.taxCents,
      input.grandTotalCents,
    ],
  );

  return mapOrder(res.rows[0]);
}

export async function setOrderPaymentIntent(orderId: string, paymentIntentId: string) {
  const db = getPool();
  if (!db) {
    const current = memoryOrders.get(orderId);
    if (!current) {
      return null;
    }

    const next = {
      ...current,
      stripePaymentIntentId: paymentIntentId,
      updatedAt: new Date().toISOString(),
    };
    memoryOrders.set(orderId, next);
    return next;
  }

  await ensureSchema();
  const res = await db.query(
    `
      UPDATE orders
      SET stripe_payment_intent_id = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [orderId, paymentIntentId],
  );

  return res.rows[0] ? mapOrder(res.rows[0]) : null;
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const db = getPool();
  if (!db) {
    return memoryOrders.get(orderId) ?? null;
  }

  await ensureSchema();
  const res = await db.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [orderId]);
  return res.rows[0] ? mapOrder(res.rows[0]) : null;
}

export async function markOrderPaidById(orderId: string): Promise<OrderRecord | null> {
  const db = getPool();
  if (!db) {
    const current = memoryOrders.get(orderId);
    if (!current) {
      return null;
    }

    const next: OrderRecord = {
      ...current,
      status: 'paid',
      updatedAt: new Date().toISOString(),
    };
    memoryOrders.set(orderId, next);
    return next;
  }

  await ensureSchema();
  const res = await db.query(
    `
      UPDATE orders
      SET status = 'paid', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [orderId],
  );

  return res.rows[0] ? mapOrder(res.rows[0]) : null;
}

export async function markOrderPaidByPaymentIntent(paymentIntentId: string): Promise<OrderRecord | null> {
  const db = getPool();
  if (!db) {
    for (const record of memoryOrders.values()) {
      if (record.stripePaymentIntentId === paymentIntentId) {
        const next = {
          ...record,
          status: 'paid' as const,
          updatedAt: new Date().toISOString(),
        };
        memoryOrders.set(record.id, next);
        return next;
      }
    }
    return null;
  }

  await ensureSchema();
  const res = await db.query(
    `
      UPDATE orders
      SET status = 'paid', updated_at = NOW()
      WHERE stripe_payment_intent_id = $1
      RETURNING *
    `,
    [paymentIntentId],
  );

  return res.rows[0] ? mapOrder(res.rows[0]) : null;
}

export async function decrementInventory(sku: string, amount: number) {
  if (amount <= 0) {
    return;
  }

  const db = getPool();
  if (!db) {
    const existing = memoryInventory.get(sku) ?? { sku, quantity: 100 };
    existing.quantity = Math.max(0, existing.quantity - amount);
    memoryInventory.set(sku, existing);
    return;
  }

  await ensureSchema();
  await db.query(
    `
      INSERT INTO inventory (sku, chip_id, memory_gb, storage_gb, quantity, warehouse)
      VALUES ($1, 'unknown', 0, 0, 100, 'us-west')
      ON CONFLICT (sku) DO NOTHING
    `,
    [sku],
  );

  await db.query(
    `
      UPDATE inventory
      SET quantity = GREATEST(0, quantity - $2)
      WHERE sku = $1
    `,
    [sku, amount],
  );
}
