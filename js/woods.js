(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
  var fill = document.querySelector(".trail-fill");
  var bar = document.querySelector(".progress");
  var spot = document.querySelector(".sunspot");
  var overlook = document.querySelector(".overlook");
  var overlookImg = overlook ? overlook.querySelector("img") : null;
  var year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".sr-only").textContent = "Open menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    });
  }

  links.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  if (spot && fine && !reduce) {
    root.classList.add("has-pointer");
    window.addEventListener(
      "pointermove",
      function (event) {
        spot.style.transform = "translate3d(" + event.clientX + "px, " + event.clientY + "px, 0)";
      },
      { passive: true }
    );
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!reduce && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  function animateCount(el) {
    var target = Number(el.getAttribute("data-count"));
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    var start = performance.now();
    var duration = 1200;
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.7 }
    );
    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    counters.forEach(animateCount);
  }

  var video = document.querySelector(".film video");
  if (video && "IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var playPromise = video.play();
            if (playPromise && playPromise.catch) playPromise.catch(function () {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.45 }
    );
    videoObserver.observe(video);
  }

  function onScroll() {
    var scrolled = window.scrollY || window.pageYOffset;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var progress = height > 0 ? scrolled / height : 0;
    if (bar) bar.style.transform = "scaleX(" + progress + ")";
    if (fill) fill.style.transform = "scaleY(" + progress + ")";

    var marker = scrolled + window.innerHeight * 0.38;
    var current = "";
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) current = section.id;
    });
    links.forEach(function (link) {
      link.classList.toggle("is-current", link.getAttribute("href") === "#" + current);
    });

    if (overlook && overlookImg && !reduce) {
      var rect = overlook.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        overlookImg.style.transform = "translate3d(0, " + rect.top * -0.12 + "px, 0)";
      }
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
