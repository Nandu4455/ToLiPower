
/* ===== Theme & Contrast Toggle (Auto-Dark beim ersten Laden) ===== */
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const contrastBtn = document.getElementById('contrastToggle');
const savedTheme = localStorage.getItem('tolipower-theme');
const savedContrast = localStorage.getItem('tolipower-contrast');

if (savedTheme) {
  html.setAttribute('data-theme', savedTheme);
  if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  if (themeBtn) themeBtn.textContent = prefersDark ? '☀️' : '🌙';
}
if (savedContrast === 'on') { html.classList.add('contrast'); }

themeBtn?.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('tolipower-theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
});
contrastBtn?.addEventListener('click', () => {
  html.classList.toggle('contrast');
  localStorage.setItem('tolipower-contrast', html.classList.contains('contrast') ? 'on' : 'off');
});

/* ===== Mobile Menü ===== */
const menuBtn = document.getElementById('menuToggle');
const header = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => header.classList.toggle('nav--open'));

/* ===== Smooth Scroll + Scrollspy ===== */
const spyLinks = [...document.querySelectorAll('.nav__links a')];
spyLinks.forEach(a=>{
  const href = a.getAttribute('href') ?? '';
  if (href.startsWith('#')){
    a.classList.add('spy');
    a.addEventListener('click', e=>{
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el){
        e.preventDefault();
        header.classList.remove('nav--open');
        el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  }
});
const sections = spyLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if (e.isIntersecting){
      const id = `#${e.target.id}`;
      spyLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
    }
  });
},{ rootMargin: '-45% 0px -50% 0px', threshold: 0.01 });
sections.forEach(s => spy.observe(s));

/* ===== Reveal on Scroll ===== */
const revealIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealIO.unobserve(entry.target);
    }
  });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=> revealIO.observe(el));

/* ===== Counter-Animation (Hero + Impact) ===== */
function animateCounter(el, to, duration=1300){
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0) / duration);
    const val = Math.floor(p * to);
    el.textContent = val.toLocaleString('de-CH');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function initCounters(){
  const counters = document.querySelectorAll('.stat__num, .kpi__num');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const num = parseInt(entry.target.dataset.count ?? '0', 10);
        animateCounter(entry.target, num);
        io.unobserve(entry.target);
      }
    });
  },{threshold:0.5});
  counters.forEach(el=>{
    io.observe(el);
    const r = el.getBoundingClientRect();
    const inView = r.top >= 0 && r.bottom <= (window.innerHeight ?? document.documentElement.clientHeight);
    if (inView){
      const num = parseInt(el.dataset.count ?? '0', 10);
      animateCounter(el, num);
      io.unobserve(el);
    }
  });
}
window.addEventListener('DOMContentLoaded', initCounters);

/* ===== Skeleton -> Overlay entfernen, wenn Bilder geladen ===== */
document.querySelectorAll('.skeleton img').forEach(img=>{
  const parent = img.parentElement;
  const done = () => parent.classList.add('loaded');
  if (img.complete) done(); else img.addEventListener('load', done);
});

/* ===== Back to Top ===== */
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('is-show', (window.scrollY ?? document.documentElement.scrollTop) > 600);
},{passive:true});
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Parallax Hero (respect reduced motion) ===== */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroImg = document.querySelector('.hero__image img');
let rafId = null;
if (!prefersReduced && heroImg){
  window.addEventListener('scroll', ()=>{
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(()=>{
      const y = window.scrollY;
      heroImg.style.transform = `scale(1.02) translateY(${Math.min(36, y*0.04)}px)`;
    });
  });
}

/* ===== Kontakt (Formspree) – Statusanzeige ===== */
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
form?.addEventListener('submit', () => {
  if (formStatus) {
    formStatus.textContent = 'Senden …';
    setTimeout(() => formStatus.textContent = 'Danke! Wir melden uns.', 1200);
  }
});

/* ===== Roadmap: Fortschritt folgt dem Scroll-Kontext ===== */
(function(){
  const section = document.getElementById('roadmap');
  const progress = document.querySelector('.numberline__progress');
  const dot = document.querySelector('.numberline__dot');
  const labels = document.querySelectorAll('.numberline__labels li');
  if (!section || !progress || !dot) return;

  function update(){
    const rect = section.getBoundingClientRect();
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight ?? 0);
    const start = rect.top - vh*0.65;
    const end = rect.bottom - vh*0.35;
    const p = Math.min(1, Math.max(0, (vh*0.5 - start) / (end - start)));
    const pct = p * 100;
    progress.style.width = `${pct}%`;
    dot.style.left = `${pct}%`;
    labels.forEach(l=>{
      const pos = parseFloat(l.dataset.pos ?? '0');
      l.style.color = (p >= pos) ? 'var(--text)' : 'var(--muted)';
    });
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

/* ===== Galerie Lightbox ===== */
(function(){
  const lb = document.getElementById('lightbox');
  const frame = lb?.querySelector('.lightbox__frame img');
  const caption = lb?.querySelector('.lightbox__caption');
  const closeBtn = lb?.querySelector('.lightbox__close');
  if (!lb || !frame || !caption || !closeBtn) return;
  function open(src, title){
    frame.src = src; frame.alt = title ?? '';
    caption.textContent = title ?? '';
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden','false');
  }
  function close(){
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden','true');
    frame.src = ''; caption.textContent = '';
  }
  document.querySelectorAll('.gallery .item').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      open(a.getAttribute('href'), a.getAttribute('data-title'));
    });
  });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e)=>{ if(e.target === lb) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
})();

/* ===== Interaktive Karte – SVG laden + CSV-Join + Tooltip (wie vorher) ===== */
(() => {
  const container = document.getElementById('tolimap-container');
  if (!container || !container.dataset.src) return;

  const energyUrl = '/daten/energie.csv';
  const energyByBfs = new Map();

  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(',');
    const col = (name) => header.indexOf(name);
    const idx = {
      bfs: col('bfs'),
      name: col('name'),
      solar: col('solar_count'),
      wind: col('wind_count'),
      water: col('water_count'),
      majority: col('majority')
    };
    for (const line of lines){
      if (!line.trim()) continue;
      const parts = line.split(',');
      const bfs   = (parts[idx.bfs]      || '').trim();
      if (!bfs) continue;
      const name  = (parts[idx.name]     || '').trim();
      const solar = Number((parts[idx.solar] || '').trim() || 0);
      const wind  = Number((parts[idx.wind]  || '').trim() || 0);
      const water = Number((parts[idx.water] || '').trim() || 0);
      let maj     = (parts[idx.majority] || '').trim();
      if (!maj){
        const max = Math.max(solar, wind, water);
        maj = (max === wind) ? 'wind' : (max === water) ? 'wasser' : 'solar';
      }
      energyByBfs.set(bfs, { name, solar, wind, water, majority: maj });
    }
  }

  // Tooltip helpers
  const tip = document.getElementById('mapTip');
  function showTip(text, x, y){
    if (!tip) return;
    tip.textContent = text;
    tip.style.left = `${x}px`;
    tip.style.top  = `${y}px`;
    tip.classList.add('is-show');
    tip.setAttribute('aria-hidden','false');
  }
  function hideTip(){
    if (!tip) return;
    tip.classList.remove('is-show');
    tip.setAttribute('aria-hidden','true');
  }

  // Erst CSV, dann SVG laden
  Promise.all([
    fetch(energyUrl, { cache: 'no-store' }).then(r => r.ok ? r.text() : Promise.reject('CSV nicht gefunden')).then(parseCSV),
    fetch(container.dataset.src, { cache: 'no-store' }).then(r => r.ok ? r.text() : Promise.reject('SVG nicht gefunden'))
  ])
  .then(([, svgText]) => {
    container.innerHTML = svgText;

    const svg = container.querySelector('svg');
    if (!svg) throw new Error('Kein <svg> im geladenen Dokument');

    svg.classList.add('map');
    if (!svg.getAttribute('role')) svg.setAttribute('role', 'img');
    if (!svg.getAttribute('aria-label') && !svg.querySelector('title')) {
      svg.setAttribute('aria-label', 'ToLi Power – Gemeinden im Toggenburg & Linthgebiet');
    }

    const paths = svg.querySelectorAll('path[id]');
    if (!paths.length) {
      console.warn('Keine Pfade mit id gefunden – prüfe dein SVG (id="Gemeindename" + data-bfs_nummer="...").');
      return;
    }

    let active = null;
    function select(el){
      if (active === el) { el.classList.remove('is-active'); active = null; return; }
      if (active) active.classList.remove('is-active');
      el.classList.add('is-active'); active = el;
    }

    paths.forEach(p => {
      // A11y
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');

      const gName = p.id || 'Gemeinde';
      const bfs   = (p.getAttribute('data-bfs_nummer') || '').trim();
      const stats = bfs && energyByBfs.get(bfs);
      const solar = stats?.solar ?? 0;
      const wind  = stats?.wind  ?? 0;
      const water = stats?.water ?? 0;
      const maj   = stats?.majority ?? ((() => {
        const max = Math.max(solar, wind, water);
        return (max === wind) ? 'wind' : (max === water) ? 'wasser' : 'solar';
      })());

      // aria-label mit Stats
      p.setAttribute('aria-label', `${gName} – Solar: ${solar} • Wind: ${wind} • Wasser: ${water} • Mehrheit: ${maj}`);
      p.dataset.type = maj;

      // Events
      p.addEventListener('click', () => select(p));
      p.addEventListener('mousemove', e => {
        showTip(`${gName} — Solar: ${solar} • Wind: ${wind} • Wasser: ${water} • Mehrheit: ${maj}`, e.clientX, e.clientY);
      });
      p.addEventListener('mouseleave', hideTip);
      p.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(p);
        }
      });
    });

    // Klick außerhalb: Auswahl + Tooltip schließen
    document.addEventListener('click', (e) => {
      const inside = svg.contains(e.target);
      if (!inside) {
        hideTip();
        if (active) { active.classList.remove('is-active'); active = null; }
      }
    });

    // Scroll/Resize -> Tooltip ausblenden
    window.addEventListener('scroll', hideTip, { passive: true });
    window.addEventListener('resize',  hideTip);
  })
  .catch(err => console.error('[Karte] Fehler:', err));
})();
