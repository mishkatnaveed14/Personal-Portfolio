
"use strict";
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ---------- Theme toggle ---------- */
(function themeInit() {
  const root = document.documentElement;
  const toggle = $("#themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);

  toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();


$("#year").textContent = new Date().getFullYear();

/* ---------- Navbar scroll state ---------- */
(function scrollUI() {
  const navbar = $("#navbar");
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");

  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 40);
    backToTop.classList.toggle("show", y > 600);

    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
})();

(function drawer() {
  const burger = $("#hamburger");
  const drawer = $("#mobileDrawer");
  const backdrop = $("#drawerBackdrop");

  const setOpen = (open) => {
    burger.classList.toggle("open", open);
    drawer.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", () =>
    setOpen(!drawer.classList.contains("open")),
  );
  backdrop.addEventListener("click", () => setOpen(false));
  $$(".drawer-link").forEach((l) =>
    l.addEventListener("click", () => setOpen(false)),
  );
  document.addEventListener(
    "keydown",
    (e) => e.key === "Escape" && setOpen(false),
  );
})();

/* ---------- scroll ---------- */
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length <= 1) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ----------  highlight ---------- */
(function activeNav() {
  const sections = $$("main section[id]");
  const links = $$(".nav-link");
  const drawerLinks = $$(".drawer-link");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        const mark = (arr) =>
          arr.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("href") === "#" + id),
          );
        mark(links);
        mark(drawerLinks);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((s) => io.observe(s));
})();

/* ---------- skill bars ---------- */
(function reveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  $$(".reveal, .skill-card").forEach((el, i) => {
    el.style.transitionDelay = Math.min((i % 6) * 60, 320) + "ms";
    io.observe(el);
  });
})();

/* ---------- Animated counters ---------- */
(function counters() {
  const nums = $$(".stat-num[data-count]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = +el.dataset.count;
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    },
    { threshold: 0.6 },
  );
  nums.forEach((n) => io.observe(n));
})();

/* ---------- Typing effect ---------- */
(function typing() {
  const el = $("#typedText");
  if (!el) return;
  const phrases = [
    "Building Modern Web Experiences",
    "Creating Intelligent AI Solutions",
    "Crafting Responsive Interfaces",
    "Learning Agentic AI Systems",
  ];
  if (prefersReduced) {
    el.textContent = phrases[0];
    return;
  }
  let pi = 0,
    ci = 0,
    deleting = false;
  const tick = () => {
    const phrase = phrases[pi];
    el.textContent = phrase.slice(0, ci);
    if (!deleting && ci < phrase.length) {
      ci++;
      setTimeout(tick, 70);
    } else if (!deleting && ci === phrase.length) {
      deleting = true;
      setTimeout(tick, 1600);
    } else if (deleting && ci > 0) {
      ci--;
      setTimeout(tick, 35);
    } else {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(tick, 300);
    }
  };
  tick();
})();

/* ---------- Copy email ---------- */
(function copyEmail() {
  const btn = $("#copyEmail");
  const toast = $("#toast");
  if (!btn) return;

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  btn.addEventListener("click", async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email copied: " + email);
    } catch {
      showToast(email);
    }
  });
})();

/* ---------- buttons ---------- */
$$(".ripple").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const span = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    span.className = "ripple-span";
    span.style.width = span.style.height = size + "px";
    span.style.left = e.clientX - rect.left - size / 2 + "px";
    span.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(span);
    setTimeout(() => span.remove(), 600);
  });
});

/* ---------- Custom cursor + mouse glow ---------- */
(function cursor() {
  if (window.matchMedia("(hover: none)").matches || prefersReduced) return;
  const glow = $("#cursorGlow");
  const dot = $("#cursorDot");
  let gx = 0,
    gy = 0,
    tx = 0,
    ty = 0;

  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.left = tx + "px";
    dot.style.top = ty + "px";
  });

  const loop = () => {
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    glow.style.left = gx + "px";
    glow.style.top = gy + "px";
    requestAnimationFrame(loop);
  };
  loop();

  $$("a, button, .skill-card, .project-card, .service-card").forEach((el) => {
    el.addEventListener(
      "mouseenter",
      () => (dot.style.transform = "translate(-50%,-50%) scale(2.5)"),
    );
    el.addEventListener(
      "mouseleave",
      () => (dot.style.transform = "translate(-50%,-50%) scale(1)"),
    );
  });
})();

/* ---------- Floating particle ---------- */
(function particles() {
  if (prefersReduced) return;
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let w,
    h,
    dots = [];

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(80, Math.floor((w * h) / 22000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const color =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--brand")
        .trim() || "#6c8cff";
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    }
  
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = color;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

/* --------- icons on mouse ---------- */
(function parallax() {
  if (window.matchMedia("(hover: none)").matches || prefersReduced) return;
  const icons = $$(".float-icon");
  window.addEventListener("mousemove", (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    icons.forEach((ic, i) => {
      const depth = (i + 1) * 6;
      ic.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
    });
  });
})();
