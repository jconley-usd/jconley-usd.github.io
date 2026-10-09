(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const sectionViewMark = 0.38;
  const overlookShift = -0.12;
  const countDurationMs = 1200;

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const menuLabel = toggle ? toggle.querySelector(".sr-only") : null;
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const fill = document.querySelector(".trail-fill");
  const bar = document.querySelector(".progress");
  const spot = document.querySelector(".sunspot");
  const overlook = document.querySelector(".overlook");
  const overlookImg = overlook ? overlook.querySelector("img") : null;
  const year = document.getElementById("year");
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const video = document.querySelector(".film video");

  root.classList.add("js");
  if (year) year.textContent = String(new Date().getFullYear());

  function setMenuOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (menuLabel) menuLabel.textContent = open ? "Close menu" : "Open menu";
  }

  function allowBlockedAutoplay() {}

  function whenVisible(nodes, onEnter, options) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(onEnter);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        onEnter(entry.target);
        observer.unobserve(entry.target);
      });
    }, options);

    nodes.forEach((node) => observer.observe(node));
  }

  function animateCount(node) {
    const target = Number(node.getAttribute("data-count"));
    if (reduceMotion) {
      node.textContent = String(target);
      return;
    }

    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / countDurationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function paintProgress(progress) {
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (fill) fill.style.transform = `scaleY(${progress})`;
  }

  function markCurrentSection(scrolled) {
    const marker = scrolled + window.innerHeight * sectionViewMark;
    let current = "";

    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });

    links.forEach((link) => {
      link.classList.toggle("is-current", link.getAttribute("href") === `#${current}`);
    });
  }

  function parallaxOverlook() {
    if (!overlook || !overlookImg || reduceMotion) return;

    const rect = overlook.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;
    if (!inView) return;

    overlookImg.style.transform = `translate3d(0, ${rect.top * overlookShift}px, 0)`;
  }

  function onScroll() {
    const scrolled = window.scrollY;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    paintProgress(range > 0 ? scrolled / range : 0);
    markCurrentSection(scrolled);
    parallaxOverlook();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("is-open"));
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  if (spot && finePointer && !reduceMotion) {
    root.classList.add("has-pointer");
    window.addEventListener(
      "pointermove",
      (event) => {
        spot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      },
      { passive: true }
    );
  }

  if (reduceMotion) {
    reveals.forEach((node) => node.classList.add("in"));
  } else {
    whenVisible(
      reveals,
      (node) => node.classList.add("in"),
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
  }

  whenVisible(counters, animateCount, { threshold: 0.7 });

  if (video && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        const playPromise = video.play();
        if (playPromise) playPromise.catch(allowBlockedAutoplay);
      });
    }, { threshold: 0.45 });

    videoObserver.observe(video);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
