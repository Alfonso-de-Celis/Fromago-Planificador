(() => {
'use strict';
if(window.__FROMAGO_V11_BRIDGE__)return;
window.__FROMAGO_V11_BRIDGE__=true;
const s=document.createElement('script');
s.src='./secure-v11.js?v=11';
s.async=false;
s.onerror=()=>{const app=document.getElementById('app');if(app)app.innerHTML='<div class="empty">No se pudo cargar la versión actual. Comprueba la conexión y vuelve a abrir la aplicación.</div>'};
document.head.appendChild(s);
})();
