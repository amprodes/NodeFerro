import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAppContext } from '../hooks/useAppContext';

gsap.registerPlugin(ScrollTrigger);

const IMAGES = [
  { src: '/mac-hero.jpg', labelEn: 'Mac Studio', labelEs: 'Mac Studio', aspect: 'wide' },
  { src: '/mac-top.jpg', labelEn: 'Thermal Architecture', labelEs: 'Arquitectura Termica', aspect: 'square' },
  { src: '/mac-rack.jpg', labelEn: 'Rack Cluster', labelEs: 'Cluster en Rack', aspect: 'wide' },
  { src: '/mac-dual.jpg', labelEn: 'Dual Configuration', labelEs: 'Configuracion Dual', aspect: 'wide' },
  { src: '/mac-ports.jpg', labelEn: 'Connectivity', labelEs: 'Conectividad', aspect: 'tall' },
  { src: '/mac-hex-cluster.jpg', labelEn: 'Compute Cluster', labelEs: 'Cluster de Computo', aspect: 'wide' },
  { src: '/mac-workspace.jpg', labelEn: 'AI Workspace', labelEs: 'Espacio de IA', aspect: 'wide' },
  { src: '/mac-cluster.jpg', labelEn: 'Data Center', labelEs: 'Centro de Datos', aspect: 'tall' },
];

export default function ChronosGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { locale } = useAppContext();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const totalScrollWidth = track.scrollWidth - window.innerWidth;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${totalScrollWidth}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(track, { x: -totalScrollWidth * progress });
        cards.forEach((card, i) => {
          const cardStart = i / cards.length;
          const cardEnd = (i + 1) / cards.length;
          const localProgress = (progress - cardStart) / (cardEnd - cardStart);
          const clampedProgress = Math.max(0, Math.min(1, localProgress));
          const eased = clampedProgress < 0.5 ? 4 * clampedProgress * clampedProgress * clampedProgress : 1 - Math.pow(-2 * clampedProgress + 2, 3) / 2;
          const img = card.querySelector('img') as HTMLElement;
          if (img) {
            gsap.set(img, { rotateY: -55 * (1 - eased), scale: 0.85 + 0.15 * eased, filter: `brightness(${0.4 + 0.6 * eased})` });
          }
        });
      },
    });
    return () => { st.kill(); };
  }, []);

  return (
    <section ref={sectionRef} style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0c0a09' }}>
      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b7355', margin: 0 }}>
          {locale === 'es' ? 'Arquitectura de Hardware' : 'Hardware Architecture'}
        </p>
      </div>
      <div ref={trackRef} style={{ display: 'flex', gap: '60px', padding: '0 20vw', height: '100%', alignItems: 'center', willChange: 'transform' }}>
        {IMAGES.map((item, i) => (
          <div key={item.src} ref={(el) => { cardsRef.current[i] = el; }}
            style={{ width: item.aspect === 'wide' ? '560px' : item.aspect === 'square' ? '420px' : '340px', height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', perspective: '1000px', transformStyle: 'preserve-3d' }}>
            <div style={{ width: '100%', height: '70vh', position: 'relative', transformStyle: 'preserve-3d' }}>
              <img src={item.src} alt={locale === 'es' ? item.labelEs : item.labelEn} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', transform: 'rotateY(-55deg)', transformOrigin: 'left center', willChange: 'transform, filter', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} />
            </div>
            <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8b7355', marginTop: '24px' }}>
              {locale === 'es' ? item.labelEs : item.labelEn}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
