/* Menú, búsqueda y filtros del índice del blog. Fuente principal: este repositorio (antes: artefactos de claude.ai). */
(function(){
  try{

    var burger=document.getElementById('burger'),mm=document.getElementById('mobile-menu');
    function setMenu(o){burger.setAttribute('aria-expanded',String(o));burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');mm.hidden=!o;}
    burger.addEventListener('click',function(){setMenu(mm.hidden);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mm.hidden)setMenu(false);});

    /* Buscador y categorías */
    var posts=[].slice.call(document.querySelectorAll('.post')),q=document.getElementById('q'),cat='todas';
    var chips=[].slice.call(document.querySelectorAll('#chips button'));
    var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');};
    function apply(){
      var t=norm(q.value.trim()),n=0;
      posts.forEach(function(p){
        var ok=(cat==='todas'||p.dataset.cat===cat)&&(!t||norm(p.textContent).indexOf(t)>-1);
        p.hidden=!ok; if(ok)n++;
      });
      document.getElementById('empty').hidden=n>0;
      document.getElementById('count').textContent=n===1?'1 artículo':n+' artículos';
    }
    chips.forEach(function(b){b.addEventListener('click',function(){cat=b.dataset.cat;chips.forEach(function(c){c.setAttribute('aria-pressed',String(c===b));});apply();});});
    q.addEventListener('input',apply);
    document.getElementById('reset').addEventListener('click',function(){q.value='';cat='todas';chips.forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.cat==='todas'));});apply();});
    apply();
  }catch(e){var d=document.createElement('div');d.textContent='Algo falló en el blog: '+e.message;d.style.cssText='position:fixed;left:16px;right:16px;bottom:16px;background:#a1281f;color:#fff;padding:14px;border-radius:12px;z-index:99';document.body.appendChild(d);}
})();
