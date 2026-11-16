/* Menú y utilidades de los artículos del blog. Fuente principal: este repositorio (antes: artefactos de claude.ai). */
(function(){
  try{

    var burger=document.getElementById('burger'),mm=document.getElementById('mobile-menu');
    function setMenu(o){burger.setAttribute('aria-expanded',String(o));burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');mm.hidden=!o;}
    burger.addEventListener('click',function(){setMenu(mm.hidden);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mm.hidden)setMenu(false);});

    /* Índice automático a partir de los H2 */
    var prose=document.getElementById('prose'),hs=[].slice.call(prose.querySelectorAll('h2[id]'));
    var toc=document.getElementById('toc'),tocm=document.getElementById('toc-m'),links=[];
    hs.forEach(function(h){
      [toc,tocm].forEach(function(list,i){
        var li=document.createElement('li'),a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;li.appendChild(a);list.appendChild(li);if(i===0)links.push(a);
      });
    });
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id);});}});},{rootMargin:'-20% 0px -70% 0px'});
      hs.forEach(function(h){io.observe(h);});
    }

    /* Tiempo de lectura: 200 palabras por minuto */
    var words=(prose.innerText||'').trim().split(/\s+/).length;
    document.getElementById('rt').textContent=Math.max(1,Math.round(words/200))+' min de lectura';

    /* Compartir */
    var url=(document.querySelector('link[rel=canonical]')||{}).href||location.href;
    var title=document.querySelector('h1').textContent;
    document.getElementById('sh-wa').href='https://wa.me/?text='+encodeURIComponent(title+' '+url);
    document.getElementById('sh-li').href='https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url);
    var toast=document.getElementById('toast'),tt;
    function aviso(t){toast.textContent=t;toast.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toast.hidden=true;},2400);}
    document.getElementById('sh-copy').addEventListener('click',function(){
      try{navigator.clipboard.writeText(url).then(function(){aviso('Enlace copiado');},function(){aviso('Copia el enlace desde la barra de direcciones');});}catch(e){aviso('Copia el enlace desde la barra de direcciones');}
    });
  }catch(e){var d=document.createElement('div');d.textContent='Algo falló en el artículo: '+e.message;d.style.cssText='position:fixed;left:16px;right:16px;bottom:16px;background:#a1281f;color:#fff;padding:14px;border-radius:12px;z-index:99';document.body.appendChild(d);}
})();
