/* Calendario para elegir día y hora de la demo (inicio, plataforma, planes). Fuente principal: este repositorio (antes: artefactos de claude.ai). */
/* =====================================================================
   UNIVIA TECH · CALENDARIO PARA ELEGIR DÍA Y HORA DE LA DEMO
   ---------------------------------------------------------------------
   CTO-06: los horarios salen del ERP (citas de ERPNext: horarios, agentes, feriados y lo ya reservado) por el
   mismo canal que lead.js (data-erp y data-canal de su <script>). Al enviar el formulario, la cita queda
   reservada. Si el ERP no responde en ESPERA_ERP ms, el calendario usa los valores de abajo como antes.

   Valores de respaldo (solo si el ERP no responde). Todas las páginas los usan.
     HORAS       Horas que se ofrecen, en hora de Ecuador.
     DIAS        Días de la semana: 1 lunes ... 5 viernes, 6 sábado, 7 domingo.
     ANTICIPO    Días mínimos de anticipación (1 = desde mañana).
     VENTANA     Hasta cuántos días hacia adelante se puede elegir.
     BLOQUEADOS  Feriados y días sin demos (año-mes-día). Actualízalos cada año.
   Con los valores de respaldo el calendario guarda la preferencia del cliente: no reserva el espacio ni
   revisa la agenda real. Univia confirma esa cita por WhatsApp o correo.
   ===================================================================== */
var HORAS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
var DIAS = [1, 2, 3, 4, 5];
var ANTICIPO = 1;
var VENTANA = 30;
var ESPERA_ERP = 3500;
// Feriados nacionales de Ecuador ya trasladados (calendario 2027 del Viceministerio de Turismo, nov 2026).
// Los que caen en fin de semana no hacen falta: DIAS ya excluye sábado y domingo.
// Cada noviembre: agregar el año siguiente y quitar las fechas pasadas.
var BLOQUEADOS = [
  '2026-12-25',                                         // Navidad
  '2027-01-01',                                         // Año Nuevo
  '2027-02-08', '2027-02-09',                           // Carnaval
  '2027-03-26',                                         // Viernes Santo
  '2027-04-30',                                         // Día del Trabajo (del 1 may)
  '2027-05-24',                                         // Batalla de Pichincha
  '2027-08-09',                                         // Primer Grito de Independencia (del 10 ago)
  '2027-10-08',                                         // Independencia de Guayaquil (del 9 oct)
  '2027-11-01', '2027-11-02'                            // Difuntos e Independencia de Cuenca
  // 2027-12-25 (Navidad) cae sábado
];

(function () {
  'use strict';
  var caja = document.getElementById('agenda'), paso2 = document.getElementById('paso2');
  if (!caja || !paso2) return;
  // lead.js se declara después de este archivo: se busca su <script> cuando la página terminó de cargar.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  var DIA = 86400000;
  // Todas las fechas se manejan como días de Ecuador, sin depender del país del visitante.
  function hoyEc() {
    var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function fmt(t, op) { op.timeZone = 'UTC'; return new Intl.DateTimeFormat('es-EC', op).format(new Date(t)); }
  function ndia(t) { return new Date(t).getUTCDay() || 7; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function boton(cls, txt, fn) { var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); return b; }

  function aT(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }

  var erp = null; // {dias: {'AAAA-MM-DD': ['HH:MM', ...]}} cuando el ERP respondió con la agenda activa
  var hoy = hoyEc(), desde, hasta, anio, mes;
  var diaSel = null, horaSel = null, listo = false, sinFecha = false;

  function disponible(t) {
    if (erp) return !!(erp.dias[iso(t)] || []).length;
    return t >= desde && t <= hasta && DIAS.indexOf(ndia(t)) >= 0 && BLOQUEADOS.indexOf(iso(t)) < 0;
  }
  function horas(t) { return erp ? erp.dias[iso(t)] || [] : HORAS; }

  // Rango y mes inicial (el del primer día disponible) según la fuente de horarios
  function preparar(datos) {
    erp = datos;
    if (erp) {
      var claves = Object.keys(erp.dias).sort();
      desde = aT(claves[0]); hasta = aT(claves[claves.length - 1]);
    } else {
      desde = hoy + ANTICIPO * DIA; hasta = hoy + VENTANA * DIA;
    }
    var primero = desde;
    while (!disponible(primero) && primero <= hasta) primero += DIA;
    var d0 = new Date(primero);
    anio = d0.getUTCFullYear(); mes = d0.getUTCMonth();
  }

  // GET de horarios libres al ERP del canal. Llama `listo(datos | null)` una sola vez.
  function cargarErp(listo) {
    var s = document.querySelector("script[data-canal][src*='lead.js']");
    if (!s || !window.fetch) return listo(null);
    var base = (s.getAttribute('data-erp') || '').replace(/\/+$/, ''), canal = s.getAttribute('data-canal') || '';
    var hecho = false;
    function fin(x) { if (!hecho) { hecho = true; listo(x); } }
    setTimeout(function () { fin(null); }, ESPERA_ERP);
    fetch(base + '/api/method/app_univia_plataforma.leads_web.agenda.horarios?canal=' + encodeURIComponent(canal), { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { var m = j && j.message; fin(m && m.activa && m.dias && Object.keys(m.dias).length ? m : null); })
      .catch(function () { fin(null); });
  }

  function iniciar() {
    caja.textContent = '';
    caja.appendChild(el('p', 'ag-nota', 'Cargando los horarios disponibles…'));
    cargarErp(function (datos) { preparar(datos); pinta(); });
  }

  // Después de un envío rechazado (el horario se ocupó): refresca los horarios sin tocar lo que se ve, para que
  // "Cambiar" ya no ofrezca el ocupado.
  function recargar() {
    cargarErp(function (datos) { if (datos) preparar(datos); if (!listo) pinta(); });
  }

  function pinta() {
    caja.textContent = '';
    paso2.hidden = !listo;
    if (listo) return resumen();

    caja.appendChild(el('span', 'ag-paso', 'Paso 1 de 2'));
    caja.appendChild(el('h3', 'ag-tit', 'Elige el día y la hora de tu demo'));
    caja.appendChild(el('p', 'ag-nota', erp ? 'Horario de Ecuador. Solo ves los horarios libres: al enviar tus datos, el tuyo queda reservado.' : 'Horario de Ecuador. Te confirmamos la cita por WhatsApp o correo.'));

    var ini = Date.UTC(anio, mes, 1), fin = Date.UTC(anio, mes + 1, 0);
    var cab = el('div', 'ag-cab');
    var ant = boton('ag-nav', '‹', function () { mes--; if (mes < 0) { mes = 11; anio--; } pinta(); });
    ant.setAttribute('aria-label', 'Mes anterior'); ant.disabled = ini <= desde;
    var sig = boton('ag-nav', '›', function () { mes++; if (mes > 11) { mes = 0; anio++; } pinta(); });
    sig.setAttribute('aria-label', 'Mes siguiente'); sig.disabled = fin >= hasta;
    var titulo = el('strong', null, fmt(ini, { month: 'long', year: 'numeric' }));
    titulo.setAttribute('aria-live', 'polite');
    cab.appendChild(ant); cab.appendChild(titulo); cab.appendChild(sig);
    caja.appendChild(cab);

    var g = el('div', 'ag-grid');
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(function (x) { g.appendChild(el('span', 'ag-sem', x)).setAttribute('aria-hidden', 'true'); });
    for (var v = 1; v < ndia(ini); v++) g.appendChild(el('span'));
    for (var t = ini; t <= fin; t += DIA) (function (t) {
      var b = boton('ag-dia', new Date(t).getUTCDate(), function () { diaSel = t; horaSel = null; pinta(); var h = caja.querySelector('.ag-hora'); if (h) h.focus({ preventScroll: true }); });
      b.setAttribute('aria-label', fmt(t, { weekday: 'long', day: 'numeric', month: 'long' }));
      b.disabled = !disponible(t);
      b.setAttribute('aria-pressed', String(t === diaSel));
      g.appendChild(b);
    })(t);
    caja.appendChild(g);

    if (diaSel !== null) {
      caja.appendChild(el('p', 'ag-sub', fmt(diaSel, { weekday: 'long', day: 'numeric', month: 'long' })));
      var hs = el('div', 'ag-horas');
      horas(diaSel).forEach(function (h) {
        hs.appendChild(boton('ag-hora', h, function () {
          horaSel = h; listo = true; sinFecha = false; pinta();
          try { document.dispatchEvent(new CustomEvent('univia:horario', { detail: { fecha: valor().valor } })); } catch (e) {}
          foco();
        }));
      });
      caja.appendChild(hs);
    }
    caja.appendChild(boton('btn btn-primary ag-sin', 'Prefiero que me contacten para coordinar', function () { listo = true; sinFecha = true; diaSel = horaSel = null; pinta(); foco(); }));
  }

  function resumen() {
    caja.appendChild(el('span', 'ag-paso', 'Paso 2 de 2'));
    var r = el('div', 'ag-res'), tx = el('div');
    tx.appendChild(el('small', null, sinFecha ? 'Fecha de tu demo' : 'Tu demo'));
    var s = el('strong', null, sinFecha ? 'La coordinamos contigo' : valor().texto);
    s.tabIndex = -1; tx.appendChild(s); r.appendChild(tx);
    r.appendChild(boton('mini', 'Cambiar', function () { listo = false; sinFecha = false; horaSel = null; pinta(); caja.scrollIntoView({ block: 'nearest' }); }));
    caja.appendChild(r);
    caja.appendChild(el('h3', 'ag-tit', 'Ahora cuéntanos de tu empresa'));
  }

  function foco() { var s = caja.querySelector('.ag-res strong'); if (s) s.focus({ preventScroll: true }); caja.scrollIntoView({ block: 'nearest' }); }

  function valor() {
    if (diaSel === null || !horaSel) return null;
    // reserva: el horario salió del ERP y se reserva al enviar (CTO-06); si no, es solo una preferencia.
    return { valor: iso(diaSel) + ' ' + horaSel + ':00', texto: fmt(diaSel, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + horaSel + ' (hora de Ecuador)', reserva: !!erp };
  }
  window.__agenda = { valor: valor, recargar: recargar };
})();
