import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import Logo from '../components/Logo';
import { SplitReveal, CountUp, Magnetic, TiltCard, Marquee, RevealImage, SoftCursor } from './bits';
import { img, faces } from './media';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const CHAT_HREF = '#/chat';
const NAV = [
  ['Kenapa ada', '#kenapa'],
  ['Yang bisa', '#fitur'],
  ['Caranya', '#cara'],
  ['Aman?', '#aman'],
];

/* ------------------------------------------------------------------ shell */

export default function Landing() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        ScrollSmoother.get()?.kill();
        ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: 1.15,
          smoothTouch: 0, // di HP biarkan scroll native — lebih enak & hemat baterai
          effects: true, // mengaktifkan data-speed / data-lag = parallax
          normalizeScroll: false,
        });
      }

      // Garis bawah tulisan tangan pada kata kunci
      gsap.utils.toArray('.underline-hand').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 82%',
          onEnter: () => el.classList.add('is-on'),
        });
      });

      // Header berubah begitu hero terlewat
      ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => document.body.classList.toggle('is-scrolled', self.scroll() > 80),
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollSmoother.get()?.kill();
    };
  }, []);

  return (
    <div ref={root} className="bg-paper text-ink">
      <SoftCursor />
      <Nav />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Hero />
            <FeelingBand />
            <NotAlone />
            <Features />
            <How />
            <Voices />
            <Safety />
            <FinalCta />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- potongan  */

function Eyebrow({ n, children }) {
  return (
    <div className="mb-6 flex items-center gap-4 text-[0.7rem] font-semibold tracking-[0.28em] text-ink-soft uppercase">
      <span className="text-clay">{n}</span>
      <span className="h-px w-10 bg-ink/20" />
      <span>{children}</span>
    </div>
  );
}

/** Loncat halus ke seksi, lewat ScrollSmoother kalau aktif. */
function jumpTo(e, href, after) {
  e.preventDefault();
  after?.();
  const el = document.querySelector(href);
  if (!el) return;
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(el, true, 'top 72px');
  else el.scrollIntoView({ behavior: 'smooth' });
}

function Nav() {
  const [open, setOpen] = useState(false);
  const go = (e, href) => jumpTo(e, href, () => setOpen(false));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="nav-shell mx-auto flex max-w-352 items-center gap-4 px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <Logo className="size-10" />
          <span className="font-display text-xl leading-none">
            Shy<span className="text-clay italic">Ther</span>AI
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-8 md:flex">
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => go(e, href)}
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <Magnetic className="ml-auto md:ml-0">
          <a
            href={CHAT_HREF}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-clay"
          >
            Mulai<span className="hidden sm:inline"> bercerita</span>
            <span aria-hidden>→</span>
          </a>
        </Magnetic>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu"
          aria-expanded={open}
          className="rounded-full border border-ink/15 px-3 py-2 text-sm md:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="mx-5 rounded-2xl border border-ink/10 bg-paper/95 p-2 shadow-xl backdrop-blur md:hidden">
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => go(e, href)}
              className="block rounded-xl px-4 py-3 text-ink-soft transition hover:bg-ink/5"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------- hero */

function Hero() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-photo', {
        yPercent: 12,
        opacity: 0,
        scale: 1.06,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.15,
      });
      gsap.from('.hero-chip', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.1,
        delay: 0.9,
      });
      // Hero perlahan tenggelam saat discroll
      gsap.to('.hero-type', {
        yPercent: -14,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="grain relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-40">
      {/* Aura biru lembut di belakang tipografi */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-[38rem] rounded-full bg-sky-300/30 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-24 size-[30rem] rounded-full bg-clay-soft/40 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-352 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="hero-type lg:col-span-7">
          <p className="mb-8 max-w-xs text-sm leading-relaxed text-ink-soft">
            <span className="mr-2 inline-block size-2 translate-y-px rounded-full bg-sky-500" />
            Ruang aman untuk bercerita — tanpa akun, tanpa jejak, kapan pun kamu butuh.
          </p>

          <h1 className="font-display text-[clamp(3.2rem,10.5vw,8.5rem)] leading-[0.86] tracking-tight">
            <SplitReveal as="span" type="chars" className="block">
              Ceritakan
            </SplitReveal>
            <SplitReveal as="span" type="chars" delay={0.08} className="block pl-[0.06em] text-clay italic">
              yang berat
            </SplitReveal>
            <SplitReveal as="span" type="chars" delay={0.16} className="block">
              hari ini.
            </SplitReveal>
          </h1>

          <SplitReveal className="mt-8 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            Ketik, kirim pesan suara, atau tempel screenshot chat. Semuanya dipahami — lalu
            dijawab pelan-pelan, tanpa menghakimi.
          </SplitReveal>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.4}>
              <a
                href={CHAT_HREF}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[0.95rem] font-semibold text-paper transition hover:bg-clay"
              >
                Mulai bercerita
                <span className="grid size-6 place-items-center rounded-full bg-paper/15 transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Magnetic>
            <a
              href="#cara"
              onClick={(e) => jumpTo(e, '#cara')}
              className="text-sm text-ink-soft underline decoration-ink/25 underline-offset-4 transition hover:text-ink"
            >
              Lihat cara kerjanya
            </a>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-ink-soft/70">
            Gratis. Tidak ada login, tidak ada database — percakapanmu tidak disimpan di server.
          </p>
        </div>

        {/* Kolase foto parallax */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto h-[26rem] w-full max-w-md sm:h-[32rem] lg:h-[38rem] lg:max-w-none">
            <figure
              data-speed="0.92"
              className="hero-photo group absolute top-0 right-0 h-[68%] w-[74%] overflow-hidden rounded-[1.6rem] shadow-2xl shadow-ink/20"
            >
              <img
                src={img.heroMain}
                alt="Potret seseorang yang sedang tenang dalam cahaya biru"
                className="photo-tone h-full w-full object-cover"
                fetchPriority="high"
              />
            </figure>
            <figure
              data-speed="1.18"
              className="hero-photo group absolute bottom-0 left-0 h-[46%] w-[52%] overflow-hidden rounded-[1.4rem] shadow-xl shadow-ink/20"
            >
              <img
                src={img.heroSide}
                alt="Seseorang berhoodie bersandar di dinding biru"
                className="photo-tone h-full w-full object-cover"
                loading="lazy"
              />
            </figure>
            <figure
              data-speed="1.35"
              className="hero-photo group absolute right-[6%] bottom-[8%] h-[30%] w-[34%] overflow-hidden rounded-[1.2rem] shadow-xl shadow-ink/20"
            >
              <img
                src={img.heroSmall}
                alt="Close-up wajah dengan latar hangat"
                className="photo-tone h-full w-full object-cover"
                loading="lazy"
              />
            </figure>

            {/* Gelembung chat mengambang */}
            <div
              data-speed="1.5"
              className="hero-chip absolute top-[8%] -left-2 max-w-[13rem] rounded-2xl rounded-bl-md bg-white/90 px-4 py-3 text-[0.82rem] leading-snug text-ink shadow-lg shadow-ink/10 backdrop-blur sm:-left-6"
            >
              “Aku capek banget, tapi nggak tahu harus cerita ke siapa.”
            </div>
            <div
              data-speed="1.28"
              className="hero-chip absolute -right-2 bottom-[42%] max-w-[12rem] rounded-2xl rounded-br-md bg-sky-500 px-4 py-3 text-[0.82rem] leading-snug text-white shadow-lg shadow-sky-500/30 sm:-right-6"
            >
              “Nggak apa-apa. Aku di sini. Mau mulai dari bagian yang paling berat?”
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-3 px-5 text-[0.7rem] tracking-[0.28em] text-ink-soft/60 uppercase sm:px-8">
        <span className="h-px flex-1 bg-ink/10" />
        Scroll pelan-pelan
        <span aria-hidden className="animate-bounce">↓</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- pita perasaan    */

const FEELINGS = [
  'overthinking jam 2 pagi',
  'burnout',
  'cemas tanpa sebab',
  'insecure',
  'capek pura-pura baik-baik saja',
  'kesepian di tengah ramai',
  'takut mengecewakan',
  'susah tidur',
];

function FeelingBand() {
  return (
    <section className="border-y border-ink/10 bg-ink py-5 text-paper">
      <Marquee items={FEELINGS} speed={44} className="font-display text-[clamp(1.4rem,3.4vw,2.4rem)] italic" />
    </section>
  );
}

/* --------------------------------------------------------- 01 tidak sendiri */

const STATS = [
  { to: 24, suffix: '/7', label: 'Selalu buka. Termasuk jam-jam yang sepi.' },
  { to: 3, suffix: '', label: 'Cara bercerita: teks, suara, screenshot.' },
  { to: 0, suffix: '', label: 'Akun, form, dan data yang disimpan.' },
];

function NotAlone() {
  return (
    <section id="kenapa" className="grain relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-352 px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow n="01">Kenapa ini ada</Eyebrow>
            <SplitReveal
              as="h2"
              className="font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[0.98]"
            >
              Yang paling sulit bukan masalahnya. Tapi <span className="underline-hand">memulai kalimat pertama.</span>
            </SplitReveal>
            <SplitReveal className="mt-7 max-w-md leading-relaxed text-ink-soft">
              Cerita sering tertahan karena takut merepotkan, takut dinilai, atau sekadar karena
              jam tiga pagi tidak ada yang bisa dihubungi. Di sini kalimat pertama boleh
              berantakan — tidak ada yang menilai.
            </SplitReveal>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-[clamp(2rem,4vw,3rem)] leading-none text-clay">
                    <CountUp to={s.to} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-3 text-[0.78rem] leading-snug text-ink-soft">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <RevealImage
                src={img.night}
                alt="Langit malam berbintang"
                speed="0.9"
                className="col-span-2 aspect-[16/9] rounded-[1.4rem]"
                imgClass="photo-tone"
              />
              <RevealImage
                src={img.bridge}
                alt="Jembatan kayu menuju hutan"
                speed="1.1"
                className="aspect-4/5 rounded-[1.4rem]"
                imgClass="photo-tone"
              />
              <div className="flex flex-col justify-between gap-4 sm:gap-5">
                <RevealImage
                  src={img.mindful}
                  alt="Tulisan tangan bertuliskan mindfulness"
                  speed="1.05"
                  className="aspect-square rounded-[1.4rem]"
                  imgClass="photo-tone"
                />
                <blockquote className="rounded-[1.4rem] bg-ink p-6 text-paper">
                  <p className="font-display text-xl leading-snug italic">
                    “Kamu tidak harus baik-baik saja dulu untuk boleh bercerita.”
                  </p>
                </blockquote>
              </div>
            </div>

            {/* Wajah-wajah: manusia biasa, bukan avatar ilustrasi */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {faces.slice(0, 5).map((f) => (
                  <img
                    key={f.src}
                    src={f.src}
                    alt=""
                    loading="lazy"
                    className="size-11 rounded-full border-2 border-paper object-cover"
                  />
                ))}
              </div>
              <p className="text-sm leading-snug text-ink-soft">
                Dibuat untuk siapa pun yang sedang menahan sesuatu sendirian.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 02 fitur   */

const FEATURES = [
  {
    n: '01',
    title: 'Ngobrol biasa',
    body: 'Jawaban mengalir kata demi kata, seperti sedang diketik sungguhan. Tidak ada balasan template.',
    img: img.featTalk,
    alt: 'Potret seseorang dengan pencahayaan lembut',
  },
  {
    n: '02',
    title: 'Pesan suara',
    body: 'Rekam langsung dari browser. Yang didengar bukan cuma isi ceritanya, tapi juga nadanya — kalau terdengar berat, itu akan diakui.',
    img: img.featVoice,
    alt: 'Potret seseorang dengan latar gelap',
  },
  {
    n: '03',
    title: 'Screenshot chat',
    body: 'Tempel dengan Ctrl/Cmd + V. Yang dibaca dinamika percakapannya — bukan menghakimi lawan bicaramu.',
    img: img.featImage,
    alt: 'Buku catatan, pena, dan kacamata di atas meja',
  },
  {
    n: '04',
    title: 'Jaring pengaman',
    body: 'Kalau terdeteksi tanda bahaya, nomor bantuan langsung muncul — lewat teks maupun suara.',
    img: img.featSafety,
    alt: 'Papan bertuliskan difficult roads lead to beautiful destinations',
  },
];

function Features() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll horizontal hanya di layar lebar; di HP panel-panelnya bertumpuk.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const strip = ref.current.querySelector('.hstrip');
        const dist = () => strip.scrollWidth - ref.current.clientWidth;
        const tween = gsap.to(strip, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            pin: true,
            scrub: 1,
            end: () => '+=' + dist(),
            invalidateOnRefresh: true,
          },
        });
        return () => tween.scrollTrigger?.kill();
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="fitur" className="bg-paper-2">
      <div className="mx-auto max-w-352 px-5 pt-24 sm:px-8 sm:pt-32">
        <Eyebrow n="02">Yang bisa dilakukan</Eyebrow>
        <SplitReveal as="h2" className="max-w-3xl font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[0.98]">
          Empat cara supaya cerita kamu <span className="underline-hand">tidak berhenti di tenggorokan.</span>
        </SplitReveal>
      </div>

      <div ref={ref} className="hstrip-viewport overflow-hidden py-16 sm:py-20">
        <div className="hstrip px-5 sm:px-8">
          {FEATURES.map((f) => (
            <TiltCard
              key={f.n}
              className="group w-full shrink-0 lg:w-[34rem]"
            >
              <article className="grain relative flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-paper shadow-xl shadow-ink/5">
                <div className="relative aspect-16/10 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.alt}
                    loading="lazy"
                    className="photo-tone h-full w-full object-cover"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1 font-display text-sm">
                    {f.n}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-3xl">{f.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{f.body}</p>
                </div>
              </article>
            </TiltCard>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-352 gap-4 px-5 pb-24 sm:grid-cols-2 sm:px-8 sm:pb-32">
        {[
          ['Ingat konteks', 'Tanya lanjutan soal screenshot tadi? Masih nyambung.'],
          ['Tanpa akun', 'Tidak ada login, tidak ada database. Ceritamu tidak disimpan di server.'],
        ].map(([t, b]) => (
          <div key={t} className="rounded-[1.4rem] border border-ink/10 p-7">
            <h3 className="font-display text-2xl">{t}</h3>
            <p className="mt-2 text-ink-soft">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- 03 caranya */

const STEPS = [
  {
    n: '01',
    title: 'Buka. Selesai.',
    body: 'Tidak ada daftar, tidak ada verifikasi email, tidak ada kuesioner sepuluh halaman. Halaman terbuka, kursor sudah menunggu.',
    img: img.step1,
    alt: 'Tangan menulis di buku catatan',
  },
  {
    n: '02',
    title: 'Cerita sebisamu.',
    body: 'Ketik seadanya, atau tahan tombol rekam kalau mengetik terasa berat. Tempel screenshot kalau lebih mudah menunjukkan daripada menjelaskan.',
    img: img.step2,
    alt: 'Seseorang bermeditasi saat matahari terbenam',
  },
  {
    n: '03',
    title: 'Ditemani, bukan digurui.',
    body: 'Balasan datang pelan-pelan: mendengarkan dulu, mengakui perasaannya, baru menawarkan langkah kecil kalau kamu memang mau.',
    img: img.step3,
    alt: 'Seseorang duduk di tebing menghadap senja',
  },
];

function How() {
  return (
    <section id="cara" className="grain relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-352 px-5 sm:px-8">
        <Eyebrow n="03">Cara kerjanya</Eyebrow>
        <SplitReveal as="h2" className="max-w-3xl font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[0.98]">
          Tiga langkah. Tidak ada satu pun yang <span className="underline-hand">meminta datamu.</span>
        </SplitReveal>

        <div className="mt-16 grid gap-x-16 lg:grid-cols-2">
          {/* Kolom kiri: teks yang mengalir */}
          <ol className="space-y-24 sm:space-y-32">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="font-display text-6xl text-clay/40">{s.n}</span>
                <h3 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight">
                  {s.title}
                </h3>
                <SplitReveal className="mt-4 max-w-md leading-relaxed text-ink-soft">
                  {s.body}
                </SplitReveal>
                {/* Foto ikut mengalir di mobile, disembunyikan di desktop */}
                <RevealImage
                  src={s.img}
                  alt={s.alt}
                  className="mt-8 aspect-4/3 rounded-[1.4rem] lg:hidden"
                  imgClass="photo-tone"
                />
              </li>
            ))}
          </ol>

          {/* Kolom kanan: tiap foto menempel di posisi sedikit berbeda,
              jadi kartu-kartunya bertumpuk saat discroll. */}
          <div className="hidden lg:block">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="sticky pb-10"
                style={{ top: `${7 + i * 1.6}rem`, zIndex: i + 1 }}
              >
                <RevealImage
                  src={s.img}
                  alt={s.alt}
                  className="aspect-4/3 rounded-[1.6rem] shadow-2xl shadow-ink/20 ring-8 ring-paper"
                  imgClass="photo-tone"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 04 suara    */

const EXAMPLES = [
  'Aku nggak tahu kenapa nangis terus padahal nggak ada yang salah.',
  'Semua orang kelihatan udah punya arah, aku masih di tempat.',
  'Capek jadi orang yang selalu ngerti duluan.',
  'Habis berantem sama dia dan aku bingung ini salahku atau bukan.',
  'Aku takut tidur karena besok harus mulai lagi.',
  'Pengen cerita, tapi takut dibilang lebay.',
];

function Voices() {
  return (
    <section className="border-y border-ink/10 bg-ink py-24 text-paper sm:py-32">
      <div className="mx-auto max-w-352 px-5 sm:px-8">
        <div className="mb-6 flex items-center gap-4 text-[0.7rem] font-semibold tracking-[0.28em] text-paper/50 uppercase">
          <span className="text-clay-soft">04</span>
          <span className="h-px w-10 bg-paper/20" />
          <span>Yang biasa dibawa ke sini</span>
        </div>
        <SplitReveal as="h2" className="max-w-3xl font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[0.98]">
          Kalau salah satunya terdengar familiar, kamu sudah di tempat yang benar.
        </SplitReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((q, i) => (
            <blockquote
              key={q}
              data-speed={i % 3 === 1 ? '1.06' : '0.97'}
              className="rounded-[1.4rem] border border-paper/12 bg-paper/[0.04] p-7 transition hover:border-clay-soft/40 hover:bg-paper/[0.07]"
            >
              <p className="font-display text-2xl leading-snug italic">“{q}”</p>
            </blockquote>
          ))}
        </div>

        <p className="mt-8 text-xs text-paper/40">
          Contoh keluhan yang umum dibawa ke sesi — bukan kutipan pengguna nyata.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- 05 aman   */

function Safety() {
  return (
    <section id="aman" className="grain relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto grid max-w-352 gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow n="05">Batasnya jelas</Eyebrow>
          <SplitReveal as="h2" className="font-display text-[clamp(2.3rem,5.5vw,4.2rem)] leading-[0.98]">
            Ini teman bercerita. <span className="text-clay italic">Bukan pengganti tenaga profesional.</span>
          </SplitReveal>
          <SplitReveal className="mt-7 max-w-md leading-relaxed text-ink-soft">
            ShyTherAI tidak mendiagnosis, tidak meresepkan, dan tidak menggantikan psikolog
            atau psikiater berlisensi. Kalau yang kamu hadapi butuh penanganan sungguhan, kami akan
            bilang begitu — bukan menahanmu di sini.
          </SplitReveal>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[1.6rem] border-2 border-clay/30 bg-clay/[0.06] p-8 sm:p-10">
            <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-clay uppercase">
              Dalam keadaan darurat
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <a href="tel:119" className="group block">
                <span className="font-display text-[clamp(2.6rem,6vw,3.6rem)] leading-none transition group-hover:text-clay">
                  119 <span className="text-2xl">ext. 8</span>
                </span>
                <span className="mt-2 block text-sm text-ink-soft">
                  Layanan Sehat Jiwa, Kementerian Kesehatan RI
                </span>
              </a>
              <a href="tel:112" className="group block">
                <span className="font-display text-[clamp(2.6rem,6vw,3.6rem)] leading-none transition group-hover:text-clay">
                  112
                </span>
                <span className="mt-2 block text-sm text-ink-soft">
                  Panggilan darurat nasional, 24 jam
                </span>
              </a>
            </div>
            <p className="mt-8 border-t border-clay/20 pt-6 text-sm leading-relaxed text-ink-soft">
              Kalau ada pikiran untuk menyakiti diri sendiri, tolong hubungi salah satu nomor di
              atas sekarang — atau minta seseorang di dekatmu untuk menemani.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Tanpa akun', 'Tidak ada email, tidak ada password.'],
              ['Tanpa database', 'Percakapan tidak disimpan di server.'],
              ['Tutup = hilang', 'Sesi berakhir saat tab ditutup.'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-2xl border border-ink/10 p-5">
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-ink-soft">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- ajakan  */

function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[34rem] sm:h-[40rem]">
        <img
          src={img.hope}
          alt="Seseorang membuka tangan menyambut matahari terbit"
          loading="lazy"
          data-speed="0.8"
          className="absolute inset-0 h-[125%] w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink via-ink/80 to-ink/45" />

        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center text-paper">
          <SplitReveal
            as="h2"
            type="chars"
            className="max-w-4xl font-display text-[clamp(2.6rem,8vw,6rem)] leading-[0.92]"
          >
            Kalimat pertama boleh berantakan.
          </SplitReveal>
          <p className="mt-6 max-w-md leading-relaxed text-paper/85">
            Tidak perlu menyiapkan apa pun. Buka, lalu tulis apa yang pertama muncul di kepala.
          </p>
          <Magnetic strength={0.45} className="mt-10">
            <a
              href={CHAT_HREF}
              className="group inline-flex items-center gap-3 rounded-full bg-paper px-8 py-4 font-semibold text-ink transition hover:bg-clay hover:text-paper"
            >
              Mulai bercerita sekarang
              <span className="transition group-hover:translate-x-1">→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- footer  */

function Footer() {
  return (
    <footer className="bg-ink pt-16 pb-10 text-paper/60">
      <div className="mx-auto max-w-352 px-5 sm:px-8">
        <Marquee
          items={['Kamu tidak sendirian', 'Kalimat pertama boleh berantakan', 'Cerita dulu, sisanya nanti']}
          speed={38}
          reverse
          className="border-y border-paper/10 py-6 font-display text-[clamp(1.6rem,4vw,3rem)] text-paper/25 italic"
        />

        <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-2xl text-paper">
              Shy<span className="text-clay-soft italic">Ther</span>AI
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">
              Dibangun dengan React, Express, dan Gemini Flash. Bukan layanan medis dan tidak
              menggantikan psikolog atau psikiater berlisensi.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {NAV.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => jumpTo(e, href)}
                className="transition hover:text-paper"
              >
                {label}
              </a>
            ))}
            <a href={CHAT_HREF} className="text-paper transition hover:text-clay-soft">
              Mulai bercerita →
            </a>
          </nav>
        </div>

        <p className="mt-10 border-t border-paper/10 pt-6 text-xs">
          Foto oleh para fotografer di{' '}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-paper"
          >
            Unsplash
          </a>
        </p>
      </div>
    </footer>
  );
}
