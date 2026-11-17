/* Planes, menú, videos, contacto y formulario (inicio, plataforma, planes). Fuente principal: este repositorio (antes: artefactos de claude.ai). */
(function(){
  var box=document.getElementById('err');
  function show(msg){box.textContent='Algo falló en la página: '+msg;box.hidden=false;}
  window.addEventListener('error',function(e){show(e.message||'error desconocido');});
  try{
    /* ===== Datos de contacto (cámbialos aquí) ===== */
    var CONTACTO={whatsapp:'593999813244', whatsappVisible:'+593 99 981 3244', correo:'patricia.segarra@univiatech.com'};

    /* ===== Planes: cifras de la Presentación Univia Tech 2026 ===== */
    var PLANES=[
      {id:'start', nombre:'Univia Start', para:'Micro y pequeñas empresas que quieren orden desde ya.', mensual:79.99, impl:0, dias:0, horas:8, dto:5,
       modulos:['Contabilidad','Facturación electrónica','Anexo Transaccional ATS','Compras','Ventas','Inventario (stock)']},
      {id:'smart', nombre:'Univia Smart', para:'Pymes que ya crecieron y necesitan decidir con datos.', mensual:149.99, impl:500, dias:5, horas:24, dto:10, destacado:true,
       hereda:'Todo Univia Start', modulos:['Gestión de activos fijos','Gestión de clientes (CRM)','Reportes en Power BI']},
      {id:'next', nombre:'Univia Next', para:'Empresas en expansión (retail, comercio electrónico) con operación más compleja.', mensual:274.99, impl:1500, dias:30, horas:32, dto:12,
       hereda:'Todo Univia Smart', modulos:['Punto de venta en línea y sin conexión','Tienda virtual','Integración con botón de pagos','Portal de clientes y proveedores','Manufactura y calidad del producto','Tickets de soporte','RR. HH.: reclutamiento, asistencia, turnos y evaluaciones','Nómina']},
      {id:'one', nombre:'Univia One', para:'Sectores con procesos específicos o normativa propia: salud, educación, agricultura y más.', mensual:499.99, impl:3000, dias:60, horas:32, dto:15,
       hereda:'Todo Univia Next', modulos:['Módulos verticales por industria','Proyectos','Integraciones por API REST','Webhooks y datos en tiempo real']}
    ];

    /* Formato de dinero de Ecuador: $1.619,89 */
    function usd(n){
      var s=(Math.round(n*100)/100).toFixed(2).split('.');
      return '$'+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+s[1];
    }
    function anual(p){return Math.round(p.mensual*12*(100-p.dto))/100;}
    window.__univia={usd:usd,anual:anual,PLANES:PLANES};

    var anualOn=false;
    function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}

    function renderPlanes(){
      var wrap=document.getElementById('plans');if(!wrap)return;wrap.textContent='';
      PLANES.forEach(function(p){
        var c=el('article','plan'+(p.destacado?' featured':''));
        if(p.destacado)c.appendChild(el('span','tag','Más elegido por pymes'));
        c.appendChild(el('h3',null,p.nombre));
        c.appendChild(el('p','for',p.para));
        var pr=el('div','price');
        if(anualOn){
          pr.appendChild(el('b',null,usd(anual(p))));
          pr.appendChild(el('small',null,'al año, con '+p.dto+' % de descuento (equivale a '+usd(anual(p)/12)+' al mes)'));
        }else{
          pr.appendChild(el('b',null,usd(p.mensual)));
          pr.appendChild(el('small',null,p.impl?'al mes + '+usd(p.impl)+' de implementación (pago único)':'al mes · sin costo de implementación'));
        }
        c.appendChild(pr);
        var ul=el('ul');
        if(p.hereda)ul.appendChild(el('li','inherit',p.hereda));
        p.modulos.forEach(function(m){ul.appendChild(el('li',null,m));});
        c.appendChild(ul);
        var b=el('a','btn '+(p.destacado?'btn-primary':'btn-ghost'),'Quiero '+p.nombre.replace('Univia ',''));
        b.href='#contacto';
        b.addEventListener('click',function(){var s=document.getElementById('f-plan');s.value=p.nombre;});
        c.appendChild(b);
        wrap.appendChild(c);
      });
    }
    function renderTabla(){
      var rows=[
        ['Mensualidad',function(p){return usd(p.mensual);}],
        ['Implementación (pago único)',function(p){return p.impl?usd(p.impl):'Sin costo';}],
        ['Tiempo de implementación',function(p){return p.dias?p.dias+' días laborables':'Inmediata';}],
        ['Soporte y capacitación incluidos',function(p){return p.horas+' horas';}],
        ['Descuento por pago anual',function(p){return p.dto+' %';}],
        ['Total anual con descuento',function(p){return usd(anual(p));}]
      ];
      var tb=document.getElementById('plan-table');if(!tb)return;tb.textContent='';
      rows.forEach(function(r){
        var tr=el('tr');var th=el('th',null,r[0]);th.scope='row';tr.appendChild(th);
        PLANES.forEach(function(p){tr.appendChild(el('td',null,r[1](p)));});
        tb.appendChild(tr);
      });
    }
    function setBilling(on){
      anualOn=on;
      document.getElementById('bill-m').setAttribute('aria-pressed',String(!on));
      document.getElementById('bill-y').setAttribute('aria-pressed',String(on));
      renderPlanes();
    }
    if(document.getElementById('bill-m')){document.getElementById('bill-m').addEventListener('click',function(){setBilling(false);});
    document.getElementById('bill-y').addEventListener('click',function(){setBilling(true);});}
    renderPlanes();renderTabla();



    /* ===== Menú del celular ===== */
    var burger=document.getElementById('burger'),mm=document.getElementById('mobile-menu');
    function setMenu(open){burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');mm.hidden=!open;}
    if(burger&&mm){
    burger.addEventListener('click',function(){setMenu(mm.hidden);});
    mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mm.hidden){setMenu(false);burger.focus();}});
    window.addEventListener('resize',function(){if(window.innerWidth>940&&!mm.hidden)setMenu(false);});
    }
    /* Pestaña resaltada según la sección que se está viendo */
    var tabs=[].slice.call(document.querySelectorAll('.nav > ul a')),tabBase=document.querySelector('.nav > ul a[aria-current="page"]');
    var tabSec=tabs.map(function(a){var h=a.getAttribute('href')||'';return h.charAt(0)==='#'?{a:a,s:document.querySelector(h)}:null;}).filter(function(x){return x&&x.s;});
    if(tabSec.length){
      var marcaTab=function(){
        var act=tabBase;
        tabSec.forEach(function(x){var r=x.s.getBoundingClientRect();var y=window.innerHeight*.45;if(r.top<=y&&r.bottom>y)act=x.a;});
        tabs.forEach(function(a){if(a===act){if(a!==tabBase)a.setAttribute('aria-current','true');}else if(a!==tabBase||act!==tabBase){a.removeAttribute('aria-current');}});
        if(act===tabBase&&tabBase)tabBase.setAttribute('aria-current','page');
      };
      window.addEventListener('scroll',marcaTab,{passive:true});marcaTab();
    }

    /* El botón flotante de WhatsApp se esconde en Contacto para no tapar el formulario */
    var flo=document.querySelector('.wa-float'),contacto=document.getElementById('contacto');
    var enContacto=false,videoSonando=false;
    function syncFlo(){flo.classList.toggle('away',enContacto||videoSonando);}
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){es.forEach(function(en){enContacto=en.isIntersecting;syncFlo();});},{threshold:0.05}).observe(contacto);
    }

    /* ===== Videos: botón de reproducir y uno a la vez ===== */
    var vids=[].slice.call(document.querySelectorAll('.vid video'));
    document.querySelectorAll('.vid').forEach(function(fig){
      var v=fig.querySelector('video'),b=fig.querySelector('.play');
      b.addEventListener('click',function(){v.controls=true;fig.classList.add('playing');var p=v.play();if(p&&p.catch)p.catch(function(){});});
      v.addEventListener('play',function(){v.controls=true;fig.classList.add('playing');vids.forEach(function(o){if(o!==v&&!o.paused)o.pause();});});
      v.addEventListener('ended',function(){v.controls=false;v.currentTime=0;fig.classList.remove('playing');});
      v.addEventListener('playing',function(){videoSonando=true;syncFlo();});
      ['pause','ended'].forEach(function(ev){v.addEventListener(ev,function(){videoSonando=vids.some(function(o){return !o.paused&&!o.ended;});syncFlo();});});
    });

    /* ===== Contacto ===== */
    var waBase='https://wa.me/'+CONTACTO.whatsapp;
    var saludo='Hola, quiero conocer más sobre Univia Tech y agendar una demo.';
    document.querySelectorAll('.js-wa').forEach(function(a){a.href=waBase+'?text='+encodeURIComponent(saludo);});
    document.getElementById('wa-val').textContent=CONTACTO.whatsappVisible;
    document.getElementById('mail-val').textContent=CONTACTO.correo;
    document.getElementById('mail-link').href='mailto:'+CONTACTO.correo+'?subject='+encodeURIComponent('Quiero una demo de Univia Tech');
    document.getElementById('foot-contact').textContent=CONTACTO.whatsappVisible+' · '+CONTACTO.correo;

    var toast=document.getElementById('toast'),tt;
    function aviso(t){toast.textContent=t;toast.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toast.hidden=true;},2600);}
    function copiar(txt,ok){
      function fallback(){aviso('Selecciona el texto y cópialo con Ctrl+C o Cmd+C');}
      try{navigator.clipboard.writeText(txt).then(function(){aviso(ok);},fallback);}catch(e){fallback();}
    }
    document.querySelectorAll('[data-copy]').forEach(function(b){
      b.addEventListener('click',function(){
        if(b.dataset.copy==='wa')copiar(CONTACTO.whatsappVisible,'Número copiado');
        else copiar(CONTACTO.correo,'Correo copiado');
      });
    });

    /* Formulario: arma el mensaje y abre WhatsApp o el correo */
    document.querySelectorAll('[data-bolsa]').forEach(function(b){b.addEventListener('click',function(){
      var s=document.getElementById('f-plan'),x='Horas de soporte adicionales',m=document.getElementById('f-msg');
      if(![].some.call(s.options,function(o){return o.value===x;}))s.add(new Option(x));
      s.value=x;if(!m.value.trim())m.value='Me interesa: '+b.dataset.bolsa+'.';
    });});
    var form=document.getElementById('lead'),via='wa',cargada=Date.now();
    var ORIGEN='';
    try{
      var qs=new URLSearchParams(location.search),utm=['utm_source','utm_medium','utm_campaign','utm_term','c','gclid'].map(function(k){return qs.get(k)?k.replace('utm_','')+'='+qs.get(k).slice(0,120):'';}).filter(Boolean).join(' · ');
      if(utm)sessionStorage.setItem('univia-origen',utm);
      if(!sessionStorage.getItem('univia-entrada'))sessionStorage.setItem('univia-entrada',location.pathname);
      var entrada=sessionStorage.getItem('univia-entrada')||'';
      ORIGEN=(location.pathname.split('/').filter(Boolean).pop()||'inicio')+(sessionStorage.getItem('univia-origen')?' · '+sessionStorage.getItem('univia-origen'):'')+(entrada&&entrada!==location.pathname?' · entrada='+entrada:'');
    }catch(e){}
    /* Modo prueba: ?prueba=1 (dura la sesión; ?prueba=0 lo quita). No abre WhatsApp ni correo y el lead llega al CRM marcado como PRUEBA. */
    var PRUEBA=false;
    try{
      var qp=new URLSearchParams(location.search).get('prueba');
      if(qp==='1')sessionStorage.setItem('univia-prueba','1');
      if(qp==='0')sessionStorage.removeItem('univia-prueba');
      PRUEBA=sessionStorage.getItem('univia-prueba')==='1';
    }catch(e){}
    if(PRUEBA){
      ORIGEN='PRUEBA · '+ORIGEN;
      var avisoPrueba=document.createElement('div');
      avisoPrueba.setAttribute('role','status');
      avisoPrueba.textContent='Modo prueba: el formulario no abre WhatsApp ni correo y el lead llega al CRM marcado como PRUEBA. Para salir: ?prueba=0';
      avisoPrueba.style.cssText='position:fixed;left:12px;bottom:12px;z-index:99;max-width:min(380px,calc(100vw - 24px));background:#a1281f;color:#fff;padding:10px 14px;border-radius:12px;font:500 .85rem/1.4 system-ui,sans-serif';
      document.body.appendChild(avisoPrueba);
    }
    form.querySelectorAll('button[type=submit]').forEach(function(b){b.addEventListener('click',function(){via=b.dataset.via;});});
    var KEY='univia-borrador';
    try{var guardado=JSON.parse(localStorage.getItem(KEY)||'{}');Object.keys(guardado).forEach(function(k){if(form.elements[k])form.elements[k].value=guardado[k];});}catch(e){}
    form.addEventListener('input',function(){
      try{var d={};['nombre','empresa','telefono','correo','ciudad','plan','mensaje'].forEach(function(k){d[k]=form.elements[k].value;});localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}
    });

    function validar(){
      var ok=true;
      function marca(id,msg){var f=document.getElementById(id).closest('.field');f.classList.toggle('bad',!!msg);f.querySelector('.err').textContent=msg||'';if(msg)ok=false;}
      var v=function(id){return document.getElementById(id).value.trim();};
      marca('f-nombre',v('f-nombre')?'':'Escribe tu nombre');
      marca('f-empresa',v('f-empresa')?'':'Escribe el nombre de tu empresa');
      var tel=v('f-tel').replace(/[\s\-()]/g,'');
      marca('f-tel',/^\+?\d{9,13}$/.test(tel)?'':'Escribe un número de 9 a 13 dígitos');
      marca('f-correo',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('f-correo'))?'':'Revisa el correo: falta la @ o el dominio');
      marca('f-consent',document.getElementById('f-consent').checked?'':'Necesitamos tu autorización para poder atenderte');
      return ok;
    }
    // CTO-06: si el ERP rechaza la cita (el horario se ocupó entre que lo eligió y envió), el lead se reenvía sin
    // reserva para no perderlo, se avisa y el calendario vuelve a pedir horarios.
    var ultimoLead=null;
    document.addEventListener('univia:lead-resultado',function(e){
      var r=e.detail||{},d=ultimoLead,txt=document.getElementById('result-text');
      if(!d||!d.cita)return;
      if(r.ok){if(PRUEBA)txt.textContent+=' Horario reservado en el ERP.';return;}
      if(!/horario/i.test(r.error||''))return;
      var sinCita={};for(var k in d)sinCita[k]=d[k];sinCita.cita='';ultimoLead=null;
      if(window.UniviaLeads)window.UniviaLeads.enviar(sinCita);
      txt.textContent='Ese horario se acaba de ocupar. Guardamos tu solicitud y te contactamos para coordinar otra hora.';
      if(window.__agenda&&window.__agenda.recargar)window.__agenda.recargar();
    });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!validar()){var bad=form.querySelector('.bad input, .bad select');if(bad)bad.focus();return;}
      if(form.elements.sitio_web.value||Date.now()-cargada<3000){document.getElementById('result-text').textContent='Recibimos tu solicitud.';document.getElementById('result').hidden=false;return;}
      var g=function(k){return form.elements[k].value.trim();};
      var cita=window.__agenda?window.__agenda.valor():null;
      var lineas=['Hola, quiero agendar una demo de Univia Tech.','',(cita&&cita.reserva?'Demo reservada en el calendario: ':'Fecha que prefiero: ')+(cita?cita.texto:'Quiero coordinarla con ustedes'),'Nombre: '+g('nombre'),'Empresa: '+g('empresa'),'Celular: '+g('telefono'),'Correo: '+g('correo')];
      if(g('ciudad'))lineas.push('Ciudad: '+g('ciudad'));
      lineas.push('Plan de interés: '+g('plan'));
      if(g('mensaje'))lineas.push('','Lo que quiero resolver: '+g('mensaje'));
      var msg=lineas.join('\n');
      var url=via==='wa'
        ? waBase+'?text='+encodeURIComponent(msg)
        : 'mailto:'+CONTACTO.correo+'?subject='+encodeURIComponent('Demo Univia Tech · '+g('empresa'))+'&body='+encodeURIComponent(msg);
      var res=document.getElementById('result');
      document.getElementById('result-text').textContent= via==='wa'
        ? 'Abrimos WhatsApp con tu mensaje listo. Solo falta que lo envíes desde ahí. Si no se abrió, copia el mensaje y escríbenos al '+CONTACTO.whatsappVisible+'.'
        : 'Abrimos tu correo con el mensaje listo. Solo falta que lo envíes. Si no se abrió, copia el mensaje y escríbenos a '+CONTACTO.correo+'.';
      if(PRUEBA)document.getElementById('result-text').textContent='Modo prueba: no se abrió '+(via==='wa'?'WhatsApp':'el correo')+'. El lead se envió al CRM marcado como PRUEBA.';
      document.getElementById('result-msg').textContent=msg;
      res.hidden=false;
      // CTO-06: con horario del ERP va `cita` (se reserva); fecha_demo queda como texto para el lead.
      ultimoLead={fecha_demo:cita?cita.valor:'',cita:cita&&cita.reserva?cita.valor:'',consentimiento:new Date().toISOString(),origen:ORIGEN,via:via,plan:g('plan'),nombre:g('nombre'),empresa:g('empresa'),telefono:g('telefono'),correo:g('correo'),ciudad:g('ciudad'),mensaje:(PRUEBA?'[PRUEBA] ':'')+g('mensaje')};
      try{document.dispatchEvent(new CustomEvent('univia:lead',{detail:ultimoLead}));}catch(e){}
      if(PRUEBA){}
      else if(via==='wa'){var w=window.open(url,'_blank','noopener');if(!w){var a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();}}
      else{window.location.href=url;}
      document.getElementById('copy-msg').onclick=function(){copiar(msg,'Mensaje copiado');};
    });
  }catch(e){show(e.message);}
})();
