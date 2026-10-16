/* Tessumax — runtime da landing page
   Sem dependências. Tudo animado apenas com transform/opacity. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ tema */
  const THEME_KEY = 'tessumax-theme';

  function setTheme(theme, persist = true) {
    root.dataset.theme = theme;
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (_) {} }
    const isLight = theme === 'light';
    $$('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(isLight));
      btn.setAttribute('aria-label', isLight ? 'Mudar para tema tinta (escuro)' : 'Mudar para tema papel (claro)');
      const label = $('[data-theme-label]', btn);
      if (label) label.textContent = isLight ? 'Papel' : 'Tinta';
    });
    window.dispatchEvent(new CustomEvent('tessumax:theme', { detail: { theme } }));
  }

  function initTheme() {
    const stored = (() => { try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; } })();
    const initial = root.dataset.theme || stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(initial, false);
    $$('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));
    });
  }

  /* ------------------------------------------------------------- preloader */
  function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;

    const numEl = $('#preloaderNum');
    const barEl = $('#preloaderBar');
    let visited = false;
    try { visited = sessionStorage.getItem('tessumax-visited') === '1'; } catch (_) {}

    const finish = () => {
      pre.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      window.setTimeout(() => pre.classList.add('is-gone'), 640);
      window.setTimeout(() => { pre.style.display = 'none'; }, 1400);
      window.dispatchEvent(new CustomEvent('tessumax:ready'));
    };

    if (visited || !motionOK()) {
      if (numEl) numEl.textContent = '100';
      if (barEl) barEl.style.transform = 'scaleX(1)';
      requestAnimationFrame(finish);
      return;
    }

    try { sessionStorage.setItem('tessumax-visited', '1'); } catch (_) {}

    document.body.classList.add('is-loading');
    const started = performance.now();
    const MIN_MS = 950;
    let assetsReady = false;
    let progress = 0;
    let lastPaint = 0;

    const assetsDone = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((res) => {
        if (document.readyState === 'complete') return res();
        window.addEventListener('load', res, { once: true });
      })
    ]);
    assetsDone.then(() => { assetsReady = true; });

    const tick = (now) => {
      const elapsed = now - started;
      const timeTarget = Math.min(96, (elapsed / MIN_MS) * 96);
      const target = assetsReady ? 100 : timeTarget;
      progress += (target - progress) * 0.08;
      if (progress > target) progress = target;

      const shown = Math.round(progress);
      if (numEl && now - lastPaint > 60) { numEl.textContent = String(shown); lastPaint = now; }
      if (barEl) barEl.style.transform = `scaleX(${(progress / 100).toFixed(4)})`;

      if (progress >= 99.4 && assetsReady && elapsed >= MIN_MS) {
        if (numEl) numEl.textContent = '100';
        if (barEl) barEl.style.transform = 'scaleX(1)';
        window.setTimeout(finish, 260);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    window.setTimeout(() => { assetsReady = true; }, 4200);
  }

  /* ------------------------------------------------------ revelar no scroll */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (!motionOK() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el, i) => {
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', String(i % 8));
      io.observe(el);
    });
  }

  /* -------------------------------------------------------------- header/nav */
  function initHeader() {
    const header = $('#siteHeader');
    const bar = $('#scrollProgress');
    const navToggle = $('#navToggle');
    const drawer = $('#navDrawer');
    const toTop = $('#toTop');

    let ticking = false;
    const paint = () => {
      const y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 24);
      if (toTop) {
        const show = y > window.innerHeight * 0.9;
        toTop.classList.toggle('is-visible', show);
        toTop.setAttribute('aria-hidden', String(!show));
        toTop.tabIndex = show ? 0 : -1;
      }
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(1, y / max) : 0;
        bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();

    if (toTop) toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
    });

    /* gaveta mobile */
    let lastFocus = null;
    const setNav = (open) => {
      if (!drawer || !navToggle) return;
      document.body.classList.toggle('is-nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      try { drawer.inert = !open; } catch (_) { drawer.setAttribute('inert', open ? '' : 'inert'); }
      if (open) {
        lastFocus = document.activeElement;
        const first = drawer.querySelector('a, button');
        if (first) window.setTimeout(() => first.focus(), 120);
      } else if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    };
    if (navToggle && drawer) {
      try { drawer.inert = true; } catch (_) { drawer.setAttribute('inert', ''); }
      setNav(false);
      navToggle.addEventListener('click', () => setNav(!document.body.classList.contains('is-nav-open')));
      $$('a, button', drawer).forEach((el) => el.addEventListener('click', () => {
        if (el.hasAttribute('data-keep-open')) return;
        setNav(false);
      }));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('is-nav-open')) setNav(false);
      });
    }

    /* seção ativa na navegação */
    const links = $$('[data-nav-link]');
    const sections = links
      .map((a) => $(a.getAttribute('href')))
      .filter(Boolean);
    if (sections.length && 'IntersectionObserver' in window) {
      const visible = new Map();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => { if (ratio > bestRatio) { bestRatio = ratio; best = id; } });
        links.forEach((a) => {
          const on = best !== null && a.getAttribute('href') === `#${best}`;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.6, 1] });
      sections.forEach((s) => io.observe(s));
    }
  }

  /* --------------------------------------------------------------- paralaxe */
  function initParallax() {
    const layers = $$('[data-parallax]');
    if (!layers.length || !motionOK()) return;
    let ticking = false;
    const paint = () => {
      const vh = window.innerHeight;
      layers.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.08;
        const center = rect.top + rect.height / 2 - vh / 2;
        const shift = (-center * speed).toFixed(2);
        el.style.transform = `translate3d(0, ${shift}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  }

  /* -------------------------------------------------------- spotlight cursor */
  function initSpotlight() {
    const spot = $('#spotlight');
    if (!spot || !motionOK()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.3;
    let tx = x;
    let ty = y;
    let raf = 0;

    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      spot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!spot.classList.contains('is-on')) spot.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', () => spot.classList.remove('is-on'));
    window.addEventListener('tessumax:ready', () => spot.classList.add('is-ready'), { once: true });
    spot.classList.add('is-ready');
  }

  /* --------------------------------------------------------- canvas do hero */
  function initHeroCanvas() {
    const canvas = $('#heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    let w = 0;
    let h = 0;
    let points = [];
    let raf = 0;
    let visible = true;
    let running = false;
    const pointer = { x: -9999, y: -9999, on: false };
    const still = !motionOK();

    const ink = () => (root.dataset.theme === 'light' ? '12, 12, 14' : '236, 239, 245');
    const strength = () => (root.dataset.theme === 'light' ? 1 : 1);

    const seed = () => {
      const count = Math.round(Math.min(84, Math.max(22, (w * h) / 26000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.6 + Math.random() * 1.3
      }));
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      const color = ink();
      const k = strength();
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        for (let j = i + 1; j < points.length; j += 1) {
          const q = points[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 19000) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / 138) * 0.24 * k;
          if (alpha <= 0.004) continue;
          ctx.strokeStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        ctx.fillStyle = `rgba(${color}, ${(0.42 * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        if (pointer.on) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 130 && d > 0.001) {
            const push = (1 - d / 130) * 0.9;
            p.x += (dx / d) * push;
            p.y += (dy / d) * push;
          }
        }
      }
    };

    const frame = () => {
      step();
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || still || document.hidden || !visible) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    if (still) {
      draw();
    } else {
      start();
    }

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => { resize(); if (still) draw(); });
      ro.observe(parent);
    } else {
      window.addEventListener('resize', () => { resize(); if (still) draw(); });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) start(); else stop();
        });
      }, { threshold: 0.02 });
      io.observe(canvas);
    }

    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    window.addEventListener('tessumax:theme', () => { if (still) draw(); });
    const surface = canvas.closest('section') || parent;
    surface.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.on = true;
    }, { passive: true });
    surface.addEventListener('pointerleave', () => { pointer.on = false; });
  }

  /* -------------------------------------------------------------- contadores */
  function initCounters() {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      if (!motionOK()) {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        return;
      }
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    nodes.forEach((n) => io.observe(n));
  }

  /* -------------------------------------------------------------------- abas */
  function initTabs() {
    $$('[data-tabs]').forEach((group) => {
      const tabs = $$('[role="tab"]', group);
      const panels = $$('[role="tabpanel"]', group);
      if (!tabs.length) return;

      const activate = (index, focus = false) => {
        tabs.forEach((tab, i) => {
          const on = i === index;
          tab.setAttribute('aria-selected', String(on));
          tab.tabIndex = on ? 0 : -1;
          tab.classList.toggle('is-active', on);
          if (on && focus) tab.focus();
        });
        panels.forEach((panel, i) => {
          const on = i === index;
          panel.hidden = !on;
          panel.classList.toggle('is-active', on);
          if (on) {
            panel.classList.remove('is-entering');
            void panel.offsetWidth;
            panel.classList.add('is-entering');
          }
        });
        group.dataset.active = tabs[index] ? tabs[index].dataset.tab || String(index) : '0';
      };

      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activate(i));
        tab.addEventListener('keydown', (e) => {
          const last = tabs.length - 1;
          let next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = last;
          if (next === null) return;
          e.preventDefault();
          activate(next, true);
        });
      });

      let start = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      if (start < 0) start = 0;
      activate(start);
    });

    /* deep link opcional: ?frente=sistemas */
    const frentes = $('#frentesTabs');
    if (frentes) {
      const params = new URLSearchParams(window.location.search);
      const want = params.get('frente');
      if (want) {
        const tab = $(`[role="tab"][data-tab="${want}"]`, frentes);
        if (tab) tab.click();
      }
      $$('[role="tab"]', frentes).forEach((tab) => {
        tab.addEventListener('click', () => {
          const url = new URL(window.location.href);
          url.searchParams.set('frente', tab.dataset.tab || '');
          if (location.protocol === 'http:' || location.protocol === 'https:') {
            try { history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`); } catch (_) {}
          }
        });
      });
    }
  }

  /* ------------------------------------------------------- filtros da stack */
  function initFilters() {
    $$('[data-filter-group]').forEach((group) => {
      const container = group.parentElement || group;
      const buttons = $$('[data-filter]', group);
      const targetSel = group.dataset.filterGroup;
      /* O seletor aponta para o container alvo (ex.: "#stackGrid"); os itens
         são os descendentes com [data-category]. Aceita também um seletor que
         já aponte direto para os itens. */
      const targets = targetSel ? $$(targetSel, container) : [];
      let items = targets.filter((el) => el.dataset.category);
      if (!items.length) items = targets.flatMap((el) => $$('[data-category]', el));
      if (!buttons.length || !items.length) {
        console.warn('[tessumax] filtros: nenhum item [data-category] para', targetSel);
        return;
      }

      const apply = (value) => {
        buttons.forEach((b) => {
          const on = b.dataset.filter === value;
          b.setAttribute('aria-pressed', String(on));
          b.classList.toggle('is-active', on);
        });
        let shown = 0;
        items.forEach((item) => {
          const tags = (item.dataset.category || '').split(/\s+/).filter(Boolean);
          const match = value === 'all' || tags.includes(value);
          item.classList.toggle('is-hidden', !match);
          item.setAttribute('aria-hidden', String(!match));
          if (match) shown += 1;
        });
        const live = $('[data-filter-count]', container);
        if (live) live.textContent = `${shown} ${shown === 1 ? 'tecnologia exibida' : 'tecnologias exibidas'}`;
      };

      buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter || 'all')));
      apply('all');
    });
  }

  /* ----------------------------------------------------------------- acordeão */
  function initAccordions() {
    $$('[data-accordion]').forEach((group) => {
      const items = $$('[data-accordion-item]', group);
      const single = group.dataset.accordion === 'single';
      const setOpen = (item, open) => {
        const btn = $('[data-accordion-trigger]', item);
        const panel = $('[data-accordion-panel]', item);
        if (!btn || !panel) return;
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        panel.setAttribute('aria-hidden', String(!open));
      };
      items.forEach((item) => {
        const btn = $('[data-accordion-trigger]', item);
        if (!btn) return;
        setOpen(item, false);
        btn.addEventListener('click', () => {
          const willOpen = !item.classList.contains('is-open');
          if (single && willOpen) items.forEach((other) => { if (other !== item) setOpen(other, false); });
          setOpen(item, willOpen);
        });
      });
    });
  }

  /* ------------------------------------------------------------------- trilho */
  function initRails() {
    $$('[data-rail]').forEach((rail) => {
      const scroller = $('.rail-track', rail) || rail;
      const scope = rail.closest('section') || document;
      const prev = $('[data-rail-prev]', scope);
      const next = $('[data-rail-next]', scope);
      if (!scroller) return;

      const step = () => Math.max(240, Math.min(scroller.clientWidth * 0.8, 460));
      const sync = () => {
        const max = scroller.scrollWidth - scroller.clientWidth - 2;
        if (prev) prev.disabled = scroller.scrollLeft <= 2;
        if (next) next.disabled = scroller.scrollLeft >= max;
      };
      if (prev) prev.addEventListener('click', () => scroller.scrollBy({ left: -step(), behavior: motionOK() ? 'smooth' : 'auto' }));
      if (next) next.addEventListener('click', () => scroller.scrollBy({ left: step(), behavior: motionOK() ? 'smooth' : 'auto' }));
      scroller.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync, { passive: true });
      sync();

      /* arrastar para rolar (ponteiro fino) */
      let down = false;
      let startX = 0;
      let startScroll = 0;
      scroller.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        down = true;
        startX = e.clientX;
        startScroll = scroller.scrollLeft;
        scroller.classList.add('is-dragging');
      });
      window.addEventListener('pointermove', (e) => {
        if (!down) return;
        scroller.scrollLeft = startScroll - (e.clientX - startX);
      });
      window.addEventListener('pointerup', () => {
        if (!down) return;
        down = false;
        scroller.classList.remove('is-dragging');
        sync();
      });
    });
  }

  /* -------------------------------------------------------------- progresso */
  function initProcess() {
    const stage = $('#processo');
    if (!stage) return;
    const steps = $$('[data-process-step]', stage);
    const rail = $('#processRail');
    if (!steps.length) return;

    const activate = (index) => {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
      if (rail) rail.style.setProperty('--process-progress', String((index + 1) / steps.length));
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(Number(entry.target.dataset.index || 0));
        });
      }, { rootMargin: '-40% 0px -40% 0px', threshold: 0.3 });
      steps.forEach((s, i) => { s.dataset.index = String(i); io.observe(s); });
    }
    activate(0);
  }

  /* ---------------------------------------------------------------- marquee */
  function initMarquee() {
    $$('[data-marquee]').forEach((marquee) => {
      const track = $('.marquee-track', marquee);
      if (!track) return;
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentElement.appendChild(clone);
    });
  }

  /* -------------------------------------------------------------- formulário */
  function openExternal(url) {
    let win = null;
    try { win = window.open(url, '_blank', 'noopener'); } catch (_) { win = null; }
    if (!win) {
      try {
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
      } catch (_) {}
    }
    return win;
  }

  function initForm() {
    const form = $('#briefForm');
    if (!form) return;

    const status = $('#formStatus');
    const fields = {
      nome: { el: $('#fieldNome'), test: (v) => v.trim().length >= 2, msg: 'Digite seu nome (mínimo 2 caracteres).' },
      contato: {
        el: $('#fieldContato'),
        test: (v) => v.trim().length >= 6 && (/.+@.+\..+/.test(v) || v.replace(/\D/g, '').length >= 10),
        msg: 'Informe um e-mail válido ou um WhatsApp com DDD.'
      },
      escopo: { el: $('#fieldEscopo'), test: (v) => v.trim().length >= 20, msg: 'Conte um pouco mais: pelo menos 20 caracteres sobre o que você precisa.' }
    };

    const setError = (key, invalid) => {
      const f = fields[key];
      if (!f || !f.el) return;
      const box = document.querySelector(`[data-error-for="${key}"]`);
      const wrap = f.el.closest('.field') || f.el.parentElement;
      if (wrap) wrap.classList.toggle('has-error', invalid);
      f.el.setAttribute('aria-invalid', String(invalid));
      if (box) {
        box.textContent = invalid ? f.msg : '';
        box.hidden = !invalid;
      }
    };

    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (!f.el) return;
      f.el.addEventListener('blur', () => setError(key, !f.test(f.el.value)));
      f.el.addEventListener('input', () => {
        if ((f.el.closest('.field') || { classList: { contains: () => false } }).classList.contains('has-error')) {
          setError(key, !f.test(f.el.value));
        }
      });
    });

    const summary = () => {
      const tipo = $('#fieldTipo');
      const prazo = $('#fieldPrazo');
      const lines = [
        'Brief — Tessumax',
        `Nome: ${fields.nome.el.value.trim()}`,
        `Contato: ${fields.contato.el.value.trim()}`,
        `Tipo de projeto: ${tipo && tipo.value ? tipo.value : 'não informado'}`,
        `Prazo desejado: ${prazo && prazo.value ? prazo.value : 'a definir'}`,
        '',
        'Escopo:',
        fields.escopo.el.value.trim()
      ];
      return lines.join('\n');
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;
      Object.keys(fields).forEach((key) => {
        const f = fields[key];
        const invalid = !f.test(f.el.value);
        setError(key, invalid);
        if (invalid && !firstInvalid) firstInvalid = f.el;
      });

      if (firstInvalid) {
        if (status) {
          status.hidden = false;
          status.dataset.state = 'error';
          status.textContent = 'Faltam informações: revise os campos marcados antes de enviar.';
        }
        firstInvalid.focus();
        return;
      }

      const url = `https://wa.me/5591986134599?text=${encodeURIComponent(summary())}`;
      openExternal(url);
      if (status) {
        status.hidden = false;
        status.dataset.state = 'ok';
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Abrir o WhatsApp';
        status.replaceChildren(link, document.createTextNode(' — confira a mensagem e envie.'));
      }
    });

    const copyBtn = $('#copyBrief');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const text = summary();
        try {
          if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
          else throw new Error('clipboard indisponível');
          copyBtn.dataset.state = 'copied';
          copyBtn.textContent = 'Resumo copiado';
          window.setTimeout(() => { copyBtn.textContent = 'Copiar resumo'; delete copyBtn.dataset.state; }, 2400);
        } catch (_) {
          if (status) {
            status.hidden = false;
            status.dataset.state = 'error';
            status.textContent = 'Não foi possível copiar automaticamente. Selecione o texto do formulário e copie manualmente.';
          }
        }
      });
    }
  }

  /* ------------------------------------------------------------------- anos */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* ------------------------------------------------------------------- boot */
  const safe = (name, fn) => {
    try { fn(); } catch (err) {
      console.error('[tessumax] falha em ' + name, err);
      window.dispatchEvent(new CustomEvent('tessumax:error', { detail: { module: name, error: err } }));
    }
  };

  const boot = () => {
    safe('tema', initTheme);
    safe('preloader', initPreloader);
    safe('header', initHeader);
    safe('reveals', initReveals);
    safe('tabs', initTabs);
    safe('filtros', initFilters);
    safe('acordeoes', initAccordions);
    safe('trilho', initRails);
    safe('processo', initProcess);
    safe('marquee', initMarquee);
    safe('contadores', initCounters);
    safe('heroCanvas', initHeroCanvas);
    safe('parallax', initParallax);
    safe('spotlight', initSpotlight);
    safe('form', initForm);
    safe('ano', initYear);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
