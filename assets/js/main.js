/* Willams Dantas · Portfólio — interações */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ano no rodapé */
  const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Título do hero palavra por palavra ---------- */
  const split = $('.split');
  if (split && !reduce) {
    let wi = 0;
    const wrap = (node, gold) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--wi', wi++);
            if (gold) inner.className = 'gold-text';
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          const isGold = gold || child.classList.contains('gold-text');
          child.classList.remove('gold-text');
          wrap(child, isGold);
        }
      });
    };
    split.setAttribute('aria-label', split.textContent.replace(/\s+/g, ' ').trim());
    wrap(split);
    $$('.w', split).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  }

  /* ---------- Header ---------- */
  const header = $('.header');
  const fab = $('.fab');
  const onScroll = () => {
    const yy = window.scrollY;
    header.classList.toggle('is-scrolled', yy > 8);
    if (fab) fab.classList.toggle('is-visible', yy > window.innerHeight * 0.8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu do celular */
  const menuBtn = $('.menu-btn');
  const mobileNav = $('#menu-mobile');
  const setMenu = (open) => {
    mobileNav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!mobileNav.classList.contains('is-open')));
  $$('a', mobileNav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* Menu ativo conforme a seção */
  const navLinks = $$('.nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Entrada dos elementos ---------- */
  const revealEls = $$('[data-reveal], [data-step]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Trilhos arrastáveis ---------- */
  const rails = $$('.rail');
  rails.forEach((rail) => {
    const ctrl = $(`[data-rail-ctrl="${rail.id}"]`);
    const bar = $(`[data-progress="${rail.id}"]`);
    const prev = ctrl && $('[data-dir="-1"]', ctrl);
    const next = ctrl && $('[data-dir="1"]', ctrl);
    const step = () => {
      const item = rail.firstElementChild;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 16;
      return item ? item.getBoundingClientRect().width + gap : 320;
    };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max - 2;
      if (bar) {
        const visible = rail.clientWidth / rail.scrollWidth;
        const p = max > 0 ? rail.scrollLeft / max : 1;
        bar.style.width = `${Math.min(100, (visible + (1 - visible) * p) * 100)}%`;
      }
    };
    if (ctrl) $$('[data-dir]', ctrl).forEach((b) => b.addEventListener('click', () => {
      rail.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    }));
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    /* Arrastar com o mouse */
    let down = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) { rail.classList.add('is-dragging'); rail.scrollLeft = startLeft - dx; }
    });
    window.addEventListener('pointerup', () => {
      if (!down) return; down = false;
      if (rail.classList.contains('is-dragging')) {
        rail.classList.remove('is-dragging');
        const s = step(); const target = Math.round(rail.scrollLeft / s) * s;
        rail.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    rail.addEventListener('click', (e) => { if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    rail.addEventListener('keydown', (e) => {
      if (e.target !== rail) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
  });

  /* ---------- Abas ---------- */
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (on) {
          panel.hidden = false;
          panel.classList.add('is-in');
          if (!reduce) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
          const r = $('.rail', panel); if (r) r.scrollLeft = 0;
        } else { panel.hidden = true; }
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-caption');
  const lbCount = $('#lb-count');
  let group = [], index = 0, lastFocus = null;

  const show = (i) => {
    index = (i + group.length) % group.length;
    const shot = group[index];
    lbImg.classList.remove('is-ready');
    const src = shot.dataset.full;
    const img = new Image();
    img.onload = () => {
      lbImg.src = src;
      lbImg.alt = shot.querySelector('img').alt;
      requestAnimationFrame(() => lbImg.classList.add('is-ready'));
    };
    img.src = src;
    lbCap.textContent = shot.dataset.caption || '';
    lbCount.textContent = group.length > 1 ? `${index + 1} de ${group.length}` : '';
    $('[data-lb="prev"]', lb).hidden = group.length < 2;
    $('[data-lb="next"]', lb).hidden = group.length < 2;
  };
  const open = (shot) => {
    const container = shot.closest('[data-group]');
    group = container ? $$('.shot', container) : [shot];
    lastFocus = document.activeElement;
    lb.hidden = false;
    lb.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    show(group.indexOf(shot));
    requestAnimationFrame(() => $('[data-lb="close"]', lb).focus({ preventScroll: true }));
  };
  const close = () => {
    lb.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => { lb.hidden = true; lbImg.classList.remove('is-ready'); }, reduce ? 0 : 300);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  $$('.shot').forEach((s) => s.addEventListener('click', () => open(s)));
  lb.addEventListener('click', (e) => {
    const act = e.target.closest('[data-lb]');
    if (act) {
      const a = act.dataset.lb;
      if (a === 'close') close();
      if (a === 'prev') show(index - 1);
      if (a === 'next') show(index + 1);
      return;
    }
    if (e.target === lb || e.target.classList.contains('lightbox__stage')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'Tab') {
      const f = $$('button:not([hidden])', lb);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  /* Deslizar no celular */
  let tx = null;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 48 && group.length > 1) show(index + (dx < 0 ? 1 : -1));
  });
})();
