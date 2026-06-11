/* ============================================================
   Prakash Bhatu — Portfolio interactions
   Preloader · Custom cursor · Lenis · Three.js · GSAP · Modal
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Tweak bridge: read CSS vars set by tweaks panel ---------- */
  const getVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  /* =========================================================
     1. PRELOADER
  ========================================================= */
  const preloader = document.getElementById('preloader');
  const plBar = document.getElementById('plBar');
  const plText = document.getElementById('plText');
  let progress = 0;

  function finishPreloader() {
    if (preloader.classList.contains('done')) return;
    preloader.classList.add('done');
    document.body.style.overflow = '';
    startHeroIntro();
  }

  function tickPreloader() {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) progress = 100;
    plBar.style.width = progress + '%';
    plText.textContent = 'Loading experience · ' + Math.floor(progress) + '%';
    if (progress < 100) {
      setTimeout(tickPreloader, 130 + Math.random() * 120);
    } else {
      setTimeout(finishPreloader, 420);
    }
  }

  document.body.style.overflow = 'hidden';
  if (reduceMotion) {
    plBar.style.width = '100%';
    setTimeout(finishPreloader, 200);
  } else {
    setTimeout(tickPreloader, 250);
  }
  // Hard safety cap — never let the preloader stall (e.g. throttled timers).
  window.addEventListener('load', () => setTimeout(finishPreloader, 2600));
  setTimeout(finishPreloader, 5000);

  /* =========================================================
     2. CUSTOM CURSOR  (magnetic + state)
  ========================================================= */
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    // Hover states via delegation
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor="hover"], a, button');
      if (t) document.body.classList.add('cursor-hover');
      const ti = e.target.closest('input, textarea, select');
      if (ti) document.body.classList.add('cursor-text');
    });
    document.addEventListener('mouseout', (e) => {
      const t = e.target.closest('[data-cursor="hover"], a, button');
      if (t) document.body.classList.remove('cursor-hover');
      const ti = e.target.closest('input, textarea, select');
      if (ti) document.body.classList.remove('cursor-text');
    });
    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));
  }

  /* =========================================================
     3. MAGNETIC BUTTONS
  ========================================================= */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.btn-magnet').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* =========================================================
     4. TILT (cards / visuals) + spotlight position
  ========================================================= */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = 6;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -max;
        const ry = (px - 0.5) * max;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      });
    });
  }

  // spotlight (mx/my as % on skill cards, projects, services)
  document.querySelectorAll('.skill-card, .project, .service').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* =========================================================
     5. LENIS SMOOTH SCROLL
  ========================================================= */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.__lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const el = document.querySelector(id);
          if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -20 }); }
        }
      });
    });
  } else {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const el = document.querySelector(id);
          if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
        }
      });
    });
  }

  /* =========================================================
     6. THREE.JS — Hero particle field
  ========================================================= */
  window.__heroScene = null;
  function initHero() {
    if (reduceMotion || !window.THREE) return;
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 22;

    // Particle field
    const COUNT = window.innerWidth < 700 ? 1400 : 2600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // distribute in a slab
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 38;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      rand[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

    function hexToVec(hex) {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    }
    const colA = { value: hexToVec(getVar('--accent-3') || '#00F5D4') };
    const colB = { value: hexToVec(getVar('--accent') || '#7C3AED') };

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColA: colA,
      uColB: colB,
      uSize: { value: window.innerWidth < 700 ? 2.0 : 2.6 },
    };
    window.__heroUniforms = uniforms;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uSize;
        attribute float aRand;
        varying float vMix;
        varying float vAlpha;
        void main(){
          vec3 p = position;
          float t = uTime * 0.3;
          p.x += sin(t + aRand * 6.28 + p.y * 0.1) * 1.2;
          p.y += cos(t * 0.8 + aRand * 6.28 + p.x * 0.1) * 1.0;
          p.z += sin(t * 0.5 + aRand * 12.0) * 1.4;
          // mouse parallax
          p.xy += uMouse * (2.0 + aRand * 4.0);
          vMix = aRand;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = length(mv.xyz);
          vAlpha = smoothstep(40.0, 8.0, dist);
          gl_PointSize = uSize * (300.0 / -mv.z) * (0.4 + aRand);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColA;
        uniform vec3 uColB;
        varying float vMix;
        varying float vAlpha;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);
          vec3 col = mix(uColA, uColB, vMix);
          gl_FragColor = vec4(col, glow * vAlpha * 0.9);
        }`,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // subtle wireframe icosahedron floating
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(6, 1),
      new THREE.MeshBasicMaterial({ color: 0x7C3AED, wireframe: true, transparent: true, opacity: 0.10 })
    );
    ico.position.set(12, 2, -6);
    scene.add(ico);

    let tmx = 0, tmy = 0;
    window.addEventListener('mousemove', (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5);
      tmy = -(e.clientY / window.innerHeight - 0.5);
    });

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    let scrollFade = 1;
    let running = true;
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      uniforms.uMouse.value.x += (tmx - uniforms.uMouse.value.x) * 0.04;
      uniforms.uMouse.value.y += (tmy - uniforms.uMouse.value.y) * 0.04;
      points.rotation.y = t * 0.02 + tmx * 0.2;
      points.rotation.x = tmy * 0.15;
      ico.rotation.x = t * 0.1;
      ico.rotation.y = t * 0.14;
      // fade out as hero scrolls away (perf)
      const heroH = window.innerHeight;
      scrollFade = Math.max(0, 1 - window.scrollY / heroH);
      canvas.style.opacity = scrollFade;
      renderer.render(scene, camera);
    }
    loop();

    // pause when hero offscreen
    const hero = document.querySelector('.hero');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !running) { running = true; loop(); }
          else if (!en.isIntersecting) { running = false; }
        });
      }, { threshold: 0.01 }).observe(hero);
    }

    window.__heroScene = { uniforms };
  }

  /* =========================================================
     7. THREE.JS — Contact ambient particles (lightweight)
  ========================================================= */
  function initContact() {
    if (reduceMotion || !window.THREE) return;
    const canvas = document.getElementById('contactCanvas');
    if (!canvas) return;
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 20;

    const COUNT = 700;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.08, color: 0x06B6D4, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let running = false;
    const clock = new THREE.Clock();
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      pts.rotation.y = t * 0.04;
      pts.rotation.x = Math.sin(t * 0.2) * 0.1;
      renderer.render(scene, camera);
    }
    const sec = document.querySelector('.contact');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          running = en.isIntersecting;
          if (running) loop();
        });
      }, { threshold: 0.05 }).observe(sec);
    } else { running = true; loop(); }
  }

  /* =========================================================
     8. TESTIMONIALS — build marquee
  ========================================================= */
  const TESTIMONIALS = [
    { q: "Prakash designs like an engineer and codes like a designer. Rare combination, instantly obvious.", n: "Aarav Mehta", r: "Product Lead · Lumen", i: "AM" },
    { q: "He took a vague brief and returned a fully-realised motion system. Our launch felt twice the budget.", n: "Sofia Cardoso", r: "Founder · Vital Concierge", i: "SC" },
    { q: "The handoff was the cleanest I've seen in eight years. Tokens, states, edge-cases — all there.", n: "Daniel Roy", r: "Eng Lead · Nocturne", i: "DR" },
    { q: "Our Shopify conversion jumped 31% after the rebuild. And it's genuinely beautiful to use.", n: "Imran Khan", r: "Owner · Atelier 04", i: "IK" },
    { q: "Fast, calm, and absurdly detail-obsessed. He sweats the kerning so you don't have to.", n: "Maya Lin", r: "Creative Director · Parable", i: "ML" },
    { q: "Built our entire WordPress platform with a CMS my non-technical team actually enjoys.", n: "Rohan Desai", r: "Director · Harvest Collective", i: "RD" },
  ];
  function buildTestimonials() {
    const track = document.getElementById('testiTrack');
    if (!track) return;
    const cardHTML = (t) => `
      <article class="testi-card">
        <div class="stars">★★★★★</div>
        <p class="quote">"${t.q}"</p>
        <div class="who">
          <span class="av">${t.i}</span>
          <span class="name"><b>${t.n}</b><span>${t.r}</span></span>
        </div>
      </article>`;
    const all = TESTIMONIALS.map(cardHTML).join('');
    track.innerHTML = all + all; // duplicate for seamless loop
  }
  buildTestimonials();

  /* =========================================================
     9. GSAP scroll reveals + timeline progress
  ========================================================= */
  function initGSAP() {
    if (!window.gsap) return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // Sync Lenis <-> ScrollTrigger
    if (lenis && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    if (reduceMotion) {
      document.querySelectorAll('.reveal-up, .reveal-fade').forEach((el) => {
        el.style.opacity = 1; el.style.transform = 'none';
      });
      return;
    }

    // generic reveals
    gsap.utils.toArray('.reveal-up').forEach((el) => {
      gsap.fromTo(el, { y: 44, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });
    gsap.utils.toArray('.reveal-fade').forEach((el) => {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // timeline progress fill
    const prog = document.getElementById('tlProgress');
    const tl = document.getElementById('timeline');
    if (prog && tl && window.ScrollTrigger) {
      gsap.to(prog, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 80%', scrub: true },
      });
    }

    // section-head heads subtle parallax on the big numbers
    gsap.utils.toArray('.strip-track').forEach(() => {});
  }

  /* ---------- Hero intro (runs after preloader) ---------- */
  function startHeroIntro() {
    if (!window.gsap) return;
    const gsap = window.gsap;
    if (reduceMotion) {
      document.querySelectorAll('.hero .word > span').forEach((s) => { s.style.transform = 'none'; });
      document.querySelectorAll('.hero .reveal-fade, .hero .reveal-up').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero .eyebrow', { opacity: 1, duration: 0.6 }, 0.1)
      .to('.hero h1 .word > span', { y: '0%', duration: 1.1, stagger: 0.06 }, 0.15)
      .to('.hero .alive::after', {}, 0.6)
      .fromTo('.hero-roles', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.7)
      .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.85)
      .fromTo('.hero-aside', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 1.0)
      .fromTo('.scroll-cue', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.2);

    // animate the underline width
    const alive = document.querySelector('.hero h1 .alive');
    if (alive) {
      gsap.fromTo(alive, { '--uw': 0 }, { duration: 1 });
    }
  }

  /* =========================================================
     10. CASE STUDY MODAL
  ========================================================= */
  const CASES = {
    lumen: {
      cat: 'Dashboard · SaaS', title: 'Lumen Analytics',
      client: 'Lumen (D2C analytics)', year: '2025', role: 'Lead Product Designer + FE',
      stack: 'Figma · React · D3 · Design tokens', timeline: '11 weeks',
      bg: 'linear-gradient(135deg,#1a1040,#06243a)',
      problem: 'D2C founders were drowning in spreadsheets. Existing analytics tools showed everything and explained nothing — no narrative, no "so what".',
      process: 'I ran a week of interviews, mapped the five decisions founders actually make weekly, and designed the entire surface around those. Built a token system first so the team could move fast without drift.',
      wires: 'Low-fi flows for the overview, cohort, and revenue views. Tested three dashboard densities with five users before committing to the comfortable-but-dense layout.',
      ui: 'A calm dark interface with a single accent for "things that need attention". Live D3 charts I built myself so motion and data stayed in sync.',
      outcome: 'Shipped in 11 weeks. Activation up 24%, support tickets about "where do I find…" down by half. Now the design-system seed for three more internal tools.',
    },
    vital: {
      cat: 'Healthcare · Marketing', title: 'Vital Concierge',
      client: 'Vital (tele-medicine)', year: '2024', role: 'Brand + Web Design + Build',
      stack: 'Webflow · GSAP · Lenis · Brand', timeline: '7 weeks',
      bg: 'linear-gradient(135deg,#062a2a,#1a1040)',
      problem: 'A concierge healthcare startup looked like every other clinic site — cold, stocky, untrustworthy for a premium price point.',
      process: 'Repositioned around "care that moves with you". New identity, warmer type, and a motion language that felt human rather than clinical.',
      wires: 'Conversion-first wireframes: a pricing flow that answers objections in order, and a membership explainer that earns the ask before making it.',
      ui: 'Soft gradients, generous space, and scroll-driven reveals that pace the story. Every section earns the scroll.',
      outcome: 'Demo bookings doubled in the first month. The founder said it "finally looks like what it costs."',
    },
    atelier: {
      cat: 'Shopify · Fashion', title: 'Atelier 04',
      client: 'Atelier 04 (fashion label)', year: '2024', role: 'Storefront Design + Theme Dev',
      stack: 'Shopify · Liquid · Headless · GSAP', timeline: '9 weeks',
      bg: 'linear-gradient(135deg,#241432,#06243a)',
      problem: 'An independent label with beautiful product and a default theme that flattened it into "just another store".',
      process: 'Studied how drops actually sell, then built a storefront around scarcity and ritual — a countdown, a lookbook, a checkout that feels considered.',
      wires: 'PDP variants tested for the drop mechanic; a cart that reassures rather than rushes.',
      ui: 'Editorial typography, translucent product cards, and micro-motion on hover that mirrors fabric.',
      outcome: 'Conversion up 31%, average order value up 18%. The last two drops sold out in under an hour.',
    },
    nocturne: {
      cat: 'SaaS · Landing', title: 'Nocturne',
      client: 'Nocturne (developer tools)', year: '2025', role: 'Design + Frontend',
      stack: 'Next.js · GSAP · MDX · CMS', timeline: '6 weeks',
      bg: 'linear-gradient(135deg,#0d1b3a,#1a1040)',
      problem: 'A technical product with a marketing site that buried the magic under buzzwords. Engineers bounced.',
      process: 'Cut the copy in half, led with the one number that matters (cold-start time), and built a scroll-driven product reveal that shows rather than tells.',
      wires: 'A single-column narrative with code that animates as you scroll, and a docs-grade information hierarchy.',
      ui: 'Pixel-tight type, restrained color, and a performance budget I refused to break — sub-1s LCP on mobile.',
      outcome: 'Signups up 40%. Picked up by two dev newsletters for the scroll experience alone.',
    },
    parable: {
      cat: 'Motion · Brand film', title: 'Parable Studio',
      client: 'Parable (creative agency)', year: '2025', role: 'Motion Design + Direction',
      stack: 'After Effects · Premiere · Lottie · GSAP', timeline: '5 weeks',
      bg: 'linear-gradient(135deg,#10243a,#241432)',
      problem: 'An agency rebrand needed a film that proved they could do motion — without a film-crew budget.',
      process: 'Wrote a 45-second script around their new manifesto, then built it entirely in After Effects with kinetic type and a logo that assembles itself.',
      wires: 'Storyboard, animatic, then full motion. On-site Lottie + GSAP versions for the lightweight web embed.',
      ui: 'Cinematic title cards, a custom easing curve used throughout, and a sound design pass to match.',
      outcome: 'Used as the homepage hero and the pitch-deck opener. Closed two enterprise clients in the quarter after launch.',
    },
    harvest: {
      cat: 'WordPress · Elementor', title: 'Harvest Collective',
      client: 'Harvest Collective (farm co-op)', year: '2024', role: 'Design + WordPress Build',
      stack: 'WordPress · Elementor · ACF · WooCommerce', timeline: '8 weeks',
      bg: 'linear-gradient(135deg,#16301a,#06243a)',
      problem: 'A 240-farm cooperative selling premium produce on a site that looked like a 2012 template. Trust was leaking at checkout.',
      process: 'Rebuilt on WordPress with custom Elementor blocks and ACF-driven story modules — so each farm gets a face and a story.',
      wires: 'A storefront that leads with provenance, a 24-hour delivery promise front-and-centre, and a checkout stripped of friction.',
      ui: 'Warm, editorial, photography-forward. Custom blocks the client can rearrange without breaking the design.',
      outcome: 'Checkout completion up 27%. The team now publishes farm stories weekly — no developer needed.',
    },
  };

  const modal = document.getElementById('modal');
  const modalHero = document.getElementById('modalHero');
  let lastFocus = null;

  function openCase(key) {
    const c = CASES[key];
    if (!c) return;
    document.getElementById('modalCat').textContent = c.cat;
    document.getElementById('modalTitle').textContent = c.title;
    document.getElementById('m-client').textContent = c.client;
    document.getElementById('m-year').textContent = c.year;
    document.getElementById('m-role').textContent = c.role;
    document.getElementById('m-stack').textContent = c.stack;
    document.getElementById('m-timeline').textContent = c.timeline;
    modalHero.style.background = c.bg;
    document.getElementById('modalContent').innerHTML = `
      <section><h4>The problem</h4><p>${c.problem}</p></section>
      <section><h4>Process</h4><p>${c.process}</p></section>
      <section><h4>Wireframes</h4><p>${c.wires}</p></section>
      <section><h4>UI design</h4><p>${c.ui}</p></section>
      <section><h4>Outcome</h4><p>${c.outcome}</p></section>
      <section>
        <h4>Technologies</h4>
        <div class="project-tags">${c.stack.split(' · ').map((s) => `<span class="pill">${s}</span>`).join('')}</div>
      </section>`;
    lastFocus = document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    document.getElementById('modalClose').focus();
  }
  function closeCase() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.project[data-project]').forEach((p) => {
    p.addEventListener('click', () => openCase(p.dataset.project));
  });
  document.getElementById('modalClose').addEventListener('click', closeCase);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeCase(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeCase(); });

  /* =========================================================
     11. CONTACT FORM (fake submit)
  ========================================================= */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#cf-name');
      const email = form.querySelector('#cf-email');
      const btn = document.getElementById('cfBtn');
      let ok = true;
      [name, email].forEach((f) => {
        if (!f.value.trim() || (f.type === 'email' && !/^[^@]+@[^@]+\.[^@]+$/.test(f.value))) {
          f.style.borderColor = '#ff5f7e'; ok = false;
        } else { f.style.borderColor = ''; }
      });
      if (!ok) { btn.textContent = 'Check your details'; setTimeout(() => btn.textContent = 'Send brief', 1800); return; }
      btn.textContent = 'Sending…';
      setTimeout(() => {
        btn.textContent = 'Sent ✓ — talk soon';
        form.reset();
        setTimeout(() => btn.textContent = 'Send brief', 2600);
      }, 900);
    });
  }

  /* =========================================================
     12. NAV active state on scroll
  ========================================================= */
  const navLinks = document.querySelectorAll('.nav a.link');
  const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = '#' + en.target.id;
          navLinks.forEach((a) => a.style.color = a.getAttribute('href') === id ? 'var(--text)' : '');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => obs.observe(s));
  }

  /* =========================================================
     INIT
  ========================================================= */
  function boot() {
    initHero();
    initContact();
    initGSAP();
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);

  // Expose for tweaks
  window.__portfolio = {
    setHeroColors(aHex, bHex) {
      if (window.__heroUniforms && window.THREE) {
        const ca = new window.THREE.Color(aHex), cb = new window.THREE.Color(bHex);
        window.__heroUniforms.uColA.value.set(ca.r, ca.g, ca.b);
        window.__heroUniforms.uColB.value.set(cb.r, cb.g, cb.b);
      }
    },
  };
})();
