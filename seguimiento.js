/* =====================================================================
   seguimiento.js · aviso de cookies y medición del sitio de Univia Tech
   Fuente principal: este repositorio (reemplaza al seguimiento.js del sitio original, que nunca llegó).

   Cumple lo que dice la Política de protección de datos (sección "Cookies y medición"):
   - Google Analytics, Google Tag Manager, Pixel de Meta y LinkedIn Insight Tag solo se cargan si la
     persona acepta en el aviso de cookies. Si rechaza, la web funciona igual.
   - Enlace "Cookies" al pie para cambiar la decisión.

   IDs: se llenan aquí. Mientras estén todos vacíos no se carga nada, no aparece el aviso ni el enlace.
   ===================================================================== */
var SEGUIMIENTO = {
  GA4: '',                  // [PENDIENTE] Google Analytics 4, ej. 'G-XXXXXXXXXX'
  GTM: '',                  // [PENDIENTE] Google Tag Manager, ej. 'GTM-XXXXXXX'
  META_PIXEL: '',           // [PENDIENTE] Pixel de Meta, solo números
  LINKEDIN: '',             // [PENDIENTE] LinkedIn Insight Tag (Partner ID), solo números
  LINKEDIN_CONVERSION: ''   // [PENDIENTE] id de conversión de LinkedIn para el formulario (opcional)
};

(function () {
  'use strict';
  var C = SEGUIMIENTO;
  if (!C.GA4 && !C.GTM && !C.META_PIXEL && !C.LINKEDIN) return;

  var CLAVE = 'univia-cookies', VERSION = 1;
  var yo = document.currentScript || document.querySelector('script[src$="seguimiento.js"]');
  var raiz = yo ? new URL('.', yo.src).href : '/';
  var cargadas = false;

  function leer() {
    try { var d = JSON.parse(localStorage.getItem(CLAVE) || 'null'); return d && d.v === VERSION ? d.decision : null; }
    catch (e) { return null; }
  }
  function guardar(decision) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION, decision: decision, fecha: new Date().toISOString() })); } catch (e) {}
  }
  function prueba() { try { return sessionStorage.getItem('univia-prueba') === '1'; } catch (e) { return false; } }
  function script(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }

  // Google Consent Mode: todo denegado hasta que la persona acepte.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  function cargar() {
    if (cargadas) return;
    cargadas = true;
    gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    if (C.GTM) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      script('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(C.GTM));
    }
    if (C.GA4) {
      script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.GA4));
      gtag('js', new Date());
      gtag('config', C.GA4);
    }
    if (C.META_PIXEL && !window.fbq) {
      var f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
      window._fbq = f; f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
      script('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', C.META_PIXEL);
      window.fbq('track', 'PageView');
    }
    if (C.LINKEDIN) {
      window._linkedin_partner_id = C.LINKEDIN;
      window._linkedin_data_partner_ids = (window._linkedin_data_partner_ids || []).concat(C.LINKEDIN);
      if (!window.lintrk) { window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); }; window.lintrk.q = []; }
      script('https://snap.licdn.com/li.lms-analytics/insight.min.js');
    }
  }

  // Eventos del sitio. Nunca se envían datos personales (nombre, correo, celular).
  function evento(nombre, datos) {
    if (!cargadas || prueba()) return;
    window.dataLayer.push(Object.assign({ event: nombre }, datos));
    if (nombre === 'univia_lead') {
      if (C.GA4) gtag('event', 'generate_lead', { method: datos.via, plan: datos.plan });
      if (window.fbq) window.fbq('track', 'Lead');
      if (window.lintrk && C.LINKEDIN_CONVERSION) window.lintrk('track', { conversion_id: Number(C.LINKEDIN_CONVERSION) });
    } else if (nombre === 'univia_whatsapp') {
      if (C.GA4) gtag('event', 'contact', { method: 'whatsapp' });
      if (window.fbq) window.fbq('track', 'Contact');
    }
  }
  document.addEventListener('univia:lead', function (e) {
    var d = e.detail || {};
    evento('univia_lead', { via: d.via || '', plan: d.plan || '', pagina: location.pathname });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"], a.js-wa');
    if (a) evento('univia_whatsapp', { pagina: location.pathname });
  });

  // Aviso de cookies
  var css = '' +
    '.ck-aviso{position:fixed;left:12px;right:12px;bottom:12px;z-index:90;max-width:560px;margin-inline:auto;' +
    'background:var(--surface,#fff);color:var(--ink,#262626);border:1px solid var(--line,#cfcbc2);border-radius:16px;' +
    'box-shadow:0 10px 30px rgba(0,0,0,.18);padding:18px 18px 16px;font:400 .92rem/1.5 var(--f-body,var(--f,system-ui,sans-serif))}' +
    '.ck-aviso p{margin:0 0 14px}.ck-aviso a{color:inherit}' +
    '.ck-acts{display:flex;flex-wrap:wrap;gap:10px}' +
    '.ck-acts button{flex:1 1 140px;min-height:46px;border-radius:999px;font-weight:600;font-size:.95rem;font-family:inherit;cursor:pointer;' +
    'border:2px solid var(--ink,#262626);background:transparent;color:var(--ink,#262626)}' +
    '.ck-acts .ck-si{background:var(--btn-bg,#262626);color:var(--btn-fg,#f5ff86);border-color:var(--btn-bg,#262626)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var aviso = null;
  function cerrar() { if (aviso) { aviso.remove(); aviso = null; } }
  function abrir() {
    if (aviso) return;
    aviso = document.createElement('div');
    aviso.className = 'ck-aviso';
    aviso.setAttribute('role', 'dialog');
    aviso.setAttribute('aria-label', 'Aviso de cookies');
    var p = document.createElement('p');
    p.appendChild(document.createTextNode('Usamos cookies de Google, Meta y LinkedIn para medir qué contenidos funcionan y mostrarte anuncios de Univia Tech. Solo se activan si aceptas; si no, la web funciona igual. Más detalle en la '));
    var a = document.createElement('a'); a.href = raiz + 'politica-de-datos/'; a.textContent = 'Política de protección de datos';
    p.appendChild(a); p.appendChild(document.createTextNode('.'));
    var acts = document.createElement('div'); acts.className = 'ck-acts';
    var no = document.createElement('button'); no.type = 'button'; no.className = 'ck-no'; no.textContent = 'Rechazar';
    var si = document.createElement('button'); si.type = 'button'; si.className = 'ck-si'; si.textContent = 'Aceptar';
    no.addEventListener('click', function () {
      var antes = leer(); guardar('no'); cerrar();
      if (antes === 'si') location.reload(); // las etiquetas ya cargadas solo se quitan recargando
    });
    si.addEventListener('click', function () { guardar('si'); cerrar(); cargar(); });
    acts.appendChild(no); acts.appendChild(si);
    aviso.appendChild(p); aviso.appendChild(acts);
    document.body.appendChild(aviso);
    si.focus({ preventScroll: true });
  }

  // Enlace "Cookies" al pie
  function enlacePie() {
    var pie = document.querySelector('footer .fcontact') || document.querySelector('footer');
    if (!pie || pie.querySelector('[data-cookies]')) return;
    var span = document.createElement('span');
    var a = document.createElement('a'); a.href = '#'; a.textContent = 'Cookies'; a.setAttribute('data-cookies', '');
    a.addEventListener('click', function (e) { e.preventDefault(); abrir(); });
    span.appendChild(a);
    var ultimo = pie.lastElementChild;
    pie.insertBefore(span, ultimo && ultimo.tagName === 'SPAN' ? ultimo : null);
  }

  window.UniviaCookies = { abrir: abrir, decision: leer };

  function iniciar() {
    enlacePie();
    var d = leer();
    if (d === 'si') cargar();
    else if (d !== 'no') abrir();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
