
// ===== Theme Toggle =====
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('tolipower-theme');
if (savedTheme) {
  html.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}
themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('tolipower-theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ===== Mobile Menü =====
const menuBtn = document.getElementById('menuToggle');
const header = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => header.classList.toggle('nav--open'));

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el){
      e.preventDefault();
      header.classList.remove('nav--open');
      el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// ===== Staggered Headline (Zeichenweise) =====
(function(){
  const h = document.querySelector('.fx-headline');
  if (!h) return;
  const nodes = [];
  h.childNodes.forEach(n=>{
    if (n.nodeType === 3){ // Text
      n.textContent.split('').forEach(ch=>{
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        nodes.push(span);
      });
    } else {
      nodes.push(n.cloneNode(true));
    }
  });
  h.innerHTML = '';
  nodes.forEach((node,i)=>{
    if (node.classList && node.classList.contains('char')) node.style.animationDelay = `${i*0.02}s`;
    h.appendChild(node);
  });
})();

// ===== Reveal on Scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// ===== Hero Counters & Impact KPIs =====
function animateCounter(el, to, duration=1300){
  const start = 0; const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0) / duration);
    const val = Math.floor(start + p * (to - start));
    el.textContent = val.toLocaleString('de-CH');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counters = document.querySelectorAll('.stat__num, .kpi__num');
const counterIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const num = parseInt(entry.target.dataset.count || '0', 10);
      animateCounter(entry.target, num);
      counterIO.unobserve(entry.target);
    }
  });
},{threshold:0.5});
counters.forEach(el=> counterIO.observe(el));

// ===== Scrollspy =====
const spyLinks = [...document.querySelectorAll('.nav__links .spy')];
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

// ===== Skeleton -> remove overlay when images loaded =====
document.querySelectorAll('.skeleton img').forEach(img=>{
  const parent = img.parentElement;
  const done = () => parent.classList.add('loaded');
  if (img.complete) done(); else img.addEventListener('load', done);
});

// ===== Back to Top =====
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('is-show', (window.scrollY || document.documentElement.scrollTop) > 600);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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

// ===== Kontakt Fake-Submit =====
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.querySelector('.form__status');
sendBtn?.addEventListener('click', ()=>{
  statusEl.textContent = 'Sende …';
  setTimeout(()=>{ statusEl.textContent = 'Danke! Wir melden uns in Kürze.'; }, 800);
});

// ===== Year in Footer =====
document.getElementById('year').textContent = new Date().getFullYear();
