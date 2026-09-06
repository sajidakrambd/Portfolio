// =============================================================
// SAJID AKRAM — PORTFOLIO — main script
// =============================================================
document.addEventListener('DOMContentLoaded', () => {

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     NAV — scrolled state, mobile toggle, active link highlight
  ----------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });

  const sections = ['home','about','toolkit','projects','logofolio','reviews','contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navAnchors = Array.from(navLinks.querySelectorAll('a'));

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => a.classList.toggle('active', a.dataset.nav === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => navObserver.observe(s));

  /* -----------------------------------------------------------
     REVEAL ON SCROLL
  ----------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* -----------------------------------------------------------
     GENERIC SLIDER (used by hero + reviews)
  ----------------------------------------------------------- */
  function initSlider(sliderId, slideClass, dotsId, interval) {
    const sliderEl = document.getElementById(sliderId);
    if (!sliderEl) return;
    const slides = Array.from(sliderEl.querySelectorAll('.' + slideClass));
    const dotsWrap = document.getElementById(dotsId);
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.querySelectorAll('button'));

    function goTo(i) {
      slides[index].classList.remove('active');
      dots[index].classList.remove('active');
      index = i;
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      resetTimer();
    }

    function next() { goTo((index + 1) % slides.length); }

    function resetTimer() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(next, interval);
    }
    resetTimer();
  }

  initSlider('heroSlider', 'hero-slide', 'heroDots', 4500);
  initSlider('reviewSlider', 'review-slide', 'reviewDots', 5500);

  /* -----------------------------------------------------------
     ABOUT TABS (About / Numbers / Experience)
  ----------------------------------------------------------- */
  const aboutTabs = document.getElementById('aboutTabs');
  const tabPanels = document.querySelectorAll('.tab-panel');

  aboutTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    aboutTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.tab;
    tabPanels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
  });

  /* -----------------------------------------------------------
     QUICK STATS — count-up on scroll into view
  ----------------------------------------------------------- */
  const qsSection = document.getElementById('quickstats');
  let qsCounted = false;

  function animateQuickStats() {
    document.querySelectorAll('.qs-num').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const isDecimal = !Number.isInteger(target);
      if (prefersReduced) { el.textContent = target + suffix; return; }
      let cur = 0;
      const duration = 1200;
      const stepTime = 16;
      const steps = duration / stepTime;
      const inc = target / steps;
      const tick = () => {
        cur += inc;
        if (cur >= target) { el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix; return; }
        el.textContent = (isDecimal ? cur.toFixed(1) : Math.floor(cur)) + suffix;
        setTimeout(tick, stepTime);
      };
      tick();
    });
  }

  if (qsSection) {
    const qsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !qsCounted) {
          qsCounted = true;
          animateQuickStats();
          qsObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    qsObserver.observe(qsSection);
  }

  /* -----------------------------------------------------------
     TOOLKIT CATEGORY SWITCHER
  ----------------------------------------------------------- */
  const toolkitCats = document.getElementById('toolkitCats');
  const chipPanels = document.querySelectorAll('.chip-panel');

  toolkitCats.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    toolkitCats.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.cat;
    chipPanels.forEach(p => {
      const match = p.dataset.panel === target;
      p.classList.toggle('active', match);
      if (match) {
        // restart stagger animation
        Array.from(p.children).forEach((chip, i) => {
          chip.style.animation = 'none';
          void chip.offsetWidth; // reflow
          chip.style.animation = '';
          chip.style.animationDelay = (i * 0.05) + 's';
        });
      }
    });
  });
  // initialize stagger delay on first panel
  document.querySelectorAll('.chip-panel.active .chip').forEach((chip, i) => {
    chip.style.animationDelay = (i * 0.05) + 's';
  });

  /* -----------------------------------------------------------
     PROJECT FILTER TABS
  ----------------------------------------------------------- */
  const projectTabs = document.getElementById('projectTabs');
  const projectGrid = document.getElementById('projectGrid');
  const pcards = Array.from(projectGrid.querySelectorAll('.pcard'));

  projectTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.ptab');
    if (!btn) return;
    projectTabs.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    pcards.forEach((card, i) => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hide', !match);
      if (match) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
        card.style.animationDelay = (i * 0.04) + 's';
      }
    });
  });

  /* -----------------------------------------------------------
     LIGHTBOX
  ----------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxMedia = document.getElementById('lightboxMedia');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxDesc = document.getElementById('lightboxDesc');

  pcards.forEach(card => {
    card.addEventListener('click', () => {
      const img1 = card.dataset.img1;
      lightboxMedia.innerHTML = `<img src="${img1}" alt="${card.dataset.title}">`;
      lightboxTitle.textContent = card.dataset.title;
      lightboxTag.textContent = card.dataset.tag;
      lightboxDesc.textContent = card.dataset.desc;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* -----------------------------------------------------------
     LOGO GRID hover -> also lights up marquee word (nice-to-have)
  ----------------------------------------------------------- */
  document.querySelectorAll('.logo-tile').forEach(tile => {
    tile.addEventListener('mouseenter', () => tile.style.setProperty('--x', '1'));
  });

});
