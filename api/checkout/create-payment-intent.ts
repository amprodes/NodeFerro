import Stripe from 'stripe';
import { checkoutRequestSchema, calculateOrderPricing } from '../_lib/pricing.js';
import { createOrder, setOrderPaymentIntent } from '../_lib/store.js';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsed = checkoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const body = parsed.data;
    const pricing = calculateOrderPricing(body);

    const order = await createOrder({
      stripePaymentIntentId: null,
      status: 'pending',
      email: body.shipping.email,
      shippingName: body.shipping.name,
      shippingAddress: body.shipping.address,
      shippingCity: body.shipping.city,
      shippingCountry: body.shipping.country,
      shippingZip: body.shipping.zip,
      chipId: body.chipId,
      cpuUpgraded: body.cpuUpgraded,
      memoryGb: body.memoryGb,
      storageGb: body.storageGb,
      unitCount: body.unitCount,
      totalPriceCents: pricing.subtotalCents,
      shippingCostCents: pricing.shippingCostCents,
      taxCents: pricing.taxCents,
      grandTotalCents: pricing.grandTotalCents,
    });

    const stripe = getStripe();
    if (!stripe) {
      return res.status(200).json({
        clientSecret: `demo_${order.id}`,
        orderId: order.id,
        amountCents: pricing.grandTotalCents,
        checkoutMode: 'demo',
        message: 'Stripe is not configured. Running checkout in demo mode.',
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount: pricing.grandTotalCents,
      currency: 'usd',
      receipt_email: body.shipping.email,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        orderId: order.id,
        chipId: body.chipId,
        memoryGb: String(body.memoryGb),
        storageGb: String(body.storageGb),
        unitCount: String(body.unitCount),
      },
    });

    await setOrderPaymentIntent(order.id, intent.id);

    return res.status(200).json({
      clientSecret: intent.client_secret,
      orderId: order.id,
      amountCents: pricing.grandTotalCents,
      checkoutMode: 'payment_intent',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create payment intent';
    return res.status(500).json({ error: message });
  }
}
