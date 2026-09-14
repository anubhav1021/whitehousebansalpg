/* White House Bansal PG: interactions & motion */
(() => {
  const d = document;
  const $ = (s, root = d) => root.querySelector(s);
  const $$ = (s, root = d) => [...root.querySelectorAll(s)];

  const WA_NUMBER = '918006652971';
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGSAP && !reduceMotion;

  const nav = $('#nav');

  /* ---------- Year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- WhatsApp prefilled links ---------- */
  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); });

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#mobileMenu');
  let menuTimer;

  const openMenu = () => {
    clearTimeout(menuTimer);
    menu.hidden = false;
    void menu.offsetHeight; // commit display before the class change so the fade-in runs
    menu.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    nav.classList.add('menu-open');
    d.body.classList.add('no-scroll');
    lenis?.stop();
  };
  const closeMenu = (returnFocus = false) => {
    if (menu.hidden) return;
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('menu-open');
    d.body.classList.remove('no-scroll');
    lenis?.start();
    menuTimer = setTimeout(() => { menu.hidden = true; }, 720); // after the circle closes
    if (returnFocus) menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });
  matchMedia('(min-width: 1080px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

  /* ---------- Anchor links ---------- */
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 ? $(id) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const offset = id === '#top' || id === '#main' ? 0 : -(nav.offsetHeight + 8);
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- Nav state + progress ---------- */
  const progress = $('.progress');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 16);
    if (!nav.classList.contains('menu-open')) {
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > 480) nav.classList.add('hide');
      else if (goingUp || y < 480) nav.classList.remove('hide');
    }
    const max = d.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Keep keyboard focus from hiding behind the nav
  d.addEventListener('focusin', () => nav.classList.remove('hide'));

  /* ---------- Mobile quick-contact bar ---------- */
  const dock = $('.dock');
  if (dock) {
    let typing = false;
    const updateDock = () => dock.classList.toggle('show', window.scrollY > 480 && !typing);
    window.addEventListener('scroll', updateDock, { passive: true });
    // Get out of the way while the on-screen keyboard is up
    d.addEventListener('focusin', (e) => { typing = e.target.matches('input, textarea, select'); updateDock(); });
    d.addEventListener('focusout', () => { typing = false; setTimeout(updateDock, 100); });
    updateDock();
  }

  /* ---------- Eyebrow rules draw in ---------- */
  if ('IntersectionObserver' in window) {
    const eyebrowIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); eyebrowIO.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    $$('.eyebrow').forEach((el) => eyebrowIO.observe(el));
  } else {
    $$('.eyebrow').forEach((el) => el.classList.add('in'));
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav-links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const on = a.getAttribute('href') === `#${entry.target.id}`;
          a.classList.toggle('active', on);
          on ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Hero building windows ---------- */
  const wins = $$('.win');
  const heroArt = $('.hero-art');
  const seedWindows = (delay) => {
    wins.forEach((w, i) => {
      const lit = Math.random() > 0.4;
      if (reduceMotion) { w.classList.toggle('lit', lit); return; }
      setTimeout(() => w.classList.toggle('lit', lit), delay + i * 70 + Math.random() * 260);
    });
  };
  seedWindows(animate ? 1300 : 300);

  if (!reduceMotion && wins.length) {
    let heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(heroArt);
    }
    setInterval(() => {
      if (!heroVisible || d.hidden) return;
      wins[Math.floor(Math.random() * wins.length)].classList.toggle('lit');
    }, 1600);
  }

  /* ---------- Split words ---------- */
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          if (!n.textContent.trim()) return;
          const frag = d.createDocumentFragment();
          n.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) { frag.append(d.createTextNode(' ')); return; }
            const outer = d.createElement('span');
            outer.className = 'w';
            const inner = d.createElement('span');
            inner.className = 'wi';
            inner.textContent = part;
            outer.append(inner);
            frag.append(outer);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === Node.ELEMENT_NODE && n.namespaceURI !== 'http://www.w3.org/2000/svg') {
          walk(n);
        }
      });
    };
    walk(el);
  };

  /* ---------- GSAP motion ---------- */
  const underline = $('.underline');

  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

    $$('[data-split]').forEach(splitWords);

    // Intro screen (first visit per session) lifts away, then the hero plays in
    const preloader = $('.preloader');
    const showIntro = !!preloader && getComputedStyle(preloader).display !== 'none';
    if (showIntro) {
      try { sessionStorage.setItem('wh-intro', '1'); } catch (_) { /* storage unavailable */ }
      gsap.timeline({ delay: 1.3, onComplete: () => preloader.remove() })
        .to('.pl-inner, .pl-bar', { y: -36, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
        .to(preloader, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 0.15);
    } else {
      preloader?.remove();
    }

    const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: showIntro ? 1.55 : 0 });
    intro
      .from(nav, { yPercent: -100, autoAlpha: 0, duration: 1, clearProps: 'transform,opacity,visibility' })
      .from('.hero h1 .wi', { yPercent: 115, duration: 1.2, stagger: 0.045 }, 0.15)
      .from('.hero [data-hero-fade]', { y: 26, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.35)
      .fromTo('.hero-art',
        { clipPath: 'inset(100% 0% 0% 0% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.bld', { y: 70, duration: 1.6 }, 0.45)
      .from('.sun', { y: 90, duration: 2, ease: 'power3.out' }, 0.5)
      .from('.chip', { y: 30, scale: 0.7, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'back.out(1.8)' }, 1.05)
      .add(() => underline?.classList.add('drawn'), 0.95);

    // Hero parallax
    gsap.to('.hero-art .bld', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.chip-a', { y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.chip-b', { y: -110, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.chip-c', { y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Headings (outside hero)
    $$('[data-split]').forEach((h) => {
      if (h.closest('.hero')) return;
      gsap.from($$('.wi', h), {
        yPercent: 115, rotate: 5, transformOrigin: '0% 100%', duration: 1.15, ease: 'expo.out', stagger: 0.04,
        scrollTrigger: { trigger: h, start: 'top 88%' },
      });
    });

    // Generic reveals
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 36, autoAlpha: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // Staggered groups
    $$('[data-stagger]').forEach((group) => {
      gsap.from(group.children, {
        y: 56, scale: 0.96, rotationX: -10, transformPerspective: 900, transformOrigin: '50% 100%',
        autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 86%' },
      });
    });

    // Food timeline line
    const mealLine = $('.meals-line span');
    if (mealLine) {
      gsap.fromTo(mealLine, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.meals', start: 'top 80%', end: 'top 35%', scrub: 0.6 },
      });
    }

    // Gallery tiles: clip reveal
    $$('.g-tile').forEach((tile, i) => {
      gsap.fromTo(tile,
        { clipPath: 'inset(18% 18% 18% 18% round 20px)', autoAlpha: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 20px)', autoAlpha: 1, duration: 1.2, ease: 'expo.out', delay: (i % 3) * 0.06,
          clearProps: 'clipPath',
          scrollTrigger: { trigger: tile, start: 'top 90%' },
        });
    });

    // Photos drift slightly slower than the page (parallax)
    $$('.ph[data-parallax] img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Room photos wipe up into view
    $$('.room .ph').forEach((ph) => {
      gsap.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: ph, start: 'top 88%' },
      });
    });

    // Dark food section opens out to full width as it scrolls in
    // The side clip must stay inside the empty gutter so it never cuts into text;
    // screens without a wide gutter get a gentle zoom instead.
    $$('[data-expand]').forEach((sec) => {
      const inner = $('.container', sec);
      const gutter = (sec.clientWidth - inner.clientWidth) / 2;
      const side = Math.min(7, Math.max(0, ((gutter - 12) / sec.clientWidth) * 100));
      const [from, to] = side >= 2
        ? [{ clipPath: `inset(0% ${side}% 0% ${side}% round 48px)` }, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }]
        : [{ scale: 0.94, transformOrigin: '50% 0%' }, { scale: 1 }];
      gsap.fromTo(sec, from, {
        ...to, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 35%', scrub: 0.6 },
      });
    });

    // Amenity and meal icons pop in after their tiles
    $$('.amen-grid, .meals').forEach((group) => {
      gsap.from($$('.ic-tile, .meal-ic', group), {
        scale: 0, rotate: -35, duration: 0.8, ease: 'back.out(2.2)', stagger: 0.06, delay: 0.25,
        clearProps: 'transform', // hand back to the CSS hover wobble
        scrollTrigger: { trigger: group, start: 'top 82%' },
      });
    });

    // Facility strip: steady loop that speeds up with scroll velocity
    const track = $('.marquee-track');
    if (track) {
      track.style.animation = 'none';
      const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 });
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 320, 7);
          gsap.to(loop, {
            timeScale: boost, duration: 0.25, overwrite: true,
            onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.4, ease: 'power2.out' }),
          });
        },
      });
      if (finePointer) {
        track.parentElement.addEventListener('pointerenter', () => gsap.to(loop, { timeScale: 0.15, duration: 0.6, overwrite: true }));
        track.parentElement.addEventListener('pointerleave', () => gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true }));
      }
    }

    // Footer wordmark letters rise one by one
    $$('[data-letters]').forEach((el) => {
      el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
      gsap.from($$('.ch', el), {
        yPercent: 60, autoAlpha: 0, rotate: 8, duration: 1, ease: 'expo.out', stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 95%' },
      });
    });

    // Location route: draw path + walker
    const route = $('.route-draw');
    if (route) {
      const len = route.getTotalLength();
      gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.route-card', start: 'top 75%', end: 'center 40%', scrub: 0.8 },
      });
      tl.to(route, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      if (window.MotionPathPlugin) {
        tl.fromTo('.walker',
          { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], start: 0, end: 0 } },
          { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], start: 0, end: 1 }, ease: 'none', duration: 1 }, 0);
      }
      tl.from('.pin-end', { scale: 0, transformOrigin: '50% 100%', ease: 'back.out(2.5)', duration: 0.2 }, 0.8);
      tl.from('.route-chip', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', ease: 'back.out(2)', duration: 0.2 }, 0.45);
    }

    // Big footer word drift
    gsap.fromTo('.footer-word', { xPercent: 6 }, {
      xPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  } else {
    underline?.classList.add('drawn');
  }

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    if (!animate) { el.textContent = end; return; }
    const state = { v: 0 };
    el.textContent = '0';
    gsap.to(state, {
      v: end, duration: end > 50 ? 2 : 1.4, ease: 'power2.out',
      delay: el.closest('.hero') ? 0.9 : 0,
      scrollTrigger: { trigger: el, start: 'top 95%' },
      onUpdate: () => { el.textContent = Math.round(state.v); },
    });
  });

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // Spotlight on cards
    $$('[data-spot]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    if (hasGSAP) {
      // 3D tilt
      $$('[data-tilt]').forEach((card) => {
        gsap.set(card, { transformPerspective: 1000 });
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });

      // Magnetic buttons
      $$('[data-magnetic]').forEach((btn) => {
        const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
        const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          x((e.clientX - r.left - r.width / 2) * 0.22);
          y((e.clientY - r.top - r.height / 2) * 0.3);
        });
        btn.addEventListener('pointerleave', () => { x(0); y(0); });
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = !item.classList.contains('open');
      $$('.faq-item.open').forEach((other) => {
        if (other === item) return;
        other.classList.remove('open');
        $('.faq-q', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 520);
    });
  });

  /* ---------- Gallery lightbox ---------- */
  const lightbox = $('#lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const lbImg = $('img', lightbox);
    const lbCap = $('figcaption', lightbox);
    $$('.g-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const img = $('img', tile);
        if (!img || !img.naturalWidth) return;
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = tile.dataset.label || '';
        lightbox.showModal();
        lenis?.stop();
      });
    });
    $('.lb-close', lightbox).addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('close', () => lenis?.start());
  }

  /* ---------- Enquiry form → WhatsApp ---------- */
  const form = $('#enquiryForm');
  if (form) {
    const rules = {
      name: {
        el: $('#f-name'),
        check: (v) => v.trim().length >= 2,
        msg: 'Please enter your name so the owner knows who is asking.',
      },
      phone: {
        el: $('#f-phone'),
        check: (v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s()-]/g, '')),
        msg: 'Enter a valid 10-digit Indian mobile number, e.g. 98765 43210.',
      },
    };
    const status = $('.form-status', form);
    const submitBtn = $('button[type="submit"]', form);

    const validate = (key) => {
      const { el, check, msg } = rules[key];
      const ok = check(el.value);
      const field = el.closest('.field');
      field.classList.toggle('invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      $('.err', field).textContent = ok ? '' : msg;
      return ok;
    };

    Object.keys(rules).forEach((key) => {
      const { el } = rules[key];
      el.addEventListener('blur', () => { if (el.value) validate(key); });
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('invalid')) validate(key); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = Object.keys(rules).map((key) => [key, validate(key)]);
      const firstInvalid = results.find(([, ok]) => !ok);
      if (firstInvalid) {
        rules[firstInvalid[0]].el.focus();
        return;
      }

      const data = new FormData(form);
      const lines = [
        'Hi Manish ji, I have an enquiry for White House Bansal PG.',
        '',
        `Name: ${data.get('name').trim()}`,
        `Phone: ${data.get('phone').trim()}`,
        `Room preference: ${data.get('room')}`,
        `Move-in: ${data.get('move')}`,
      ];
      const course = data.get('course').trim();
      const message = data.get('message').trim();
      if (course) lines.push(`Course & year: ${course}`);
      if (message) lines.push('', message);

      submitBtn.disabled = true;
      $('.btn-label', submitBtn).textContent = 'Opening WhatsApp…';

      window.open(waLink(lines.join('\n')), '_blank', 'noopener');

      setTimeout(() => {
        submitBtn.disabled = false;
        $('.btn-label', submitBtn).textContent = 'Send enquiry on WhatsApp';
        status.hidden = false;
        status.innerHTML = 'WhatsApp should now be open with your enquiry. Just tap <strong>Send</strong>. If it didn’t open, call <a href="tel:+918006652971">+91 80066 52971</a>.';
      }, 900);
    });
  }

  /* ---------- WhatsApp bubble hint ---------- */
  const fab = $('.fab');
  if (fab) {
    let seen = false;
    try { seen = sessionStorage.getItem('wa-hint') === '1'; } catch (_) { /* storage unavailable */ }
    if (!seen) {
      setTimeout(() => {
        fab.classList.add('show-bubble');
        setTimeout(() => fab.classList.remove('show-bubble'), 5000);
        try { sessionStorage.setItem('wa-hint', '1'); } catch (_) { /* storage unavailable */ }
      }, 4000);
    }
  }

  // Recalculate trigger positions once fonts & images settle
  if (hasGSAP) window.addEventListener('load', () => ScrollTrigger.refresh());
})();
