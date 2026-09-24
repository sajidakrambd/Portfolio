// premium.js — motion, atmosphere, case studies, accessibility (loads after script.js)
document.addEventListener('DOMContentLoaded', () => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const G = window.gsap, ST = window.ScrollTrigger;

  /* --- accessibility --- */
  const tgl = $('#navToggle'), nav = $('#nav');
  if (tgl) {
    tgl.setAttribute('aria-expanded', 'false');
    tgl.addEventListener('click', () => tgl.setAttribute('aria-expanded', nav.classList.contains('open')));
  }

  /* --- case studies in the lightbox --- */
  const CASE = {
    brand: ['Give this brand an identity that is distinctive, credible and easy to apply.', 'Audience and category research first, then a brand personality that guides every design decision.', 'Sketches and mark exploration, colour and type system, then mock-ups on real touchpoints.', 'A launch-ready identity: logo suite, palette, typography, stationery and application mock-ups.'],
    packaging: ['Make the product stand out on the shelf while meeting real print and production limits.', 'Study the category and the buyer, then define a visual hierarchy that reads in seconds.', 'Concepts, dieline layout, colour and finish planning, then production-ready artwork.', 'A packaging system with dielines and print-ready files for production.'],
    social: ['Keep a brand recognisable and consistent across a busy, fast-moving feed.', 'Translate the brand voice into flexible layouts the team can reuse every week.', 'Grid planning, template design for posts, stories and carousels, then campaign variations.', 'A reusable social template system that speeds up publishing and keeps the feed on brand.'],
    book: ['Signal the genre and mood of the story at thumbnail size and on the shelf.', 'Read the brief and the genre conventions, then choose imagery and lettering that carry the tone.', 'Concept sketches, typography and image treatment, then cover finishing and print specifications.', 'A print-ready cover with title treatment and finishing notes.']
  };
  const LBL = ['Challenge', 'Approach', 'Process', 'Solution', 'Outcome'];
  const box = $('#caseBlock'), closeBtn = $('#lightboxClose');
  let lastCard = null;
  $$('.pcard').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Open case study: ' + card.dataset.title);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
    card.addEventListener('click', () => {
      lastCard = card;
      const c = CASE[card.dataset.cat] || CASE.brand;
      const vals = [c[0], c[1], c[2], card.dataset.desc, c[3]];
      box.textContent = '';
      const dl = document.createElement('dl');
      dl.className = 'case';
      LBL.forEach((l, i) => {
        const wrap = document.createElement('div');
        const dt = document.createElement('dt'); dt.textContent = l;
        const dd = document.createElement('dd'); dd.textContent = vals[i];
        wrap.append(dt, dd); dl.append(wrap);
      });
      box.append(dl);
      setTimeout(() => closeBtn && closeBtn.focus(), 50);
    });
  });

  /* --- smooth scroll (Lenis) --- */
  let lenis;
  if (!rm && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, anchors: true });
    if (G && ST) {
      G.registerPlugin(ST);
      lenis.on('scroll', ST.update);
      G.ticker.add(t => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else if (G && ST) { G.registerPlugin(ST); }

  const lb = $('#lightbox');
  if (lb) new MutationObserver(() => {
    const open = lb.classList.contains('open');
    if (lenis) open ? lenis.stop() : lenis.start();
    if (!open && lastCard) lastCard.focus({ preventScroll: true });
  }).observe(lb, { attributes: true, attributeFilter: ['class'] });

  if (rm) return;

  /* --- particles + mesh companion --- */
  const c = document.createElement('canvas');
  c.className = 'fx'; c.setAttribute('aria-hidden', 'true');
  document.body.prepend(c);
  const ctx = c.getContext('2d');
  let w, h, d;
  const size = () => { d = Math.min(devicePixelRatio || 1, 1.5); w = c.width = innerWidth * d; h = c.height = innerHeight * d; };
  size(); addEventListener('resize', size);
  const cols = ['79,140,255', '139,92,246', '0,229,255'];
  const P = Array.from({ length: innerWidth < 700 ? 22 : 48 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .5, s: Math.random() * .0012 + .0004, c: cols[i % 3] }));
  (function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of P) {
      p.y -= p.s; if (p.y < 0) p.y = 1;
      ctx.fillStyle = `rgba(${p.c},.55)`;
      ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r * d, 0, 7); ctx.fill();
    }
    requestAnimationFrame(frame);
  })();

  /* --- cursor light + magnetic buttons + hero depth (pointer devices only) --- */
  if (fine) {
    const g = document.createElement('div');
    g.className = 'cursor-glow'; g.setAttribute('aria-hidden', 'true');
    document.body.append(g);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; g.style.opacity = 1; }, { passive: true });
    (function loop() { x += (tx - x) * .12; y += (ty - y) * .12; g.style.transform = `translate3d(${x}px,${y}px,0)`; requestAnimationFrame(loop); })();

    if (G) {
      $$('.btn,.nav-cta,.icon-btn').forEach(el => {
        const qx = G.quickTo(el, 'x', { duration: .5, ease: 'power3' }), qy = G.quickTo(el, 'y', { duration: .5, ease: 'power3' });
        el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .25); qy((e.clientY - r.top - r.height / 2) * .25); });
        el.addEventListener('pointerleave', () => { qx(0); qy(0); });
      });
      const hero = $('.hero');
      const layers = [['.hero-blob', 40], ['.fc-1', -22], ['.fc-2', 28]].map(([s, dist]) => {
        const el = $(s);
        return el && { dist, x: G.quickTo(el, 'x', { duration: .9, ease: 'power3' }), y: G.quickTo(el, 'y', { duration: .9, ease: 'power3' }) };
      }).filter(Boolean);
      if (hero) hero.addEventListener('pointermove', e => {
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        layers.forEach(l => { l.x(nx * l.dist); l.y(ny * l.dist); });
      });
    }
  }

  if (!G) return;

  /* --- one orchestrated hero entrance (image is never faded, so LCP is not delayed) --- */
  const tl = G.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero .eyebrow', { y: 24, opacity: 0, duration: .7 })
    .from('.hero-title .script, .hero-title .block', { yPercent: 40, opacity: 0, duration: .9, stagger: .12 }, '-=.4')
    .from('.hero-positioning, .hero-slider, .hero-actions, .hero-marquee-mini', { y: 24, opacity: 0, duration: .7, stagger: .1 }, '-=.5')
    .from('.hero-visual-frame', { scale: 1.06, duration: 1.3 }, 0)
    .from('.float-card', { scale: .8, opacity: 0, duration: .7, stagger: .15 }, '-=.6');

  if (ST) {
    G.to('.hero-blob', { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.hero-visual-frame img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    const items = $$('.svc, .step, .faq-item');
    G.set(items, { opacity: 0, y: 36 });
    ST.batch(items, { start: 'top 90%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out', overwrite: true }) });
  }
});
