(() => {
'use strict';
if(window.__FROMAGO_STATUS_UI_V11__)return;
window.__FROMAGO_STATUS_UI_V11__=true;

const UI_VERSION='11.4';
let updateAvailable=false;
let announcedVersion=null;

const style=document.createElement('style');
style.textContent=`
#syncpill{display:none!important}
.healthpill{font-size:9px;font-weight:850;border:1px solid var(--line);border-radius:999px;padding:4px 7px;background:#fff;white-space:nowrap;cursor:default}.healthpill.ok{color:var(--green);border-color:#b9e3d3}.healthpill.wait{color:var(--warn);border-color:#edd27e;background:var(--warnbg)}.healthpill.off{color:var(--muted);border-color:var(--line)}.healthpill.update{color:var(--danger);border-color:#f2c6c1;background:var(--dangerbg);cursor:pointer}.notice .officialchannel{font-weight:850;color:var(--ink);text-decoration:underline;text-underline-offset:2px}
`;
document.head.appendChild(style);

function originalStatus(){return document.getElementById('syncpill')}
function health(){
 let el=document.getElementById('healthpill');
 if(el)return el;
 const hero=document.querySelector('.hero');if(!hero)return null;
 el=document.createElement('span');el.id='healthpill';el.className='healthpill wait';
 const count=document.getElementById('countpill');hero.insertBefore(el,count||null);
 el.addEventListener('click',()=>{if(updateAvailable)location.reload()});
 return el;
}
function setHealth(){
 const el=health();if(!el)return;
 const src=originalStatus(),pending=!!src?.classList.contains('pending'),online=navigator.onLine;
 if(updateAvailable){el.className='healthpill update';el.textContent='⬆ Actualización disponible';el.title='Pulsa para cargar la última versión';return}
 if(!online){el.className='healthpill off';el.textContent=pending?'○ Sin conexión · cambios pendientes':'○ Sin conexión · guardado local';el.title='La app seguirá disponible con los datos ya cargados';return}
 if(pending){el.className='healthpill wait';el.textContent='↻ Conectado · cambios pendientes';el.title='Los cambios se enviarán en cuanto sea posible';return}
 if(src?.classList.contains('ok')){el.className='healthpill ok';el.textContent='✓ Al día · conectado · guardado';el.title=`Versión ${UI_VERSION} · conexión activa · cambios guardados`;return}
 el.className='healthpill wait';el.textContent='… Conectando';el.title='Comprobando conexión y sincronización';
}
function watchOriginal(){
 const src=originalStatus();if(!src){setTimeout(watchOriginal,50);return}
 new MutationObserver(setHealth).observe(src,{attributes:true,childList:true,characterData:true,subtree:true});
 setHealth();
}
window.addEventListener('online',setHealth);window.addEventListener('offline',setHealth);

function removeFalseUpdateBar(){if(!updateAvailable)document.getElementById('updatebar')?.remove()}
if('serviceWorker'in navigator){
 navigator.serviceWorker.addEventListener('message',e=>{
  if(e.data?.type!=='UPDATE_READY')return;
  announcedVersion=String(e.data.version||'');
  updateAvailable=!!announcedVersion&&announcedVersion!==UI_VERSION;
  if(!updateAvailable)setTimeout(removeFalseUpdateBar,0);
  setHealth();
 });
 navigator.serviceWorker.getRegistration?.().then(reg=>{if(reg?.waiting){updateAvailable=true;setHealth()}}).catch(()=>{});
}
const updateObserver=new MutationObserver(()=>{if(document.getElementById('updatebar')&&!updateAvailable&&announcedVersion===UI_VERSION)removeFalseUpdateBar()});
updateObserver.observe(document.documentElement,{childList:true,subtree:true});

function applyOfficialNotice(){
 const notice=document.querySelector('#app .notice');if(!notice)return;
 notice.innerHTML='Programa provisional publicado por FROMAGO. Cambios, actualizaciones y novedades se comunican a través de su <a class="officialchannel" href="https://whatsapp.com/channel/0029Vb7NK940rGiUg2g3BU2T" rel="noopener">canal oficial de WhatsApp ↗</a>.';
}
const baseRenderProgram=window.renderProgram;
if(typeof baseRenderProgram==='function')window.renderProgram=function(){baseRenderProgram();applyOfficialNotice()};
setTimeout(()=>{if(window.state?.view==='program'||document.querySelector('#app .notice'))applyOfficialNotice();watchOriginal();setHealth()},0);

window.FROMAGO_STATUS={version:UI_VERSION,refresh:setHealth};
})();
