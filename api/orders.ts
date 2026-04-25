import { getOrderById } from './_lib/store.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const id = typeof req.query?.id === 'string' ? req.query.id : null;
    if (!id) {
      return res.status(400).json({ error: 'Missing order id' });
    }

    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    return res.status(500).json({ error: message });
  }
}
