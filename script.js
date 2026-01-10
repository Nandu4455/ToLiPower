
// ===== Dark Mode Toggle =====
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
menuBtn?.addEventListener('click', () => {
  header.classList.toggle('nav--open');
});

// ===== Smooth Scroll für Anchor-Links =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el){
      e.preventDefault();
      header.classList.remove('nav--open');
      el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

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

// ===== Counter Animation =====
function animateCounter(el, to, duration=1200){
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0) / duration);
    const val = Math.floor(p * to);
    el.textContent = val.toLocaleString('de-CH');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const stats = document.querySelectorAll('.stat__num');
const statsObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const num = parseInt(entry.target.dataset.count || '0', 10);
      animateCounter(entry.target, num);
      statsObserver.unobserve(entry.target);
    }
  });
},{threshold:0.5});
stats.forEach(el=> statsObserver.observe(el));

// ===== Fake Kontakt-Submit (Frontend-Demo) =====
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.querySelector('.form__status');
sendBtn?.addEventListener('click', ()=>{
  statusEl.textContent = 'Sende …';
  setTimeout(()=>{
    statusEl.textContent = 'Danke! Wir melden uns in Kürze.';
  }, 800);
});

// ===== Kleiner Parallax-Effekt auf Hero-Bild =====
const heroImg = document.querySelector('.hero__image img');
let rafId = null;
window.addEventListener('scroll', ()=>{
  if (!heroImg) return;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(()=>{
    const y = window.scrollY;
    heroImg.style.transform = `scale(1.04) translateY(${Math.min(40, y*0.04)}px)`;
  });
});
