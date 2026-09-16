(() => {
'use strict';
if(window.__FROMAGO_V11_BRIDGE__)return;
window.__FROMAGO_V11_BRIDGE__=true;
function load(src){return new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=bad;document.head.appendChild(s)})}
(async()=>{try{await load('./secure-v11.js?v=11');await load('./locations-data-v11.js?v=11.1');await load('./locations-ui-v11.js?v=11.2');await load('./program-ui-v11.js?v=11.3')}catch(e){const app=document.getElementById('app');if(app)app.innerHTML='<div class="empty">No se pudo cargar la versión actual. Comprueba la conexión y vuelve a abrir la aplicación.</div>'}})();
})();
