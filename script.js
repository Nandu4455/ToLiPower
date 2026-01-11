
/* ============== Helpers ============== */
const $  = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

/* ============== Nav: mobile menu / scrollspy / theme / contrast ============== */
(() => {
  const menuBtn = $('#menuToggle');
  const links   = $('.nav__links');
  if (menuBtn && links){
    menuBtn.addEventListener('click', () => {
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // Scrollspy
  const spyTargets = $$('.spy');
  const sections = spyTargets.map(a => $(a.getAttribute('href')));
  const obs = new IntersectionObserver(entries => {
    for (const e of entries){
      const id = '#' + e.target.id;
      const link = spyTargets.find(a => a.getAttribute('href') === id);
      if (link) link.classList.toggle('active', e.isIntersecting);
    }
  }, {rootMargin:"-50% 0px -50% 0px", threshold:0});
  sections.filter(Boolean).forEach(sec => obs.observe(sec));

  // Theme toggle
  const themeBtn = $('#themeToggle');
  if (themeBtn){
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
    });
  }

  // Contrast toggle
  const contrastBtn = $('#contrastToggle');
  if (contrastBtn){
    contrastBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('contrast');
    });
  }
})();

/* ============== Counters ============== */
(() => {
  const counters = $$('[data-count]');
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count || 0);
      let cur = 0;
      const step = Math.max(1, Math.round(target/60));
      const int = setInterval(() => {
        cur += step;
        if (cur >= target){ cur = target; clearInterval(int); }
        el.textContent = cur.toString();
      }, 18);
      io.unobserve(el);
    });
  }, {threshold:.7});
  counters.forEach(c => io.observe(c));
})();

/* ============== Numberline (Roadmap) ============== */
(() => {
  const track = $('.numberline__track');
  const progress = $('.numberline__progress');
  const dot = $('.numberline__dot');
  if (!track || !progress || !dot) return;

  function setPos(ratio){
    ratio = Math.max(0, Math.min(1, ratio));
    const width = track.getBoundingClientRect().width;
    const x = width * ratio;
    progress.style.width = `${x}px`;
    dot.style.left = `calc(${x}px - 9px)`;
  }
  // Demo-Animation
  let t = 0, dir = 1;
  setInterval(() => {
    t += 0.02 * dir;
    if (t >= 1) dir = -1; else if (t <= 0) dir = 1;
    setPos(t);
  }, 120);
})();

/* ============== Gallery Lightbox ============== */
(() => {
  const lb = $('#lightbox'), frame = $('.lightbox__frame img', lb), cap = $('.lightbox__caption', lb), close = $('.lightbox__close', lb);
  if (!lb) return;
  $$('.gallery .item').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      frame.src = a.href;
      cap.textContent = a.dataset.title || '';
      lb.setAttribute('aria-hidden','false');
    });
  });
  function hide(){ lb.setAttribute('aria-hidden','true'); frame.src=''; cap.textContent='' }
  close.addEventListener('click', hide);
  lb.addEventListener('click', e => { if (e.target === lb) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
})();

/* ============== Back to Top + Footer Jahr ============== */
(() => {
  const btn = $('#toTop');
  if (btn){
    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-show', window.scrollY > 600);
    }, {passive:true});
    btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  }
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ============== Kontakt: Statusanzeige ============== */
(() => {
  const form = $('#contactForm'), status = $('#formStatus');
  if (!form || !status) return;
  form.addEventListener('submit', () => {
    status.textContent = 'Senden ...';
    setTimeout(() => status.textContent = 'Danke! Wir melden uns.', 1200);
  });
})();

/* ============== Reveal on Scroll ============== */
(() => {
  const revs = $$('.reveal');
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.target.classList.toggle('is-visible', e.isIntersecting));
  }, {threshold:.18});
  revs.forEach(el => io.observe(el));
})();

/* ============== Widgets Demo (optional) ============== */
(() => {
  const rings = $$('.gauge__ring');
  rings.forEach(r => {
    const v = Number(r.dataset.value || 0);
    r.style.setProperty('--val', v);
    r.style.setProperty('--ang', `${v*1.8}deg`);
    const num = $('.gauge__num', r);
    if (num) num.textContent = `${v}%`;
  });
})();

/* ============== Interaktive Karte – SVG laden + CSV-Join + Tooltip ============== */
(() => {
  const container = $('#tolimap-container');
  const tip = $('#mapTip');
  const energyUrl = '/daten/energie.csv';
  if (!container) return;

  // CSV laden:
  const energyByBfs = new Map();
  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(',');
    const idx = {
      bfs: header.indexOf('bfs'),
      name: header.indexOf('name'),
      solar: header.indexOf('solar_count'),
      wind: header.indexOf('wind_count'),
      water: header.indexOf('water_count'),
      majority: header.indexOf('majority')
    };
    for (const line of lines){
      if (!line.trim()) continue;
      const cols = line.split(',');
      const bfs = (cols[idx.bfs] || '').trim();
      if (!bfs) continue;
      const solar = Number((cols[idx.solar] || '').trim() || 0);
      const wind  = Number((cols[idx.wind]  || '').trim() || 0);
      const water = Number((cols[idx.water] || '').trim() || 0);
      let maj     = (cols[idx.majority] || '').trim();
      if (!maj){
        const max = Math.max(solar, wind, water);
        maj = (max === wind) ? 'wind' : (max === water) ? 'wasser' : 'solar';
      }
      energyByBfs.set(bfs, { solar, wind, water, majority: maj });
    }
  }

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

  Promise.all([
    fetch(energyUrl, { cache: 'no-store' }).then(r => r.ok ? r.text() : Promise.reject('CSV nicht gefunden')).then(parseCSV),
    fetch(container.dataset.src || '/bilder/tolimap.svg', { cache: 'no-store' }).then(r => r.ok ? r.text() : Promise.reject('SVG nicht gefunden'))
  ])
  .then(([, svgText]) => {
    container.innerHTML = svgText;

    const svg = $('svg', container);
    if (!svg) throw new Error('Kein <svg> im geladenen Dokument');

    svg.classList.add('map');
    if (!svg.getAttribute('role')) svg.setAttribute('role', 'img');
    if (!svg.getAttribute('aria-label') && !svg.querySelector('title')) {
      svg.setAttribute('aria-label', 'ToLi Power – Gemeinden im Toggenburg & Linthgebiet');
    }

    const paths = $$('path[id]', svg);
    if (!paths.length) {
      console.warn('Keine pfade mit id gefunden – prüfe dein SVG.');
      return;
    }

    let active = null;
    function select(el){
      if (active === el) { el.classList.remove('is-active'); active = null; return; }
      if (active) active.classList.remove('is-active');
      el.classList.add('is-active'); active = el;
    }

    paths.forEach(p => {
      // A11y Basics
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');

      const gName = p.id || 'Gemeinde';
      const bfs   = (p.getAttribute('data-bfs_nummer') || '').trim();
      const s     = bfs && energyByBfs.get(bfs) || { solar:0, wind:0, water:0, majority:'mix' };

      // aria-label mit Stats
      p.setAttribute('aria-label', `${gName} – Solar: ${s.solar} • Wind: ${s.wind} • Wasser: ${s.water} • Mehrheit: ${s.majority}`);
      p.dataset.type = s.majority; // später nützlich für Filter

      // Events
      p.addEventListener('click', () => select(p));
      p.addEventListener('mousemove', e => {
        const txt = `${gName} — Solar: ${s.solar} • Wind: ${s.wind} • Wasser: ${s.water} • Mehrheit: ${s.majority}`;
        showTip(txt, e.clientX, e.clientY);
      });
      p.addEventListener('mouseleave', hideTip);

      p.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(p);
        }
      });
    });

    // Klick außerhalb → Auswahl & Tooltip schließen
    document.addEventListener('click', (e) => {
      const inside = svg.contains(e.target);
      if (!inside) {
        hideTip();
        if (active) { active.classList.remove('is-active'); active = null; }
      }
    });

    // Scroll/Resize → Tooltip ausblenden
    window.addEventListener('scroll', hideTip, { passive: true });
    window.addEventListener('resize', hideTip);
  })
  .catch(err => console.error('[Karte] Fehler:', err));
})();
