import { useMemo, useState } from 'react';
import { X, CreditCard, Truck, Globe, Package, CheckCircle2, MapPin, Mail, User } from 'lucide-react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAppContext } from '../hooks/useAppContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    chipId: string;
    chipName: string;
    cpuCores: number;
    gpuCores: number;
    memoryGB: number;
    storageGB: number;
    unitCount: number;
    totalPrice: number;
  } | null;
  selectedCare?: string | null;
  carePrice?: number;
}

interface CheckoutSession {
  clientSecret: string;
  orderId: string;
  amountCents: number;
  checkoutMode: 'demo' | 'payment_intent';
}

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Netherlands',
  'Australia', 'Japan', 'South Korea', 'Singapore', 'UAE', 'Saudi Arabia',
  'Brazil', 'Mexico', 'India', 'China', 'Sweden', 'Norway', 'Switzerland',
  'Italy', 'Spain', 'Poland', 'Israel', 'Turkey', 'Thailand', 'Malaysia',
];

interface StripeElementFormProps {
  orderId: string;
  apiUrl: (path: string) => string;
  amountLabel: string;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

function StripeElementForm({ orderId, apiUrl, amountLabel, onSuccess, onError }: StripeElementFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    onError('');

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        onError(result.error.message || 'Payment could not be completed.');
        return;
      }

      const paymentIntentId = result.paymentIntent?.id;
      if (!paymentIntentId) {
        onError('Payment intent was not returned by Stripe.');
        return;
      }

      const confirmRes = await fetch(apiUrl('/api/checkout/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });
      const confirmData = await confirmRes.json();

      if (!confirmRes.ok || !confirmData.ok) {
        onError(confirmData?.error || 'Order confirmation failed after payment.');
        return;
      }

      onSuccess(orderId);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{
        padding: '14px',
        background: '#0c0a09',
        borderRadius: '4px',
        border: '1px solid #2a2522',
      }}>
        <PaymentElement />
      </div>

      <button
        onClick={handleSubmit}
        disabled={processing || !stripe || !elements}
        style={{
          width: '100%',
          padding: '16px',
          background: processing ? '#1c1a17' : '#c9a96e',
          color: processing ? '#8b7355' : '#0c0a09',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: processing ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s ease',
        }}
      >
        {processing ? (
          <><span style={{ width: '16px', height: '16px', border: '2px solid #8b7355', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />Processing...</>
        ) : (
          <><CreditCard size={18} />Pay Securely - {amountLabel}</>
        )}
      </button>
    </div>
  );
}

export default function CheckoutModal({ isOpen, onClose, config, selectedCare, carePrice = 0 }: CheckoutModalProps) {
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [shipping, setShipping] = useState({ name: '', email: '', address: '', city: '', country: 'United States', zip: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shippingQuote, setShippingQuote] = useState<{ cost: number; carrier: string; days: string } | null>(null);
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);
  const [paymentSession, setPaymentSession] = useState<CheckoutSession | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const { t, formatPrice } = useAppContext();

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  const stripePromise = useMemo(() => {
    if (!stripePublishableKey) {
      return null;
    }

    return loadStripe(stripePublishableKey);
  }, [stripePublishableKey]);

  if (!isOpen || !config) return null;

  const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBase}${path}`;

  const subtotal = config.totalPrice;
  const shippingCost = shippingQuote ? shippingQuote.cost : subtotal > 5000 ? 0 : 150;
  const tax = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + shippingCost + tax;

  const formatStorage = (n: number) => n >= 1024 ? `${n / 1024}TB` : `${n}GB`;

  const createCheckoutSession = async () => {
    const createRes = await fetch(apiUrl('/api/checkout/create-payment-intent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chipId: config.chipId,
        cpuUpgraded: config.cpuCores > (config.chipId === 'm4-max' ? 14 : 28),
        memoryGb: config.memoryGB,
        storageGb: config.storageGB,
        unitCount: config.unitCount,
        shipping,
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      throw new Error(createData?.error || 'Unable to create payment intent.');
    }

    const session: CheckoutSession = {
      clientSecret: createData.clientSecret,
      orderId: createData.orderId,
      amountCents: createData.amountCents,
      checkoutMode: createData.checkoutMode,
    };

    setPaymentSession(session);
    return session;
  };

  const handleDemoPayment = async () => {
    if (!paymentSession) {
      return;
    }

    setErrorMessage(null);
    setInitializingPayment(true);

    try {
      const confirmRes = await fetch(apiUrl('/api/checkout/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paymentSession.orderId }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || !confirmData.ok) {
        throw new Error(confirmData?.error || 'Unable to confirm order.');
      }
      setPaidOrderId(paymentSession.orderId);
      setStep('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Demo checkout failed.');
    } finally {
      setInitializingPayment(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(12px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="checkout-modal" style={{
        width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        background: '#161412', border: '1px solid #2a2522', borderRadius: '8px',
        position: 'relative',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #2a2522',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
              {step === 'success' ? t('checkout.orderComplete') : t('checkout.title')}
            </p>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>
              {step === 'success' ? t('checkout.thankYou') : t('checkout.title')}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '4px', background: '#0c0a09',
            border: '1px solid #2a2522', color: '#9c948a', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={18} />
          </button>
        </div>

        {step === 'shipping' && (
          <div style={{ padding: '24px' }}>
            <div style={{
              padding: '16px', background: '#0c0a09', borderRadius: '4px', border: '1px solid #1c1a17',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Package size={14} color="#c9a96e" />
                <span style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('checkout.yourConfig')}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#e8e2d9', margin: '0 0 4px 0' }}>
                {config.chipName} · {config.cpuCores}-core CPU · {config.gpuCores}-core GPU
              </p>
              <p style={{ fontSize: '13px', color: '#9c948a', margin: 0 }}>
                {formatStorage(config.memoryGB)} Memory · {formatStorage(config.storageGB)} SSD
                {config.unitCount > 1 ? ` · ${config.unitCount} units` : ''}
              </p>
              {carePrice > 0 && (
                <p style={{ fontSize: '12px', color: '#c9a96e', margin: '4px 0 0 0' }}>
                  + {selectedCare === 'plus' ? 'NodeFerro Care+' : 'NodeFerro Care Pro'} — {formatPrice(carePrice)}/yr
                </p>
              )}
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#c9a96e', margin: '8px 0 0 0' }}>
                {formatPrice(config.totalPrice)}
                {carePrice > 0 && <span style={{ fontSize: '13px', fontWeight: 400 }}> + {formatPrice(carePrice)}/yr care</span>}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <User size={10} style={{ display: 'inline', marginRight: '4px' }} />{t('checkout.fullName')}
                </label>
                <input
                  type="text" value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  placeholder="John Doe"
                  style={{
                    width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                    color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <Mail size={10} style={{ display: 'inline', marginRight: '4px' }} />{t('contact.emailLabel')}
                </label>
                <input
                  type="email" value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  placeholder="john@company.com"
                  style={{
                    width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                    color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />{t('checkout.address')}
                </label>
                <input
                  type="text" value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="123 Innovation Drive"
                  style={{
                    width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                    color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{t('checkout.city')}</label>
                  <input
                    type="text" value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="San Francisco"
                    style={{
                      width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                      color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{t('checkout.zip')}</label>
                  <input
                    type="text" value={shipping.zip}
                    onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    placeholder="94105"
                    style={{
                      width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                      color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <Globe size={10} style={{ display: 'inline', marginRight: '4px' }} />{t('checkout.country')}
                </label>
                <select
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                    color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    appearance: 'none',
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} style={{ background: '#0c0a09', color: '#e8e2d9' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div style={{
                padding: '12px 14px', background: '#2f1a1a', borderRadius: '4px', border: '1px solid #c47070',
                marginTop: '16px',
              }}>
                <p style={{ fontSize: '12px', color: '#f1c5c5', margin: 0 }}>{errorMessage}</p>
              </div>
            )}

            <button
              onClick={async () => {
                setErrorMessage(null);
                setInitializingPayment(true);
                try {
                  const quoteRes = await fetch(apiUrl('/api/shipping/quote'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: shipping.country, unitCount: config.unitCount }),
                  });
                  const quoteData = await quoteRes.json();
                  if (quoteRes.ok) {
                    setShippingQuote(quoteData);
                  }

                  await createCheckoutSession();
                  setStep('payment');
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : 'Unable to initialize checkout.');
                } finally {
                  setInitializingPayment(false);
                }
              }}
              disabled={!shipping.name || !shipping.email || !shipping.address || initializingPayment}
              style={{
                width: '100%', padding: '14px', marginTop: '24px', background: (!shipping.name || !shipping.email || !shipping.address || initializingPayment) ? '#1c1a17' : '#c9a96e',
                color: (!shipping.name || !shipping.email || !shipping.address || initializingPayment) ? '#8b7355' : '#0c0a09', border: 'none', borderRadius: '4px',
                fontSize: '15px', fontWeight: 700, cursor: (!shipping.name || !shipping.email || !shipping.address || initializingPayment) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {initializingPayment ? 'Preparing Checkout...' : <>{t('checkout.continue')} <ChevronRight /></>}
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div style={{ padding: '24px' }}>
            <div style={{
              padding: '16px', background: '#0c0a09', borderRadius: '4px', border: '1px solid #1c1a17',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#9c948a' }}>{config.chipName} x {config.unitCount}</span>
                <span style={{ fontSize: '13px', color: '#e8e2d9' }}>{formatPrice(config.totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#9c948a' }}><Truck size={12} style={{ display: 'inline', marginRight: '4px' }} />{t('checkout.shipping')} ({shipping.country})</span>
                <span style={{ fontSize: '13px', color: shippingCost === 0 ? '#7cb87c' : '#e8e2d9' }}>{shippingCost === 0 ? t('checkout.free') : formatPrice(shippingCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#9c948a' }}>{t('checkout.tax')}</span>
                <span style={{ fontSize: '13px', color: '#e8e2d9' }}>{formatPrice(tax)}</span>
              </div>
              <div style={{ borderTop: '1px solid #2a2522', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e8e2d9' }}>{t('checkout.total')}</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#c9a96e' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div style={{
              padding: '14px', background: '#0c0a09', borderRadius: '4px', border: '1px solid #1c1a17',
              marginBottom: '24px',
            }}>
              <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>{t('checkout.shippingTo')}</p>
              <p style={{ fontSize: '13px', color: '#e8e2d9', margin: 0 }}>{shipping.name}</p>
              <p style={{ fontSize: '13px', color: '#9c948a', margin: '2px 0 0 0' }}>{shipping.address}, {shipping.city} {shipping.zip}</p>
              <p style={{ fontSize: '13px', color: '#9c948a', margin: '2px 0 0 0' }}>{shipping.country}</p>
            </div>

            {errorMessage && (
              <div style={{
                padding: '12px 14px', background: '#2f1a1a', borderRadius: '4px', border: '1px solid #c47070',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '12px', color: '#f1c5c5', margin: 0 }}>{errorMessage}</p>
              </div>
            )}

            {!paymentSession && (
              <div style={{
                padding: '12px 14px', background: '#2f1a1a', borderRadius: '4px', border: '1px solid #c47070',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '12px', color: '#f1c5c5', margin: 0 }}>Checkout session is missing. Please go back and try again.</p>
              </div>
            )}

            {paymentSession?.checkoutMode === 'demo' && (
              <button
                onClick={handleDemoPayment}
                disabled={initializingPayment}
                style={{
                  width: '100%', padding: '16px', background: initializingPayment ? '#1c1a17' : '#c9a96e',
                  color: initializingPayment ? '#8b7355' : '#0c0a09', border: 'none', borderRadius: '4px',
                  fontSize: '16px', fontWeight: 700, cursor: initializingPayment ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                {initializingPayment ? 'Processing...' : <><CreditCard size={18} />{t('checkout.payStripe')} - {formatPrice(grandTotal)}</>}
              </button>
            )}

            {paymentSession?.checkoutMode === 'payment_intent' && !stripePromise && (
              <div style={{
                padding: '12px 14px', background: '#2f1a1a', borderRadius: '4px', border: '1px solid #c47070',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '12px', color: '#f1c5c5', margin: 0 }}>Set VITE_STRIPE_PUBLISHABLE_KEY to enable live card payments.</p>
              </div>
            )}

            {paymentSession?.checkoutMode === 'payment_intent' && stripePromise && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentSession.clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#c9a96e',
                      colorBackground: '#0c0a09',
                      colorText: '#e8e2d9',
                      borderRadius: '4px',
                    },
                  },
                }}
              >
                <StripeElementForm
                  orderId={paymentSession.orderId}
                  apiUrl={apiUrl}
                  amountLabel={formatPrice(grandTotal)}
                  onError={(message) => setErrorMessage(message || null)}
                  onSuccess={(orderId) => {
                    setPaidOrderId(orderId);
                    setStep('success');
                  }}
                />
              </Elements>
            )}

            <p style={{ fontSize: '11px', color: '#8b7355', textAlign: 'center', margin: '16px 0 0 0' }}>
              {t('checkout.encrypted')}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: '#1a2f1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              border: '1px solid #2a4a2a',
            }}>
              <CheckCircle2 size={32} color="#7cb87c" />
            </div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#7cb87c', margin: '0 0 8px 0' }}>{t('checkout.success')}</p>
            <p style={{ fontSize: '14px', color: '#9c948a', margin: '0 0 24px 0' }}>
              {t('checkout.tracking')}
            </p>
            <div style={{
              padding: '16px', background: '#0c0a09', borderRadius: '4px', border: '1px solid #1c1a17',
              textAlign: 'left', marginBottom: '24px',
            }}>
              <p style={{ fontSize: '12px', color: '#8b7355', margin: '0 0 8px 0' }}>Order Summary</p>
              <p style={{ fontSize: '14px', color: '#e8e2d9', margin: '0 0 4px 0' }}>{config.chipName} x {config.unitCount}</p>
              {paidOrderId && <p style={{ fontSize: '12px', color: '#8b7355', margin: '0 0 4px 0' }}>Order ID: {paidOrderId}</p>}
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#c9a96e', margin: '8px 0 0 0' }}>{formatPrice(grandTotal)}</p>
            </div>
            <button
              onClick={() => {
                setStep('shipping');
                setErrorMessage(null);
                setShippingQuote(null);
                setPaymentSession(null);
                onClose();
              }}
              style={{
                padding: '12px 32px', background: 'transparent', border: '1px solid #2a2522', borderRadius: '4px',
                color: '#9c948a', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
