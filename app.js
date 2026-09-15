/* Contadora Meli — Landing interactions */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    var payload = Object.assign({ event: event }, params || {});
    window.dataLayer.push(payload);
    if (window.console && console.log) console.log('[track]', payload);
  }

  // ViewContent al cargar
  track('ViewContent', { page: 'venta-curso-online' });

  /* 1. Countdown 48h persistente en localStorage */
  var KEY = 'meli_promo_deadline_v1';
  var HOURS = 48;
  function getDeadline() {
    try {
      var saved = localStorage.getItem(KEY);
      var now = Date.now();
      if (saved) {
        var ts = parseInt(saved, 10);
        if (!isNaN(ts) && ts > now) return ts;
      }
      var fresh = now + HOURS * 3600 * 1000;
      localStorage.setItem(KEY, String(fresh));
      return fresh;
    } catch (e) {
      return Date.now() + HOURS * 3600 * 1000;
    }
  }
  var deadline = getDeadline();
  var el = document.getElementById('countdown');
  var elMini = document.getElementById('countdownMini');
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var diff = Math.max(0, deadline - Date.now());
    if (diff === 0) { // reinicia ciclo de 48h
      deadline = Date.now() + HOURS * 3600 * 1000;
      try { localStorage.setItem(KEY, String(deadline)); } catch (e) {}
      diff = deadline - Date.now();
    }
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var txt = pad(h) + ':' + pad(m) + ':' + pad(s);
    if (el) el.textContent = txt;
    if (elMini) elMini.textContent = txt;
  }
  tick();
  setInterval(tick, 1000);

  /* 2. Smooth scroll (respetando reduce-motion; CSS ya lo hace, esto es fallback + cierre menú) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (a.getAttribute('aria-disabled') === 'true') { ev.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      closeMenu();
      if (id === '#precio') track('InitiateCheckout', { source: 'anchor' });
    });
  });

  /* 3. Acordeón programa: un solo <details> abierto a la vez */
  var acc = document.getElementById('programAccordion');
  if (acc) {
    acc.querySelectorAll('details').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) {
          acc.querySelectorAll('details').forEach(function (other) {
            if (other !== d && other.open) other.open = false;
          });
        }
      });
    });
  }

  /* 4. Menú móvil */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  /* 5. IntersectionObserver para animar .reveal con stagger sutil + hairline dorada */
  var reveals = document.querySelectorAll('.reveal');
  var goldRules = document.querySelectorAll('.gold-rule');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Stagger: retardo por índice dentro del mismo padre (máx 4 niveles, 70ms)
  if (!reduceMotion) {
    reveals.forEach(function (r) {
      var parent = r.parentElement;
      var siblings = parent ? parent.querySelectorAll(':scope > .reveal') : [r];
      var idx = Array.prototype.indexOf.call(siblings, r);
      if (idx > 0 && idx < 4) r.style.setProperty('--rv-d', (idx * 70) + 'ms');
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
    goldRules.forEach(function (g) { io.observe(g); });
  } else {
    reveals.forEach(function (r) { r.classList.add('visible'); });
    goldRules.forEach(function (g) { g.classList.add('visible'); });
  }

  /* 5b. Contadores animados en métricas (una sola vez, respeta reduced-motion) */
  var counters = document.querySelectorAll('.metrics strong[data-count]');
  function renderCount(n) {
    var target = parseFloat(n.dataset.count);
    var dec = parseInt(n.dataset.decimals || '0', 10);
    var pre = n.dataset.prefix || '';
    var suf = n.dataset.suffix || '';
    return function (v) { n.textContent = pre + v.toFixed(dec) + suf; };
  }
  function animateCount(n) {
    var target = parseFloat(n.dataset.count);
    var draw = renderCount(n);
    if (reduceMotion) { draw(target); return; }
    var dur = 1200;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      draw(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else draw(target);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            cio.unobserve(en.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* 6. Feedback de dolores chequeables + CTA dinámico #pain-cta */
  var pains = document.querySelectorAll('.pain input[type="checkbox"]');
  var painResult = document.getElementById('painResult');
  var painCta = document.getElementById('pain-cta');
  var painLabel = painCta ? painCta.querySelector('.pain-cta-label') : null;
  function updatePainCta(n) {
    if (!painCta || !painLabel) return;
    painCta.setAttribute('data-count', String(n));
    if (n === 0) {
      painLabel.textContent = 'Marcá las que te pasen 👆';
      painCta.classList.add('is-disabled');
      painCta.setAttribute('aria-disabled', 'true');
    } else if (n < 3) {
      painLabel.textContent = 'Sí, me pasa (' + n + ') → ver cómo lo resuelvo';
      painCta.classList.remove('is-disabled');
      painCta.setAttribute('aria-disabled', 'false');
    } else {
      painLabel.textContent = 'Definitivamente es para vos (' + n + ') → ver el programa';
      painCta.classList.remove('is-disabled');
      painCta.setAttribute('aria-disabled', 'false');
    }
  }
  if (pains.length && painResult) {
    var base = 'Marcá las que te pasen 👆 y mirá el programa acá abajo.';
    updatePainCta(0);
    pains.forEach(function (c) {
      c.addEventListener('change', function () {
        var n = document.querySelectorAll('.pain input:checked').length;
        if (n === 0) painResult.textContent = base;
        else if (n < 4) painResult.textContent = 'Marcaste ' + n + ' 👉 el curso te ordena justo eso. Mirá el programa.';
        else painResult.textContent = 'Marcaste las 4 😅 este curso es 100% para vos. Andá directo al precio.';
        updatePainCta(n);
        if (n > 0) track('PainQualify', { count: n });
      });
    });
  }
  if (painCta) {
    painCta.addEventListener('click', function (ev) {
      if (painCta.getAttribute('aria-disabled') === 'true') ev.preventDefault();
    });
  }

  /* 7. Form lead magnet: validación + localStorage + éxito */
  var form = document.getElementById('leadForm');
  var msg = document.getElementById('formMsg');
  if (form) {
    form.querySelectorAll('input').forEach(function (i) {
      i.addEventListener('blur', function () { i.classList.add('touched'); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nombre = form.nombre.value.trim();
      var email = form.email.value.trim();
      var wsp = form.whatsapp.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      var wspOk = /^[0-9 +().-]{6,}$/.test(wsp);
      if (nombre.length < 2 || !emailOk || !wspOk) {
        msg.textContent = 'Revisá los datos: nombre, email válido y WhatsApp.';
        msg.className = 'form-msg err';
        track('Lead', { status: 'error' });
        return;
      }
      var lead = { nombre: nombre, email: email, whatsapp: wsp, fecha: new Date().toISOString(), origen: 'checklist-ml' };
      try {
        var prev = JSON.parse(localStorage.getItem('meli_leads') || '[]');
        prev.push(lead);
        localStorage.setItem('meli_leads', JSON.stringify(prev));
      } catch (e) {}
      track('Lead', { status: 'ok', origen: 'checklist-ml' });
      form.reset();
      msg.textContent = '¡Listo, ' + nombre.split(' ')[0] + '! 🎉 Revisá tu email: te enviamos el checklist "Qué pedirle a tu cliente ML todos los meses".';
      msg.className = 'form-msg ok';
    });
  }

  /* 8. Eventos data-track genéricos */
  document.querySelectorAll('[data-track]').forEach(function (n) {
    n.addEventListener('click', function () {
      if (n.getAttribute('aria-disabled') === 'true') return;
      var extra = {};
      if (n.dataset.plan) extra.plan = n.dataset.plan;
      if (n.dataset.count) extra.count = parseInt(n.dataset.count, 10);
      if (n.tagName === 'A' && n.href) extra.href = n.href;
      track(n.dataset.track, extra);
    });
  });
})();
