
/* ============================================================
   ToLi Power – Interaktionen & Logik (HTML/CSS/JS, kein Framework)
   ============================================================ */

(() => {
  // ---------- [INIT] Theme & Contrast ----------
  const root = document.documentElement;
  const themeKey = 'tolipower-theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem(themeKey);
  root.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));

  const themeToggle = document.getElementById('themeToggle');
  const contrastToggle = document.getElementById('contrastToggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(themeKey, next);
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }
  if (contrastToggle) {
    contrastToggle.addEventListener('click', () => {
      const isContrast = root.classList.toggle('contrast');
      contrastToggle.setAttribute('aria-pressed', String(isContrast));
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
  const sections = menuLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

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
