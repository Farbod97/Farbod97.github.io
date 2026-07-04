/* farbodh.com — shared scripts (no dependencies) */
(function () {
  'use strict';

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- theme toggle (initial theme is set inline in <head>) ---------- */
  var root = document.documentElement;
  function applyThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content',
      root.getAttribute('data-theme') === 'dark' ? '#0a1220' : '#ffffff');
  }
  applyThemeColor();
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      applyThemeColor();
    });
  });
  // Follow OS changes unless the visitor picked a theme manually.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (!saved) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        applyThemeColor();
      }
    });
  }

  /* ---------- mobile menu ---------- */
  var links = document.getElementById('links');
  var menuBtn = document.querySelector('.menu-toggle');
  function closeMenu() {
    if (!links) return;
    links.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- reveal on scroll (with stagger inside groups) ---------- */
  document.querySelectorAll('.grid, .skills, .masonry, .timeline, .about-grid, .journey, .built, .flow, .gallery')
    .forEach(function (group) {
      group.querySelectorAll('.reveal').forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 0.08, 0.4) + 's';
      });
    });
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- scroll progress bar ---------- */
  var pb = document.getElementById('progress');
  if (pb) {
    var onScroll = function () {
      var h = document.documentElement;
      var sc = h.scrollTop || document.body.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      pb.style.width = (max > 0 ? (sc / max * 100) : 0) + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- scrollspy: highlight the section in view ---------- */
  var navLinks = document.querySelectorAll('nav.links a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          navLinks.forEach(function (x) { x.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- hero slideshow (pauses when the tab is hidden) ---------- */
  var slides = document.querySelectorAll('.hero-slides .slide');
  if (slides.length) {
    var si = 0;
    slides[0].classList.add('active');
    if (slides.length > 1) {
      setInterval(function () {
        if (document.hidden) return;
        slides[si].classList.remove('active');
        si = (si + 1) % slides.length;
        slides[si].classList.add('active');
      }, 5000);
    }
  }

  /* ---------- the build-up: click a step to slide its project open ---------- */
  var journey = document.querySelector('.journey');
  var store = document.getElementById('panel-store');
  if (journey && store) {
    var jsteps = Array.prototype.slice.call(journey.querySelectorAll('.step[data-panel]'));
    var xpWrap = document.createElement('div');
    xpWrap.className = 'step-expander';
    var openStep = null;
    var noMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Last step on the same visual row, so the panel opens directly beneath it.
    function rowLast(step) {
      var top = step.offsetTop, last = step;
      jsteps.forEach(function (s) { if (Math.abs(s.offsetTop - top) < 2) last = s; });
      return last;
    }
    function stash() {
      while (xpWrap.firstChild) store.appendChild(xpWrap.firstChild);
    }
    function afterTransition(fn) {
      var done = false;
      var t = setTimeout(run, 520);
      function run(e) {
        if (e && e.target !== xpWrap) return;
        if (done) return;
        done = true;
        clearTimeout(t);
        xpWrap.removeEventListener('transitionend', run);
        fn();
      }
      xpWrap.addEventListener('transitionend', run);
    }
    function collapse(then) {
      if (!openStep) { if (then) then(); return; }
      openStep.classList.remove('open');
      openStep.setAttribute('aria-expanded', 'false');
      openStep = null;
      if (noMotion) {
        stash(); xpWrap.remove();
        if (then) then(); return;
      }
      xpWrap.style.height = xpWrap.scrollHeight + 'px';
      void xpWrap.offsetHeight;
      xpWrap.style.height = '0px';
      afterTransition(function () {
        stash(); xpWrap.remove();
        if (then) then();
      });
    }
    function expand(step) {
      var panel = document.getElementById(step.getAttribute('data-panel'));
      if (!panel) return;
      stash();
      rowLast(step).insertAdjacentElement('afterend', xpWrap);
      xpWrap.appendChild(panel);
      openStep = step;
      step.classList.add('open');
      step.setAttribute('aria-expanded', 'true');
      if (noMotion) { xpWrap.style.height = 'auto'; return; }
      xpWrap.style.height = '0px';
      void xpWrap.offsetHeight;
      xpWrap.style.height = xpWrap.scrollHeight + 'px';
      afterTransition(function () {
        xpWrap.style.height = 'auto';
        var r = xpWrap.getBoundingClientRect();
        if (r.bottom > window.innerHeight || r.top < 0) {
          xpWrap.scrollIntoView({ behavior: noMotion ? 'auto' : 'smooth', block: 'nearest' });
        }
      });
    }
    function toggleStep(step) {
      if (openStep === step) collapse();
      else if (openStep) collapse(function () { expand(step); });
      else expand(step);
    }
    jsteps.forEach(function (step) {
      step.addEventListener('click', function () { toggleStep(step); });
      step.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStep(step); }
      });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.xp-close')) collapse();
    });
    // Column count changes on resize; keep the panel under its step.
    var rsz;
    window.addEventListener('resize', function () {
      clearTimeout(rsz);
      rsz = setTimeout(function () {
        if (openStep) rowLast(openStep).insertAdjacentElement('afterend', xpWrap);
      }, 150);
    }, { passive: true });
  }

  /* ---------- lightbox for gallery images ---------- */
  var lbFigures = Array.prototype.slice.call(
    document.querySelectorAll('.masonry figure, .gallery figure, .ba figure, .xp-photos figure'));
  if (lbFigures.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Close">&#10005;</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous image">&#8249;</button>' +
      '<button class="lb-btn lb-next" aria-label="Next image">&#8250;</button>' +
      '<span class="lb-count" aria-hidden="true"></span>' +
      '<figure><img alt="" /><figcaption></figcaption></figure>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var lbCount = lb.querySelector('.lb-count');
    var idx = 0, lastFocus = null;

    function render() {
      var fig = lbFigures[idx];
      var img = fig.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      var cap = fig.querySelector('figcaption');
      lbCap.textContent = cap ? cap.textContent : '';
      lbCount.textContent = (idx + 1) + ' / ' + lbFigures.length;
    }
    function openLb(i) {
      idx = i; lastFocus = document.activeElement;
      render();
      lb.classList.add('open');
      document.body.classList.add('lb-lock');
      lb.querySelector('.lb-close').focus();
    }
    function closeLb() {
      lb.classList.remove('open');
      document.body.classList.remove('lb-lock');
      if (lastFocus) lastFocus.focus();
    }
    function step(d) { idx = (idx + d + lbFigures.length) % lbFigures.length; render(); }

    lbFigures.forEach(function (fig, i) {
      fig.classList.add('lb-zoom');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      var img = fig.querySelector('img');
      fig.setAttribute('aria-label', 'Enlarge: ' + (img && img.alt ? img.alt : 'image'));
      fig.addEventListener('click', function () { openLb(i); });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    // swipe on touch screens
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1);
      tx = null;
    }, { passive: true });
  }

  /* ---------- email button: copy to clipboard ---------- */
  var eb = document.getElementById('emailBtn');
  if (eb) {
    eb.addEventListener('click', function (e) {
      if (navigator.clipboard) {
        e.preventDefault();
        navigator.clipboard.writeText('fhaeri@ucsd.edu').then(function () {
          var prev = eb.textContent;
          eb.textContent = 'Copied to clipboard';
          setTimeout(function () { eb.textContent = prev; }, 1600);
        });
      }
    });
  }
})();
