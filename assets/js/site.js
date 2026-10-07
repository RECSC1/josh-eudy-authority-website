(function () {
  'use strict';

  /* ---------- Nav state ---------- */
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero, .banner');
  function navState() {
    if (!nav) return;
    var threshold = hero ? Math.max(hero.offsetHeight - 120, 80) : 40;
    if (window.scrollY > threshold || !hero) {
      nav.classList.add('solid');
      nav.classList.remove('over-hero');
    } else {
      nav.classList.remove('solid');
      nav.classList.add('over-hero');
    }
  }
  navState();
  window.addEventListener('scroll', navState, { passive: true });
  window.addEventListener('resize', navState);

  /* ---------- Mobile drawer ---------- */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  var closeBtn = document.querySelector('.drawer .x');
  function toggleDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) burger.addEventListener('click', function () { toggleDrawer(!drawer.classList.contains('open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { toggleDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleDrawer(false); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
  // safety net: never leave content hidden
  window.setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.5) el.classList.add('in');
    });
  }, 2200);

  /* ---------- Accordions ---------- */
  document.querySelectorAll('.acc-q').forEach(function (q) {
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var item = q.closest('.acc-item');
      var panel = item.querySelector('.acc-a');
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : 0;
    });
  });

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute('data-count'));
        var prefix = el.getAttribute('data-prefix') || '', suffix = el.getAttribute('data-suffix') || '';
        var dec = (el.getAttribute('data-dec') | 0), start = null, dur = 1400;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Service area map <-> grid ---------- */
  var pins = document.querySelectorAll('.map-pin');
  var legendName = document.getElementById('legend-name');
  var legendCopy = document.getElementById('legend-copy');
  pins.forEach(function (pin) {
    function activate() {
      pins.forEach(function (p) { p.classList.remove('active'); });
      pin.classList.add('active');
      if (legendName) legendName.textContent = pin.getAttribute('data-name');
      if (legendCopy) legendCopy.textContent = pin.getAttribute('data-note');
      var card = document.getElementById(pin.getAttribute('data-target'));
      if (card) {
        document.querySelectorAll('.area-card').forEach(function (c) { c.style.outline = ''; });
        card.style.outline = '2px solid #8C6B22';
        card.style.outlineOffset = '3px';
      }
    }
    pin.addEventListener('mouseenter', activate);
    pin.addEventListener('focus', activate);
    pin.addEventListener('click', function () {
      activate();
      var card = document.getElementById(pin.getAttribute('data-target'));
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    pin.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin.click(); }
    });
  });

  /* ---------- Sticky home value CTA ---------- */
  var sticky = document.querySelector('.sticky-cta');
  if (sticky) {
    window.addEventListener('scroll', function () {
      var show = window.scrollY > window.innerHeight * 0.9;
      var atBottom = (window.innerHeight + window.scrollY) > (document.body.offsetHeight - 420);
      sticky.classList.toggle('show', show && !atBottom);
    }, { passive: true });
  }

  /* ---------- Hero video: pause offscreen, respect data saver ---------- */
  var vid = document.querySelector('.hero-media video');
  if (vid) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conn = navigator.connection || {};
    if (reduce || conn.saveData || /2g/.test(conn.effectiveType || '')) {
      vid.removeAttribute('autoplay');
      vid.pause();
      vid.style.display = 'none';
    } else {
      var p = vid.play();
      if (p && p.catch) p.catch(function () { vid.style.display = 'none'; });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
          e[0].isIntersecting ? vid.play().catch(function () {}) : vid.pause();
        }, { threshold: 0.05 }).observe(vid);
      }
    }
  }

  /* ---------- Chip pickers (progressive enhancement over <select>) ---------- */
  document.querySelectorAll('select[data-chips]').forEach(function (sel) {
    var wrap = document.createElement('div');
    wrap.className = 'chips';
    wrap.setAttribute('role', 'radiogroup');
    if (sel.id) wrap.setAttribute('aria-labelledby', sel.id + '-lbl');
    var lbl = sel.parentNode.querySelector('label');
    if (lbl && sel.id) { lbl.id = sel.id + '-lbl'; lbl.removeAttribute('for'); }

    Array.prototype.forEach.call(sel.options, function (opt, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.textContent;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
      if (i === 0) b.classList.add('on');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(wrap.children, function (c) {
          c.classList.remove('on'); c.setAttribute('aria-checked', 'false');
        });
        b.classList.add('on'); b.setAttribute('aria-checked', 'true');
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      wrap.appendChild(b);
    });
    sel.style.display = 'none';
    sel.parentNode.appendChild(wrap);
    if (sel.parentNode.classList.contains('field')) sel.parentNode.classList.add('full');
  });

  /* ---------- Lead forms: submit to Netlify Forms, emailed to Josh ---------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.classList.contains('lead-form')) {
        /* Home search bar: no IDX yet, send people to Buy */
        var q = (form.querySelector('input[name=q]') || {}).value || '';
        window.location.href = '/contact?search=' + encodeURIComponent(q) + '#connect';
        return;
      }
      var btn = form.querySelector('button[type=submit]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      var data = new FormData(form);
      if (!data.get('form-name')) data.set('form-name', form.getAttribute('name') || 'lead');
      data.set('page', window.location.pathname);
      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });
      var name = (form.querySelector('input[name=first_name], input[name=name]') || {}).value || '';
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(true); })
        .catch(function () { done(false); });
      function done(ok) {
        var h = Math.min(Math.max(form.offsetHeight, 260), 380);
        form.style.minHeight = h + 'px';
        form.innerHTML = ok ?
          '<div class="form-done"><div class="tick" aria-hidden="true">&#10003;</div>' +
          '<h3>' + (name ? 'Thanks, ' + name.replace(/[<>&"]/g, '') + '.' : 'Got it.') + '</h3>' +
          '<p>This came straight to me. I will get back to you personally, usually the same day.</p>' +
          '<p class="form-note" style="margin-top:18px">Need me sooner? Call or text <a href="tel:+19103335433" style="color:var(--red)">(910) 333-5433</a>.</p></div>'
          :
          '<div class="form-done"><h3>That did not go through.</h3>' +
          '<p>Sorry about that. Call or text me at <a href="tel:+19103335433" style="color:var(--red)">(910) 333-5433</a> ' +
          'or email <a href="mailto:homessoldbyjosh@gmail.com" style="color:var(--red)">homessoldbyjosh@gmail.com</a> and I will take it from there.</p></div>';
      }
    });
  });
  /* Prefill the contact form from the home search bar until IDX is connected */
  (function () {
    var q = new URLSearchParams(window.location.search).get('search');
    var ta = document.querySelector('form.lead-form textarea[name=message]');
    if (q && ta) { ta.value = 'I am looking for: ' + q; }
  })();
})();
