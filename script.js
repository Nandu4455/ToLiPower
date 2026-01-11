
// ===== Dark Mode Toggle =====
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('tolipower-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
  html.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
} else {
  html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  themeBtn.textContent = prefersDark ? '☀️' : '🌙';
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
  const isOpen = header.classList.toggle('nav--open');
  menuBtn.setAttribute('aria-expanded', isOpen);
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      header.classList.remove('nav--open');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== Reveal on Scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Counter Animation =====
function animateCounter(el, to, duration = 1200) {
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - t0) / duration);
    const val = Math.floor(p * to);
    el.textContent = val.toLocaleString('de-CH');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const stats = document.querySelectorAll('.stat__num');
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const num = parseInt(entry.target.dataset.count || '0', 10);
      animateCounter(entry.target, num);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
stats.forEach(el => statsObserver.observe(el));

// ===== Scroll-to-Top Button =====
const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollBtn.classList.add('show');
  } else {
    scrollBtn.classList.remove('show');
  }
});
scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Skeleton Loading =====
document.querySelectorAll('.skeleton img').forEach(img => {
  if (img.complete) img.parentElement.classList.add('loaded');
  img.addEventListener('load', () => img.parentElement.classList.add('loaded'));
});
``
