(() => {
'use strict';
if (window.__FROMAGO_V9_BOOTSTRAP__) return;
window.__FROMAGO_V9_BOOTSTRAP__=true;
const app=document.getElementById('app');
if(app) app.style.visibility='hidden';
const reveal=()=>{if(app)app.style.visibility=''};
const observer=new MutationObserver(()=>{
  if(document.querySelector('.securebar')){
    observer.disconnect();
    reveal();
  }
});
if(app) observer.observe(app,{childList:true,subtree:true});
const s=document.createElement('script');
s.src='./secure-v9.js?v=9';
s.async=false;
s.onerror=()=>{observer.disconnect();reveal();};
document.head.appendChild(s);
setTimeout(()=>{observer.disconnect();reveal();},4000);
})();
