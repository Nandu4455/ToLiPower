
// ===== Theme & Contrast Toggle (mit Auto-Dark beim ersten Laden) =====
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

// ===== Mobile Menü =====
const menuBtn = document.getElementById('menuToggle');
const header = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => header.classList.toggle('nav--open'));

// ===== Smooth Scroll + Scrollspy =====
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

// ===== Reveal on Scroll =====
const revealIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealIO.unobserve(entry.target);
    }
  });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=> revealIO.observe(el));

// ===== Counters (Hero + Impact) =====
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

// ===== Skeleton -> remove overlay when images loaded =====
document.querySelectorAll('.skeleton img').forEach(img=>{
  const parent = img.parentElement;
  const done = () => parent.classList.add('loaded');
  if (img.complete) done(); else img.addEventListener('load', done);
});

// ===== Back to Top =====
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('is-show', (window.scrollY ?? document.documentElement.scrollTop) > 600);
},{passive:true});
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Parallax Hero (respect reduced motion) =====
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

// ===== Kontakt (Formspree) – Senden via Fetch =====
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (formStatus) formStatus.textContent = 'Sende …';
  const data = new FormData(form);
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      if (formStatus) formStatus.textContent = 'Danke! Wir melden uns in Kürze.';
      form.reset();
    } else {
      const err = await res.json().catch(() => ({}));
      const msg = err?.errors?.[0]?.message ?? 'Fehler beim Senden. Bitte später erneut versuchen.';
      if (formStatus) formStatus.textContent = msg;
    }
  } catch {
    if (formStatus) formStatus.textContent = 'Netzwerkfehler. Bitte später erneut versuchen.';
  }
});

// ===== Roadmap Zahlenstrahl: Fortschritt folgt Scroll (wie vorher) =====
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

// ===== Galerie Lightbox =====
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

// ===== Interaktive Karte (Demo): Tooltips + Filter + Tastatur =====
(function(){
  const svg = document.querySelector('.map');
  const areas = [...document.querySelectorAll('.map .area')];
  const tip = document.getElementById('mapTip');
  const tipName = tip?.querySelector('.maptip__name');
  const tipMeta = tip?.querySelector('.maptip__meta');
  const filters = [...document.querySelectorAll('.filters input[name="filter"]')];
  if (!svg || !tip) return;
  function showTip(el, clientX, clientY){
    if (!tipName || !tipMeta) return;
    tipName.textContent = el.dataset.name ?? 'Projekt';
    tipMeta.textContent = el.dataset.output ?? '';
    tip.style.left = `${clientX}px`;
    tip.style.top = `${clientY}px`;
    tip.setAttribute('aria-hidden','false');
  }
  function hideTip(){ tip.setAttribute('aria-hidden','true'); }
  areas.forEach(el=>{
    el.addEventListener('mousemove', e=> showTip(el, e.clientX, e.clientY));
    el.addEventListener('mouseenter', e=> showTip(el, e.clientX, e.clientY));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', ()=>{
      const rect = svg.getBoundingClientRect();
      showTip(el, rect.left + rect.width/2, rect.top + 40);
    });
    el.addEventListener('blur', hideTip);
    el.addEventListener('keydown', e=>{
      if (e.key === 'Enter' || e.key === ' '){
        alert(`${el.dataset.name}\n${el.dataset.output}`); // späte: echte Detailseite
        e.preventDefault();
      }
    });
  });
  function applyFilters(){
    const active = filters.filter(f=>f.checked).map(f=>f.value);
    areas.forEach(el=>{
      const on = active.includes(el.dataset.type);
      el.style.opacity = on ? '1' : '0.18';
      el.style.pointerEvents = on ? 'auto' : 'none';
    });
  }
  filters.forEach(f=> f.addEventListener('change', applyFilters));
  applyFilters();
})();

// ===== Live-Widgets (Demo): zufällige Updates =====
(function(){
  function updateGauges(){
    document.querySelectorAll('.gauge__ring').forEach(r=>{
      const base = parseInt(r.dataset.value ?? '50', 10);
      const jitter = Math.max(0, Math.min(100, base + (Math.random()*16 - 8)));
      r.style.setProperty('--value', jitter);
      const num = r.querySelector('.gauge__num');
      if (num) num.textContent = `${Math.round(jitter)}%`;
    });
  }
  function updateBars(){
    document.querySelectorAll('.bar__fill').forEach(f=>{
      const w = Math.max(5, Math.min(95, Math.random()*100));
      f.style.width = `${Math.round(w)}%`;
      const label = f.closest('.widget')?.querySelector('.bar__label');
      if (label) label.textContent = `${Math.round(w)}%`;
    });
  }
  updateGauges(); updateBars();
  setInterval(()=>{ updateGauges(); updateBars(); }, 5000);
})();

// ===== Year in Footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== PWA: Service Worker registrieren (optional) =====
if ('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.warn('SW Registrierung fehlgeschlagen:', err));
  });
}
