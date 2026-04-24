import { z } from 'zod';

const CHIP_PRICING = {
  'm4-max': {
    basePrice: 1999,
    cpuUpgradePrice: 200,
    memoryUpgradePrices: { 36: 0, 48: 0, 64: 200, 128: 1000 },
    storageUpgradePrices: { 512: 0, 1024: 200, 2048: 600, 4096: 1200, 8192: 2400 },
  },
  'm3-ultra': {
    basePrice: 3999,
    cpuUpgradePrice: 1600,
    memoryUpgradePrices: { 96: 0, 256: 1600, 512: 3200 },
    storageUpgradePrices: { 1024: 0, 2048: 200, 4096: 600, 8192: 1400, 16384: 3400 },
  },
} as const;

export const checkoutRequestSchema = z.object({
  chipId: z.enum(['m4-max', 'm3-ultra']),
  cpuUpgraded: z.boolean(),
  memoryGb: z.number().int().positive(),
  storageGb: z.number().int().positive(),
  unitCount: z.number().int().min(1).max(8),
  shipping: z.object({
    name: z.string().min(1),
    email: z.email(),
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    zip: z.string().min(1),
  }),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export function getShippingQuote(country: string, unitCount: number) {
  const normalized = country.trim().toLowerCase();
  const domestic = ['united states', 'usa', 'us'];

  if (domestic.includes(normalized)) {
    const cost = unitCount >= 2 ? 0 : 150;
    return { costCents: cost * 100, carrier: 'UPS', days: '2-5' };
  }

  const cost = unitCount * 250;
  return { costCents: cost * 100, carrier: 'DHL', days: '5-9' };
}

export function calculateOrderPricing(input: CheckoutRequest) {
  const chipPricing = CHIP_PRICING[input.chipId];
  if (!chipPricing) {
    throw new Error(`Unsupported chipId: ${input.chipId}`);
  }

  const memoryCost = chipPricing.memoryUpgradePrices[input.memoryGb as keyof typeof chipPricing.memoryUpgradePrices];
  const storageCost = chipPricing.storageUpgradePrices[input.storageGb as keyof typeof chipPricing.storageUpgradePrices];

  if (memoryCost === undefined) {
    throw new Error(`Unsupported memory option for ${input.chipId}: ${input.memoryGb}`);
  }

  if (storageCost === undefined) {
    throw new Error(`Unsupported storage option for ${input.chipId}: ${input.storageGb}`);
  }

  const cpuCost = input.cpuUpgraded ? chipPricing.cpuUpgradePrice : 0;
  const unitPrice = chipPricing.basePrice + cpuCost + memoryCost + storageCost;
  const subtotalCents = unitPrice * input.unitCount * 100;
  const shipping = getShippingQuote(input.shipping.country, input.unitCount);
  const taxCents = Math.round(subtotalCents * 0.08);
  const grandTotalCents = subtotalCents + shipping.costCents + taxCents;

  return {
    subtotalCents,
    shippingCostCents: shipping.costCents,
    taxCents,
    grandTotalCents,
    shippingCarrier: shipping.carrier,
    shippingDays: shipping.days,
  };
}

export function toSku(chipId: string, memoryGb: number, storageGb: number) {
  return `${chipId}-${memoryGb}-${storageGb}`;
}
