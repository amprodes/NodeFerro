import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { t } = useAppContext();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-panel',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" ref={sectionRef} style={{ background: '#0c0a09', padding: '140px 0', position: 'relative' }}>
      {/* Decorative line */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, #c9a96e)' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b7355', marginBottom: '16px' }}>
            {t('nav.contact')}
          </p>
          <h2 style={{ fontSize: '56px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#e8e2d9', margin: 0 }}>
            {t('contact.title')}
          </h2>
          <p style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6, color: '#9c948a', maxWidth: '500px', margin: '16px auto 0' }}>
            {t('contact.subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Left: Contact Info */}
          <div>
            {/* Phone - highlighted */}
            <div className="contact-panel" style={{
              padding: '32px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px',
              marginBottom: '16px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(201,169,110,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,169,110,0.2)',
                }}>
                  <Phone size={18} color="#c9a96e" />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('contact.callUs')}</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#c9a96e', margin: '4px 0 0 0', letterSpacing: '0.02em' }}>
                    {t('contact.phone')}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#9c948a', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {t('contact.phoneDesc')}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', background: '#0c0a09', borderRadius: '2px', color: '#8b7355' }}>{t('contact.hours')}</span>
                <span style={{ fontSize: '11px', padding: '4px 10px', background: '#0c0a09', borderRadius: '2px', color: '#8b7355' }}>{t('contact.wait')}</span>
              </div>
            </div>

            {/* Email */}
            <div className="contact-panel" style={{
              padding: '24px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(201,169,110,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={18} color="#c9a96e" />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>{t('contact.email')}</p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{t('contact.emailAddr')}</p>
              </div>
            </div>

            {/* Location */}
            <div className="contact-panel" style={{
              padding: '24px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(201,169,110,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPin size={18} color="#c9a96e" />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>{t('contact.showroom')}</p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{t('contact.locations')}</p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-panel" style={{ padding: '32px', background: '#161412', border: '1px solid #2a2522', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <MessageSquare size={18} color="#c9a96e" />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#e8e2d9', margin: 0 }}>{t('contact.formTitle')}</h3>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: '#1a2f1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Sparkles size={24} color="#7cb87c" />
                </div>
                <p style={{ fontSize: '18px', fontWeight: 600, color: '#7cb87c', margin: '0 0 8px 0' }}>{t('contact.sent')}</p>
                <p style={{ fontSize: '14px', color: '#9c948a', margin: 0 }}>{t('contact.response')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('contact.name')}</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('contact.name')}
                    style={{
                      width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                      color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('contact.emailLabel')}</label>
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@company.com"
                    style={{
                      width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                      color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('contact.whatBuilding')}</label>
                  <textarea
                    required value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('contact.placeholder')}
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 14px', background: '#0c0a09', border: '1px solid #2a2522', borderRadius: '4px',
                      color: '#e8e2d9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button type="submit" style={{
                  width: '100%', padding: '14px', background: '#c9a96e', color: '#0c0a09', border: 'none', borderRadius: '4px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e8c78a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#c9a96e'; }}
                >
                  {t('contact.send')} <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
