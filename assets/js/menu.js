/* Menú de celular (botón hamburguesa) para páginas sin otro script propio, como la política de datos. */
(function(){
  var burger=document.getElementById('burger'),mm=document.getElementById('mobile-menu');
  if(!burger||!mm)return;
  function setMenu(o){burger.setAttribute('aria-expanded',String(o));burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');mm.hidden=!o;}
  burger.addEventListener('click',function(){setMenu(mm.hidden);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mm.hidden)setMenu(false);});
})();
