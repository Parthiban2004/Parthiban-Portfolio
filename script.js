/* ============================================================
   Parthiban — Portfolio interactions
   ============================================================ */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  document.body.classList.add("loading");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Loader ---------- */
  const loader = $("#loader");
  const loaderBar = $(".loader__bar i");
  const loaderCount = $("#loaderCount");
  let progress = 0;
  const finishLoading = () => {
    loader.classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
    startTyping();
    observeReveals();
  };
  if (reduceMotion) {
    finishLoading();
  } else {
    const tick = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 18 + 6);
      loaderBar.style.width = progress + "%";
      loaderCount.textContent = Math.floor(progress);
      if (progress >= 100) {
        clearInterval(tick);
        setTimeout(finishLoading, 350);
      }
    }, 90);
  }

  /* ---------- Typing effect ---------- */
  const roles = ["Software Engineer", "Cloud Data Engineer", "AI / ML Builder"];
  const typed = $("#typed");
  function startTyping() {
    if (reduceMotion) { typed.textContent = roles[0]; return; }
    let r = 0, i = 0, deleting = false;
    const step = () => {
      const word = roles[r];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let delay = deleting ? 45 : 90;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 300; }
      setTimeout(step, delay);
    };
    setTimeout(step, 900);
  }

  /* ---------- Stem separation equalizer bars ---------- */
  $$(".bars").forEach((bars) => {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const bar = document.createElement("i");
      bar.style.setProperty("--h", (0.3 + Math.random() * 0.7).toFixed(2));
      bar.style.animationDelay = (-Math.random() * 1.5).toFixed(2) + "s";
      bars.appendChild(bar);
    }
  });

  /* ---------- Scroll reveal ---------- */
  function observeReveals() {
    const els = $$(".reveal");
    // Stagger siblings inside the same parent
    els.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", siblings.indexOf(el) * 0.08 + "s");
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$("[data-count]");
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const duration = reduceMotion ? 0 : 1600;
      const start = performance.now();
      const run = (now) => {
        const t = duration ? Math.min(1, (now - start) / duration) : 1;
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => countIO.observe(c));

  /* ---------- Nav: active link, sliding indicator, hide on scroll ---------- */
  const nav = $("#nav");
  const navLinks = $("#navLinks");
  const links = $$("a", navLinks);
  const indicator = $("#navIndicator");
  const toggle = $("#navToggle");

  const moveIndicator = (link) => {
    if (!link) return;
    indicator.style.width = link.offsetWidth + "px";
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  const setActive = (id) => {
    links.forEach((l) => {
      const on = l.getAttribute("href") === "#" + id;
      l.classList.toggle("active", on);
      if (on) moveIndicator(l);
    });
  };
  links.forEach((l) => {
    l.addEventListener("mouseenter", () => moveIndicator(l));
    l.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
  navLinks.addEventListener("mouseleave", () => moveIndicator($("a.active", navLinks)));
  window.addEventListener("resize", () => moveIndicator($("a.active", navLinks)));
  requestAnimationFrame(() => moveIndicator($("a.active", navLinks)));

  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  const sections = $$("main section[id]");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => sectionIO.observe(s));

  const progressBar = $("#progressBar");
  const fabDock = $("#fabDock");
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 40);
    const menuOpen = navLinks.classList.contains("open");
    nav.classList.toggle("hidden", !menuOpen && y > lastY && y > 300);
    fabDock.classList.toggle("show", y > window.innerHeight * 0.5);
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    const ring = $(".cursor");
    const dot = $(".cursor-dot");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    const follow = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    $$("a, button, [data-tilt]").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
  } else {
    $$(".cursor, .cursor-dot").forEach((el) => el.remove());
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = el.classList.contains("fab") || el.classList.contains("social") ? 0.4 : 0.25;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform 0.15s ease-out";
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });
  }

  /* ---------- 3D tilt + spotlight cards ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach((el) => {
      const max = el.classList.contains("project") ? 3 : 8;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", px * 100 + "%");
        el.style.setProperty("--my", py * 100 + "%");
        if (!el.classList.contains("in")) return;
        el.style.transition = "transform 0.15s ease-out, border-color 0.4s";
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s";
        el.style.transform = "";
      });
    });
  }

  /* ---------- Particle constellation background ---------- */
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  let w, h, dpr, particles = [];
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.2 + 0.4) * dpr,
    }));
  };
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  window.addEventListener("mouseout", () => { mouse.x = mouse.y = -9999; });
  resize();

  const linkDist = 130;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const ld = linkDist * dpr;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // Gentle repulsion from cursor
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < (120 * dpr) ** 2) {
          const f = 0.6 / Math.sqrt(d2 || 1);
          p.x += dx * f; p.y += dy * f;
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(124, 245, 255, 0.55)";
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < ld) {
          ctx.strokeStyle = `rgba(124, 245, 255, ${(1 - dist / ld) * 0.14})`;
          ctx.lineWidth = dpr * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  };
  draw();

  /* ---------- Hero parallax on orb ---------- */
  const orb = $(".orb");
  if (finePointer && !reduceMotion && orb) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;
      orb.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
})();
