/* =====================================================
   ABDEL BARBER STYLE — App (sin ES modules, compatible file://)
   ===================================================== */

(function () {

  /* ── Header ────────────────────────────────────────── */
  function initHeader() {
    var header      = document.querySelector('.site-header');
    var hamburger   = document.querySelector('.hamburger');
    var mobileNav   = document.querySelector('.mobile-nav');
    var overlay     = document.querySelector('.nav-overlay');
    var navLinks    = document.querySelectorAll('.nav-link[href^="#"]');
    var sections    = document.querySelectorAll('section[id]');
    var heroScroll  = document.querySelector('.hero-scroll');

    if (!header) return;

    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 24);
      if (heroScroll) heroScroll.classList.toggle('hidden', window.scrollY > 80);
      updateActiveNav();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function closeMenu() {
      hamburger && hamburger.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', false);
      mobileNav && mobileNav.classList.remove('open');
      if (overlay) { overlay.classList.remove('open'); overlay.style.display = ''; }
      document.body.style.overflow = '';
    }

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        var isOpen = hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileNav.classList.toggle('open', isOpen);
        if (overlay) {
          overlay.style.display = 'block';
          requestAnimationFrame(function () { overlay.classList.toggle('open', isOpen); });
        }
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }

    document.querySelectorAll('.mobile-nav .nav-link, .mobile-nav .btn-primary').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    function updateActiveNav() {
      var scrollY = window.scrollY + 100;
      sections.forEach(function (section) {
        var top    = section.offsetTop;
        var height = section.offsetHeight;
        var id     = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }
  }

  /* ── Scroll reveal ─────────────────────────────────── */
  function initAnimations() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ── Highlight today in schedule ──────────────────── */
  function highlightToday() {
    var days  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    var today = days[new Date().getDay()];

    document.querySelectorAll('.schedule-row').forEach(function (row) {
      var dayEl = row.querySelector('.schedule-day');
      if (dayEl && dayEl.textContent.trim() === today) {
        row.classList.add('today');
        var tag = document.createElement('span');
        tag.className   = 'schedule-today-tag';
        tag.textContent = 'Hoy';
        var sep = row.querySelector('.schedule-separator');
        if (sep) row.insertBefore(tag, sep);
      }
    });
  }

  /* ── Smooth scroll ─────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id     = anchor.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          var headerH = (document.querySelector('.site-header') || {}).offsetHeight || 72;
          var top = target.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Reviews carousel ─────────────────────────────── */
  function initReviewsCarousel() {
    var grid      = document.querySelector('.reviews-grid');
    var dotsWrap  = document.querySelector('.reviews-dots');
    var prev      = document.querySelector('.reviews-btn-prev');
    var next      = document.querySelector('.reviews-btn-next');
    if (!grid || !prev || !next || !dotsWrap) return;

    var cards   = Array.from(grid.querySelectorAll('.review-card'));
    var current = 0;
    var perPage = 0;
    var total   = 0;

    function getPerPage() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var btn = document.createElement('button');
        btn.className = 'reviews-dot' + (i === current ? ' active' : '');
        btn.setAttribute('aria-label', 'Página ' + (i + 1));
        (function (idx) {
          btn.addEventListener('click', function () { show(idx); });
        })(i);
        dotsWrap.appendChild(btn);
      }
    }

    function show(page) {
      grid.classList.add('fading');
      setTimeout(function () {
        cards.forEach(function (card, i) {
          var inPage = Math.floor(i / perPage) === page;
          card.style.display = inPage ? '' : 'none';
          if (inPage) card.classList.add('visible');
        });
        dotsWrap.querySelectorAll('.reviews-dot').forEach(function (d, i) {
          d.classList.toggle('active', i === page);
        });
        prev.disabled = page === 0;
        next.disabled = page === total - 1;
        grid.classList.remove('fading');
      }, 280);
      current = page;
    }

    function setup() {
      var newPerPage = getPerPage();
      if (newPerPage === perPage && total > 0) return;
      perPage = newPerPage;
      total   = Math.ceil(cards.length / perPage);
      current = 0;
      buildDots();
      show(0);
    }

    prev.addEventListener('click', function () { if (current > 0) show(current - 1); });
    next.addEventListener('click', function () { if (current < total - 1) show(current + 1); });

    setup();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 150);
    });
  }

  /* ── Init ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
    initHeader();
    initAnimations();
    highlightToday();
    initSmoothScroll();
    initReviewsCarousel();
  });

})();
