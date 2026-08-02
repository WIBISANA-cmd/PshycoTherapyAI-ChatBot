// Komponen animasi kecil, pola dari reactbits.dev — disalin lokal supaya
// tidak menambah dependency (reactbits memang didesain untuk di-copy).
import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Teks yang tersingkap baris demi baris dari balik mask saat masuk viewport. */
export function SplitReveal({ as: Tag = 'p', type = 'lines', delay = 0, className = '', children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let split;
    const ctx = gsap.context(() => {
      split = new SplitText(el, {
        type: `${type},lines`,
        linesClass: 'sr-line',
        mask: 'lines',
      });
      gsap.from(split[type], {
        yPercent: 125, // > tinggi baris + overflow-clip-margin, biar tidak bocor
        rotate: type === 'chars' ? 6 : 3,
        opacity: 0,
        duration: 1,
        delay,
        ease: 'expo.out',
        stagger: type === 'chars' ? 0.018 : 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [type, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Angka yang menghitung naik sekali saat terlihat. */
export function CountUp({ to, suffix = '', className = '' }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.textContent = to.toLocaleString('id-ID') + suffix;
      return;
    }
    const o = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(o, {
        v: to,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => {
          el.textContent = Math.round(o.v).toLocaleString('id-ID') + suffix;
        },
      });
    }, el);
    return () => ctx.revert();
  }, [to, suffix]);

  return <span ref={ref} className={className}>0{suffix}</span>;
}

/** Elemen yang "ditarik" ke arah kursor. Nonaktif di perangkat sentuh. */
export function Magnetic({ strength = 0.35, className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia('(hover: hover)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`} {...rest}>
      {children}
    </span>
  );
}

/** Kartu yang miring mengikuti kursor (3D tilt). */
export function TiltCard({ className = '', children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia('(hover: hover)').matches) return;
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      rx((0.5 - (e.clientY - r.top) / r.height) * 12);
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
    };
    const reset = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}

/** Pita teks berjalan tanpa henti — CSS murni, tanpa JS per-frame. */
export function Marquee({ items, speed = 40, reverse = false, className = '' }) {
  return (
    <div className={`marquee ${className}`} aria-hidden>
      <div
        className="marquee__track"
        style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {[0, 1].map((k) => (
          <span key={k} className="marquee__group">
            {items.map((it, i) => (
              <span key={i} className="marquee__item">
                {it}
                <i className="marquee__dot" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Foto yang di-reveal lewat clip-path saat discroll. */
export function RevealImage({ src, alt, className = '', imgClass = '', speed }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        clipPath: 'inset(100% 0% 0% 0%)',
        scale: 1.15,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <figure ref={ref} className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        data-speed={speed}
        className={`h-full w-full object-cover ${imgClass}`}
      />
    </figure>
  );
}

/** Kursor lingkaran lembut yang mengikuti pointer (desktop saja). */
export function SoftCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    el.style.display = 'block';
    gsap.set(el, { x: -500, y: -500 }); // parkir di luar layar sampai pointer bergerak
    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });
    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return <div ref={ref} className="soft-cursor" style={{ display: 'none' }} aria-hidden />;
}
