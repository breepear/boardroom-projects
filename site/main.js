/* Boardroom Projects — scroll choreography
   1. Reveal + split-word reveal
   2. Parallax figures
   3. Hero scale/veil
   4. Horizontal strip tied to vertical scroll
   5. The house in the corner that builds itself with page progress
*/
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  $('#year').textContent = String(new Date().getFullYear());

  /* ---------- split words ---------- */
  $$('[data-split]').forEach(el => {
    const html = el.innerHTML.trim();
    // keep <em> wrappers, split on spaces
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 1 && n.tagName === 'BR') return;
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(tmp);
    el.innerHTML = tmp.innerHTML;
  });

  /* ---------- reveal ---------- */
  const reveals = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- builder paths ---------- */
  const builder = $('#builder');
  const paths = $$('path', builder);
  paths.forEach(p => { p.setAttribute('pathLength', '1'); });
  const stageEl = $('#builderStage');
  const stages = [
    [0.00, 'Site'], [0.10, 'Foundation'], [0.20, 'Walls'], [0.36, 'Roof'],
    [0.56, 'Windows'], [0.72, 'Door'], [0.84, 'Home']
  ];
  let stageNow = '';
  function setStage(p) {
    let name = stages[0][1];
    for (const [t, n] of stages) if (p >= t) name = n;
    if (name === stageNow) return;
    stageNow = name;
    stageEl.classList.add('swap');
    setTimeout(() => { stageEl.textContent = name; stageEl.classList.remove('swap'); }, 240);
  }

  /* ---------- scroll-driven state ---------- */
  const heroImg = $('.hero-img');
  const heroLogo = $('.hero-logo');
  const heroVeil = $('.hero-veil');
  const hero = $('.hero');
  const stripWrap = $('#strip');
  const stripTrack = $('#stripTrack');
  const stripCount = $('#stripCount');
  const stripN = stripTrack.children.length;
  const para = $$('[data-parallax]').map(el => ({ el, k: parseFloat(el.dataset.parallax) || 0 }));
  const contact = $('#contact');

  let vh = window.innerHeight, docH = 1, ticking = false;
  function measure() { vh = window.innerHeight; docH = Math.max(1, document.documentElement.scrollHeight - vh); }
  measure();

  function frame() {
    ticking = false;
    const y = window.scrollY;
    const p = clamp(y / docH, 0, 1);

    // hero: scale image and drift logo as you leave
    const hp = clamp(y / (hero.offsetHeight || vh), 0, 1);
    if (!reduce) {
      heroImg.style.transform = `scale(${1.06 + hp * 0.14}) translateY(${hp * 6}%)`;
      heroLogo.style.transform = `translateY(${hp * -18}%)`;
      heroLogo.style.opacity = String(1 - clamp((hp - 0.35) / 0.4, 0, 1));
      heroVeil.style.opacity = String(1 + hp * 0.8);
    }

    // strip: sticky section, progress across its wrapper
    const sr = stripWrap.getBoundingClientRect();
    const sp = clamp(-sr.top / (sr.height - vh), 0, 1);
    const maxX = Math.max(0, stripTrack.scrollWidth - window.innerWidth + 0);
    if (!reduce) stripTrack.style.transform = `translate3d(${-sp * maxX}px,0,0)`;
    const idx = Math.min(stripN, Math.floor(sp * (stripN - 1) + 1 + 0.0001));
    stripCount.textContent = `${String(idx).padStart(2, '0')} / ${String(stripN).padStart(2, '0')}`;

    // parallax figures
    if (!reduce) {
      for (const { el, k } of para) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const c = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-c * k).toFixed(1)}px, 0)`;
      }
    }

    // builder: show after the hero, draw with page progress
    builder.classList.toggle('on', y > vh * 0.55);
    if (!reduce) {
      for (const path of paths) {
        const s = parseFloat(path.dataset.s), e = parseFloat(path.dataset.e);
        const t = clamp((p - s) / (e - s), 0, 1);
        path.style.strokeDashoffset = String(1 - t);
      }
    }
    setStage(p);

    // dark ending: flip builder ink when the contact block covers the corner
    const cr = contact.getBoundingClientRect();
    document.body.classList.toggle('dark-end', cr.top < vh - 60);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', () => { measure(); req(); });
  window.addEventListener('load', () => { measure(); req(); });
  // fonts and images shift layout; re-measure a few times early on
  [300, 1200, 3000].forEach(ms => setTimeout(() => { measure(); req(); }, ms));
  frame();
})();
