import { z } from 'zod';
import { getShippingQuote } from '../_lib/pricing';

const schema = z.object({
  country: z.string().min(1),
  unitCount: z.number().int().min(1).max(8),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const quote = getShippingQuote(parsed.data.country, parsed.data.unitCount);
    return res.status(200).json({
      cost: Math.round(quote.costCents / 100),
      carrier: quote.carrier,
      days: quote.days,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get shipping quote';
    return res.status(500).json({ error: message });
  }
}
