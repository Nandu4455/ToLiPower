
/* ============================================================
   ToLi Power – Interaktionen & Logik (HTML/CSS/JS, kein Framework)
   ============================================================ */

(() => {
  // ---------- [INIT] Theme ----------
  const root = document.documentElement;
  const themeKey = 'tolipower-theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem(themeKey);
  root.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(themeKey, next);
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }

  // ---------- [NAV] Mobile Menu ----------
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      mobileMenu.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    menuToggle.addEventListener('click', () => mobileMenu.hidden ? openMenu() : closeMenu());
    mobileMenu.addEventListener('click', (e) => { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // ---------- [SPY] Scrollspy & Reveal ----------
  const menuLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
  const sections = menuLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = menuLinks.find(a => a.getAttribute('href') === `#${id}`);
        if (link && entry.isIntersecting) {
          menuLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] });
    sections.forEach(s => spy.observe(s));
  }

  // Reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- [HERO] Skeleton, Parallax, Counters ----------
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Skeleton -> remove on load
  document.querySelectorAll('.skeleton img').forEach(img => {
    if (img.complete) img.parentElement.classList.add('loaded');
    img.addEventListener('load', () => img.parentElement.classList.add('loaded'), { once: true });
  });

  // Parallax-lite
  const heroImg = document.querySelector('.hero__image img');
  if (heroImg && !prefersReduced) {
    const onScroll = () => {
      const rect = heroImg.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const ratio = 1 - Math.min(Math.max((rect.top + rect.height) / (vh + rect.height), 0), 1);
      heroImg.style.transform = `translateY(${ratio * 8}px)`; // subtil
    };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Counter animation (hero + impact)
  const nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window) {
    const once = new WeakSet();
    const ioNum = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !once.has(entry.target)) {
          once.add(entry.target);
          const el = entry.target;
          const end = parseInt(el.getAttribute('data-count'), 10) || 0;
          const start = 0;
          const dur = 900 + Math.min(end * 10, 1400);
          const t0 = performance.now();
          const step = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const val = Math.floor(start + (end - start) * (1 - Math.pow(1 - p, 3)));
            el.textContent = val;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(n => ioNum.observe(n));
  }

  // ---------- [MAP] SVG + CSV Join ----------
  const mapHost = document.getElementById('map');
  const tooltip = document.getElementById('tooltip');

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(',').map(s => s.trim());
    return lines.map(line => {
      const parts = line.split(',').map(s => s.trim());
      const row = {};
      header.forEach((h, i) => row[h] = parts[i]);
      return row;
    });
  };

  const hideTip = () => { if (tooltip) tooltip.hidden = true; };
  const showTip = (html, x, y) => {
    if (!tooltip) return;
    tooltip.innerHTML = html;
    tooltip.style.left = `${x + 14}px`;
    tooltip.style.top = `${y + 14}px`;
    tooltip.hidden = false;
  };

  if (mapHost && mapHost.dataset.svg && mapHost.dataset.csv) {
    Promise.all([
      fetch(mapHost.dataset.svg).then(r => r.text()),
      fetch(mapHost.dataset.csv).then(r => r.text())
    ]).then(([svgText, csvText]) => {
      // Inline SVG
      mapHost.innerHTML = svgText;
      const svg = mapHost.querySelector('svg');
      if (!svg) return;

      // CSV -> Map<BFS, data>
      const rows = parseCSV(csvText);
      const dataMap = new Map();
      rows.forEach(r => {
        const bfs = String(r.bfs || '').trim();
        const solar = +r.solar_count || 0;
        const wind = +r.wind_count || 0;
        const water = +r.water_count || 0;
        let majority = (r.majority || '').trim();
        if (!majority) {
          const m = Math.max(solar, wind, water);
          majority = m === solar ? 'Solar' : m === wind ? 'Wind' : 'Wasser';
        }
        dataMap.set(bfs, { name: r.name, solar, wind, water, majority });
      });

      // Interaktion
      const areas = svg.querySelectorAll('[data-bfs_nummer]');
      areas.forEach(area => {
        const bfs = String(area.getAttribute('data-bfs_nummer') || '').trim();
        const info = dataMap.get(bfs);

        // Keyboard-A11y
        area.setAttribute('tabindex', '0');
        area.setAttribute('role', 'button');

        if (info) {
          const label = `${info.name} — Solar: ${info.solar} • Wind: ${info.wind} • Wasser: ${info.water} • Mehrheit: ${info.majority}`;
          area.setAttribute('aria-label', label);

          const onEnter = (x, y) => showTip(label, x, y);
          area.addEventListener('mousemove', (e) => onEnter(e.clientX, e.clientY));
          area.addEventListener('mouseenter', (e) => onEnter(e.clientX || 0, e.clientY || 0));
        }

        const activate = () => {
          svg.querySelectorAll('.is-active').forEach(a => a.classList.remove('is-active'));
          area.classList.add('is-active');
        };
        const deactivate = () => { area.classList.remove('is-active'); hideTip(); };

        area.addEventListener('click', activate);
        area.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });

        document.addEventListener('scroll', hideTip, { passive: true });
        window.addEventListener('resize', hideTip);
        svg.addEventListener('click', (e) => { if (!e.target.closest('[data-bfs_nummer]')) deactivate(); });
      });
    }).catch(err => {
      console.warn('Karte/CSV konnten nicht geladen werden:', err);
    });
  }

  // ---------- [CONTACT] Form ----------
  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (status) status.textContent = 'Senden…';
      try {
        const formData = new FormData(form);
        const res = await fetch(form.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
        if (res.ok) { if (status) status.textContent = 'Danke! Wir melden uns.'; form.reset(); }
        else { if (status) status.textContent = 'Fehler beim Senden. Bitte später erneut versuchen.'; }
      } catch { if (status) status.textContent = 'Netzwerkfehler. Bitte später erneut.'; }
    });
  }

  // ---------- [MISC] Back-to-top & Year ----------
  const toTop = document.querySelector('.toTop');
  const setTopVis = () => { if (!toTop) return; toTop.style.display = (window.scrollY > 600 ? 'inline-flex' : 'none'); };
  setTopVis(); window.addEventListener('scroll', setTopVis, { passive: true });
  if (toTop) {
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
