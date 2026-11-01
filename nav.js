/* ==========================================================================
   nav.js
   Injects the shared site header and footer into every page.
   Edit the SITE_NAME, NAV_LINKS, or footer markup here ONCE and every
   page picks up the change automatically.
   ========================================================================== */
(function () {
  var SITE_NAME = "Adoremus"; // change the site name/wordmark here
  var NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "about-eucharist.html", label: "About the Eucharist" },
    { href: "church-fathers-saints.html", label: "Church Fathers & Saints" },
    { href: "eucharistic-miracles.html", label: "Eucharistic Miracles" },
    { href: "how-to-receive.html", label: "How to Receive" },
    { href: "encounter-jesus.html", label: "Encounter Jesus" },
  ];
  function currentFile() {
    var path = window.location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }
  /* ---- Good Friday check --------------------------------------------
     Good Friday is a moveable feast (2 days before Easter Sunday), so it
     can't be hardcoded. This computes Easter Sunday for any year using
     the standard Gregorian algorithm (Meeus/Jones/Butcher), then checks
     today's date against Easter minus two days.
     Note: uses the visitor's local device date/time zone. ---------- */
  function getEasterSunday(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }
  function isGoodFriday(today) {
    var easter = getEasterSunday(today.getFullYear());
    var goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    return (
      today.getFullYear() === goodFriday.getFullYear() &&
      today.getMonth() === goodFriday.getMonth() &&
      today.getDate() === goodFriday.getDate()
    );
  }
  function buildHeader() {
    var current = currentFile();
    var links = NAV_LINKS.map(function (link) {
      var isCurrent = link.href === current;
      return (
        '<li><a href="' + link.href + '"' +
        (isCurrent ? ' aria-current="page"' : '') +
        '>' + link.label + '</a></li>'
      );
    }).join("");
    return (
      '<div class="container header-inner">' +
        '<a href="index.html" class="wordmark">' +
          '<span class="lamp" aria-hidden="true"></span>' +
          SITE_NAME +
        '</a>' +
        '<nav class="site-nav" aria-label="Main navigation">' +
          '<ul class="nav-list">' + links + '</ul>' +
        '</nav>' +
        '<button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="primary-nav">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>'
    );
  }
  function buildFooter() {
    var links = NAV_LINKS.map(function (link) {
      return '<a href="' + link.href + '">' + link.label + '</a>';
    }).join("");
    return (
      '<div class="container footer-inner">' +
        '<div class="footer-lamp">' +
          '<span class="lamp" aria-hidden="true"></span>' +
          '<span>&ldquo;Unless you eat the flesh of the Son of Man and drink his blood, you do not have life within you.&rdquo;</span>' +
        '</div>' +
        '<p class="accordion-note footer-cite">John 6:53</p>' +
        '<nav class="footer-nav" aria-label="Footer navigation">' + links + '</nav>' +
        '<p class="footer-copy">&copy; <span data-year></span> ' + SITE_NAME + '. Built for the glory of God.</p>' +
      '</div>'
    );
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (isGoodFriday(new Date())) {
      document.body.classList.add("is-good-friday");
    }
    var headerMount = document.getElementById("site-header");
    var footerMount = document.getElementById("site-footer");
    if (headerMount) {
      headerMount.innerHTML = buildHeader();
      headerMount.classList.add("site-header");
      var toggle = headerMount.querySelector(".nav-toggle");
      var nav = headerMount.querySelector(".site-nav");
      if (toggle && nav) {
        nav.setAttribute("id", "primary-nav");
        toggle.addEventListener("click", function () {
          var isOpen = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
      }
    }
    if (footerMount) {
      footerMount.innerHTML = buildFooter();
      footerMount.classList.add("site-footer");
      var yearEl = footerMount.querySelector("[data-year]");
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
    }
  });
})();
/* ---- Quiet enhancements: scroll reveal, header height, "On this page" scrollspy ---- */
document.addEventListener("DOMContentLoaded", function () {
  var root = document.documentElement;
  var header = document.getElementById("site-header");
  function setHeaderHeight() {
    if (header) root.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);

  var canObserve = "IntersectionObserver" in window;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canObserve && !reduceMotion) {
    root.classList.add("js");
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    var counts = new Map();
    var targets = ".section-header, .card, .callout, .receive-branch, .verse-banner, blockquote.scripture, .timeline-item";
    document.querySelectorAll(targets).forEach(function (el) {
      if (el.closest(".miracle-grid, [class*='miracle-modal']")) return;
      if (el.parentNode.closest(".reveal")) return;
      var n = counts.get(el.parentNode) || 0;
      counts.set(el.parentNode, n + 1);
      el.classList.add("reveal");
      el.style.setProperty("--d", Math.min(n, 4) * 70 + "ms");
      reveal.observe(el);
    });
  }

  var links = [].slice.call(document.querySelectorAll(".subnav a[href^='#']"));
  if (links.length && canObserve) {
    var byId = {};
    links.forEach(function (a) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (target) byId[target.id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.removeAttribute("aria-current"); });
        byId[entry.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(byId).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }
});
