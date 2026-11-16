/* Calendario para elegir día y hora de la demo (inicio, plataforma, planes). Fuente principal: este repositorio (antes: artefactos de claude.ai). */
/* =====================================================================
   UNIVIA TECH · CALENDARIO PARA ELEGIR DÍA Y HORA DE LA DEMO
   ---------------------------------------------------------------------
   Cambia aquí los horarios y sube este archivo. Todas las páginas lo usan.
     HORAS       Horas que se ofrecen, en hora de Ecuador.
     DIAS        Días de la semana: 1 lunes ... 5 viernes, 6 sábado, 7 domingo.
     ANTICIPO    Días mínimos de anticipación (1 = desde mañana).
     VENTANA     Hasta cuántos días hacia adelante se puede elegir.
     BLOQUEADOS  Feriados y días sin demos (año-mes-día). Actualízalos cada año.
   El calendario guarda la preferencia del cliente: no reserva el espacio ni
   revisa tu agenda real. Univia confirma cada cita por WhatsApp o correo.
   ===================================================================== */
var HORAS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
var DIAS = [1, 2, 3, 4, 5];
var ANTICIPO = 1;
var VENTANA = 30;
var BLOQUEADOS = ['2026-12-25', '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-26'];

(function () {
  'use strict';
  var caja = document.getElementById('agenda'), paso2 = document.getElementById('paso2');
  if (!caja || !paso2) return;

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

  var hoy = hoyEc(), desde = hoy + ANTICIPO * DIA, hasta = hoy + VENTANA * DIA;
  function disponible(t) { return t >= desde && t <= hasta && DIAS.indexOf(ndia(t)) >= 0 && BLOQUEADOS.indexOf(iso(t)) < 0; }

  // Primer día disponible: el calendario abre en ese mes
  var primero = desde;
  while (!disponible(primero) && primero <= hasta) primero += DIA;
  var d0 = new Date(primero);
  var anio = d0.getUTCFullYear(), mes = d0.getUTCMonth();
  var diaSel = null, horaSel = null, listo = false, sinFecha = false;

  function pinta() {
    caja.textContent = '';
    paso2.hidden = !listo;
    if (listo) return resumen();

    caja.appendChild(el('span', 'ag-paso', 'Paso 1 de 2'));
    caja.appendChild(el('h3', 'ag-tit', 'Elige el día y la hora de tu demo'));
    caja.appendChild(el('p', 'ag-nota', 'Horario de Ecuador. Te confirmamos la cita por WhatsApp o correo.'));

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
      HORAS.forEach(function (h) {
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
    return { valor: iso(diaSel) + ' ' + horaSel + ':00', texto: fmt(diaSel, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + horaSel + ' (hora de Ecuador)' };
  }
  window.__agenda = { valor: valor };
  pinta();
})();
