import Stripe from 'stripe';
import { Resend } from 'resend';
import { z } from 'zod';
import { decrementInventory, getOrderById, markOrderPaidById, markOrderPaidByPaymentIntent } from '../_lib/store';
import { toSku } from '../_lib/pricing';

const manualConfirmSchema = z.object({
  orderId: z.uuid().optional(),
  paymentIntentId: z.string().min(1).optional(),
});

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
}

async function sendConfirmationEmail(to: string, orderId: string, totalCents: number) {
  if (!process.env.RESEND_API_KEY) {
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL || 'NodeFerro <orders@nodeferro.ai>',
    to,
    subject: `NodeFerro order confirmed: ${orderId}`,
    html: `<p>Your NodeFerro order is confirmed.</p><p>Order ID: ${orderId}</p><p>Total: $${(totalCents / 100).toFixed(2)}</p>`,
  });
}

async function finalizeOrderById(orderId: string) {
  const updated = await markOrderPaidById(orderId);
  if (!updated) {
    return null;
  }

  const sku = toSku(updated.chipId, updated.memoryGb, updated.storageGb);
  await decrementInventory(sku, updated.unitCount);
  await sendConfirmationEmail(updated.email, updated.id, updated.grandTotalCents);

  return updated;
}

async function finalizeOrderByPaymentIntent(paymentIntentId: string) {
  const updated = await markOrderPaidByPaymentIntent(paymentIntentId);
  if (!updated) {
    return null;
  }

  const sku = toSku(updated.chipId, updated.memoryGb, updated.storageGb);
  await decrementInventory(sku, updated.unitCount);
  await sendConfirmationEmail(updated.email, updated.id, updated.grandTotalCents);

  return updated;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['stripe-signature'];
    const stripe = getStripe();

    if (signature && stripe && process.env.STRIPE_WEBHOOK_SECRET) {
      const event = stripe.webhooks.constructEvent(
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const order = await finalizeOrderByPaymentIntent(intent.id);
        return res.status(200).json({ ok: true, orderId: order?.id ?? null });
      }

      return res.status(200).json({ ok: true, ignored: event.type });
    }

    const parsed = manualConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    if (parsed.data.orderId) {
      const order = await finalizeOrderById(parsed.data.orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json({ ok: true, orderId: order.id, status: order.status });
    }

    if (parsed.data.paymentIntentId) {
      const order = await finalizeOrderByPaymentIntent(parsed.data.paymentIntentId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json({ ok: true, orderId: order.id, status: order.status });
    }

    return res.status(400).json({ error: 'Provide orderId or paymentIntentId' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm checkout';
    return res.status(500).json({ error: message });
  }
}
