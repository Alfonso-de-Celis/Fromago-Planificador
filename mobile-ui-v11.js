(() => {
'use strict';
if(window.__FROMAGO_MOBILE_UI_V11__)return;
window.__FROMAGO_MOBILE_UI_V11__=true;

const SPACE_KEY='fromago-v11-space-filter';
let selectedSpace=null;
try{selectedSpace=JSON.parse(localStorage.getItem(SPACE_KEY)||'null')}catch(e){selectedSpace=null}


function groupClass(group=''){
 return ({
  'Catas y degustaciones':'cat-catas',
  'Espectáculos':'cat-espectaculos',
  'Infantil':'cat-infantil',
  'Talleres':'cat-talleres',
  'Profesional':'cat-profesional',
  'Concursos y premios':'cat-concursos',
  'Actos oficiales':'cat-actos',
  'Otros':'cat-otros'
 })[group]||'';
}

const style=document.createElement('style');
style.textContent=`
html,body{max-width:100%;overflow-x:hidden}.wrap,.hero,.toolbar,.scrollchips,.subrow,.card,.sectiontitle{min-width:0}.programfilterrow{display:none!important}.subrow .toggle,.subrow .select{display:none!important}.subrow{margin-top:8px;width:100%}.spacefilterbtn{width:100%;border:1px solid var(--line);background:#fff;border-radius:11px;padding:9px 11px;font-size:11px;font-weight:850;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--ink)}.spacefilterbtn.active{border-color:#d8ae27;background:var(--soft)}.spacefilterbtn small{font-size:9px;color:var(--muted);font-weight:750;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.spacefilterbtn b{white-space:nowrap}.spacefilterback{position:fixed;inset:0;background:rgba(10,10,10,.68);z-index:10050;display:flex;align-items:flex-end;justify-content:center}.spacefiltercard{width:min(620px,100%);max-height:86vh;overflow:auto;background:#fffaf0;border-radius:20px 20px 0 0;padding:16px}.spacefiltercard h3{font-size:17px;margin:6px 0 2px}.spacefiltercard>p{font-size:11px;color:var(--muted);line-height:1.4;margin:4px 0 10px}.sfrow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}.sfrow:first-of-type{border-top:0}.sfrow.active{background:var(--soft);margin:0 -8px;padding-left:8px;padding-right:8px;border-radius:9px}.sfname{min-width:0;font-size:11px;font-weight:800;line-height:1.25}.sfname small{display:block;color:var(--muted);font-size:9px;font-weight:650;margin-top:2px}.sfbtn{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 7px;font-size:9px;font-weight:850;white-space:nowrap}.sfbtn.filter{background:var(--ink);color:#fff;border-color:var(--ink)}.sfclear{width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px;font-weight:850;font-size:10px;margin:4px 0 8px}.closexmobile{float:right;border:1px solid var(--line);background:#fff;border-radius:999px;width:32px;height:32px;font-weight:900}
.cat-catas{--cat:#87670f;--cat-bg:#fff4cf;--cat-line:#e5cb76}.cat-espectaculos{--cat:#70558d;--cat-bg:#f3edf8;--cat-line:#d8c8e5}.cat-infantil{--cat:#247b86;--cat-bg:#eaf6f7;--cat-line:#b9dde1}.cat-talleres{--cat:#447555;--cat-bg:#edf7f0;--cat-line:#bfd9c8}.cat-profesional{--cat:#596575;--cat-bg:#f0f3f6;--cat-line:#cbd2da}.cat-concursos{--cat:#9a5d2d;--cat-bg:#fff0e5;--cat-line:#e5c4ab}.cat-actos{--cat:#854b5d;--cat-bg:#f9edf1;--cat-line:#debfca}.cat-otros{--cat:#6d685f;--cat-bg:#f3f0ea;--cat-line:#d6d0c5}
#catchips .chip[class*="cat-"]{color:var(--cat);border-color:var(--cat-line);background:#fff}#catchips .chip[class*="cat-"].active{background:var(--cat-bg);border-color:var(--cat);color:var(--cat)}
.card[class*="cat-"]{box-shadow:inset 3px 0 0 var(--cat),0 3px 12px rgba(50,40,20,.035)}.card[class*="cat-"] .badge{background:var(--cat-bg);color:var(--cat);border-color:var(--cat-line)}
@media(max-width:600px){
 html,body{height:100%;max-height:100%;overflow:hidden!important;overscroll-behavior:none}body{height:100dvh;padding-bottom:0!important}header{position:relative!important;top:auto!important}#app{height:calc(100dvh - var(--fromago-header-h,0px) - var(--fromago-nav-h,0px));max-height:calc(100dvh - var(--fromago-header-h,0px) - var(--fromago-nav-h,0px));overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:none;-webkit-overflow-scrolling:touch;padding-bottom:12px}.bottomnav{position:fixed!important;bottom:0!important}
 .wrap{width:100%;max-width:100%;padding-left:10px;padding-right:10px}
 .hero{display:grid;grid-template-columns:44px minmax(0,1fr) auto;column-gap:9px;row-gap:5px;align-items:center;padding:10px 0 8px}
 .logo{grid-column:1;grid-row:1/3;width:44px;height:44px;border-radius:14px}.logo span{font-size:24px}
 .hero>div:nth-child(2){grid-column:2;grid-row:1/3;min-width:0}.hero h1{font-size:18px!important;line-height:1.05;overflow-wrap:normal}.hero p{font-size:10.5px;line-height:1.2;margin-top:3px}
 #countpill{grid-column:3;grid-row:1;margin:0!important;padding:6px 8px;font-size:10px;justify-self:end}
 #healthpill{grid-column:3;grid-row:2;margin:0;justify-self:end;font-size:8.5px;padding:4px 6px;max-width:105px;overflow:hidden;text-overflow:ellipsis}
 .toolbar{padding:8px 0 9px}.search{padding:11px 12px;font-size:16px;border-radius:12px}
 #daychips{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;overflow:visible;padding:8px 0 1px;width:100%}
 #daychips .chip{width:100%;min-width:0;padding:7px 2px;font-size:10.5px;text-align:center}
 #catchips{display:flex;width:100%;max-width:calc(100vw - 20px);gap:6px;overflow-x:auto;overflow-y:hidden;padding:8px 0 1px;overscroll-behavior-x:contain}
 #catchips .chip{flex:0 0 auto;padding:7px 9px;font-size:10.5px}
 .programassist{margin-top:7px;padding-top:6px}.programlegend{font-size:9.5px;gap:5px;max-width:100%;overflow-x:auto}
 .notice{margin:10px 0;padding:9px 10px;font-size:10.5px}
 .sectiontitle{margin:14px 2px 6px}.sectiontitle h2{font-size:17px}.sectiontitle span{font-size:10.5px}.slot{margin:14px 4px 6px;font-size:12px}
 .card{width:100%;max-width:100%;padding:11px;border-radius:14px;margin:7px 0}.card.allDay[class*="cat-"]{border-left-width:1px}.title{font-size:15px;line-height:1.2;margin:7px 0 6px}.meta,.details{font-size:11px;overflow-wrap:anywhere}.badge{font-size:9px;padding:4px 6px}.time{font-size:12px}.actions{margin-top:9px}
 .prefbtn{width:32px;height:32px;flex-basis:32px;font-size:18px}
 .bottomnav{padding-left:7px;padding-right:7px}.navbtn{padding:7px 3px;font-size:10.5px}.navbtn b{font-size:18px}
 .sfrow{grid-template-columns:minmax(0,1fr) auto auto}.sfbtn{padding:6px;font-size:8.5px}
}
@media(max-width:360px){
 .hero{grid-template-columns:40px minmax(0,1fr) auto;column-gap:7px}.logo{width:40px;height:40px}.hero h1{font-size:16.5px!important}#countpill{font-size:9px;padding:5px 6px}#healthpill{font-size:8px;padding:3px 5px}.hero p{font-size:9.5px}
 #daychips .chip{font-size:9.5px}.programlegend{font-size:9px}
}
`;
document.head.appendChild(style);

const baseCardMobile=card;
card=function(a,extra=''){
 const cls=groupClass(a.group),html=baseCardMobile(a,extra);
 return cls?html.replace('class="card','class="card '+cls):html;
};
const baseSetupFiltersMobile=setupFilters;
setupFilters=function(){
 baseSetupFiltersMobile();
 document.querySelectorAll('#catchips .chip').forEach(btn=>{const cls=groupClass(btn.textContent.trim());if(cls)btn.classList.add(cls)});
};

function syncViewportMetrics(){
 if(!window.matchMedia('(max-width:600px)').matches)return;
 const head=document.querySelector('header'),nav=document.querySelector('.bottomnav');
 const hh=Math.ceil(head?.getBoundingClientRect().height||0),nh=Math.ceil(nav?.getBoundingClientRect().height||0);
 document.documentElement.style.setProperty('--fromago-header-h',hh+'px');
 document.documentElement.style.setProperty('--fromago-nav-h',nh+'px');
}
try{const ro=new ResizeObserver(syncViewportMetrics);const h=document.querySelector('header'),n=document.querySelector('.bottomnav');if(h)ro.observe(h);if(n)ro.observe(n)}catch(e){}
window.addEventListener('resize',syncViewportMetrics);window.visualViewport?.addEventListener('resize',syncViewportMetrics);

function sameCoord(a,b){return !!a&&!!b&&Math.abs(+a.lat-(+b.lat))<1e-7&&Math.abs(+a.lng-(+b.lng))<1e-7}
function pointForActivity(a){return window.FROMAGO_GEO?.pointFor?.(a)||null}
function isGalleryActivity(a){return window.FROMAGO_GEO?.codeFor?.(a)==='L23'}
function galleryAtSelected(){return (window.FROMAGO_GEO_DATA?.galleries||[]).some(g=>sameCoord(g,selectedSpace))}

const baseFiltered=window.filtered;
if(typeof baseFiltered==='function')window.filtered=function(){
 const arr=baseFiltered();if(!selectedSpace)return arr;
 return arr.filter(a=>{
  const p=pointForActivity(a);if(p&&sameCoord(p,selectedSpace))return true;
  return isGalleryActivity(a)&&galleryAtSelected();
 });
};

function buildSpaces(){
 const data=window.FROMAGO_GEO_DATA;if(!data)return[];const map=new Map();
 const add=(p,label,kind='program')=>{const k=`${p.lat.toFixed(7)},${p.lng.toFixed(7)}`;if(!map.has(k))map.set(k,{lat:p.lat,lng:p.lng,names:[],kinds:new Set()});const row=map.get(k);if(label&&!row.names.includes(label))row.names.push(label);row.kinds.add(kind)};
 for(const p of Object.values(data.points||{}))add(p,p.name,'program');
 for(const p of data.galleries||[])add(p,p.name,'gallery');
 return [...map.values()].sort((a,b)=>a.names[0].localeCompare(b.names[0],'es'));
}
function shortSpaceName(s){if(!s)return'Espacio';return s.replace(/^Escenario\s+/i,'').replace(/^Espacio\s+/i,'')}
function currentSpaceLabel(){
 if(!selectedSpace)return'';const row=buildSpaces().find(x=>sameCoord(x,selectedSpace));return row?shortSpaceName(row.names[0]):(selectedSpace.name||'Espacio');
}
function ensureSpaceButton(){
 const sub=document.querySelector('#programFilters .subrow');if(!sub)return;
 let btn=document.getElementById('spacefilterbtn');if(!btn){btn=document.createElement('button');btn.type='button';btn.id='spacefilterbtn';btn.className='spacefilterbtn';btn.onclick=()=>openFromagoSpaces();sub.appendChild(btn)}
 const label=currentSpaceLabel();btn.classList.toggle('active',!!selectedSpace);btn.innerHTML=selectedSpace?`<b>📍 Espacios</b><small>${escapeHtml(label)}</small>`:'<b>📍 Espacios</b><small>Filtrar actividades o abrir mapa</small>';
}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function mapHere(lat,lng){if(typeof window.openFromagoCoord==='function')window.openFromagoCoord(lat,lng);else window.location.assign(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`)}
window.setFromagoSpaceFilter=function(lat,lng,name=''){
 selectedSpace={lat:+lat,lng:+lng,name};localStorage.setItem(SPACE_KEY,JSON.stringify(selectedSpace));document.querySelector('.spacefilterback')?.remove();ensureSpaceButton();window.renderProgram();
};
window.clearFromagoSpaceFilter=function(){selectedSpace=null;localStorage.removeItem(SPACE_KEY);document.querySelector('.spacefilterback')?.remove();ensureSpaceButton();window.renderProgram()};
window.openFromagoSpaceMap=mapHere;
window.openFromagoSpaces=function(){
 document.querySelector('.spacefilterback')?.remove();const rows=buildSpaces(),back=document.createElement('div');back.className='spacefilterback';
 back.innerHTML=`<div class="spacefiltercard"><button class="closexmobile" onclick="document.querySelector('.spacefilterback').remove()">×</button><span class="badge">FROMAGO 2026</span><h3>Espacios</h3><p>Filtra el programa por zona o abre directamente su ubicación en Google Maps.</p><button class="sfclear" onclick="clearFromagoSpaceFilter()">Todas las ubicaciones</button>${rows.map(r=>{const active=selectedSpace&&sameCoord(r,selectedSpace),main=r.names[0],others=r.names.slice(1);return `<div class="sfrow ${active?'active':''}"><div class="sfname">${escapeHtml(main)}${others.length?`<small>${others.map(escapeHtml).join(' · ')}</small>`:''}</div><button class="sfbtn filter" onclick="setFromagoSpaceFilter(${r.lat},${r.lng},'${escapeHtml(main).replace(/&#039;/g,"\\'")}')">${active?'Activo':'Filtrar'}</button><button class="sfbtn" onclick="openFromagoSpaceMap(${r.lat},${r.lng})">Mapa</button></div>`}).join('')}</div>`;
 back.addEventListener('click',e=>{if(e.target===back)back.remove()});document.body.appendChild(back);
};

// Los filtros personales ya no forman parte del catalogo. Evitamos que un valor antiguo quede activo sin verse.
localStorage.setItem('fromago-v11-program-pref-filter','all');
if(typeof window.setProgramPrefFilter==='function'){
 try{window.setProgramPrefFilter('all')}catch(e){}
}
// Los controles antiguos de inscripcion y selector de espacio quedan sustituidos por el unico boton Espacios.
let reset=false;if(state.regOnly){state.regOnly=false;reset=true}if(state.loc){state.loc='';reset=true}if(reset&&typeof save==='function')save();

const baseRenderProgram=window.renderProgram;
if(typeof baseRenderProgram==='function')window.renderProgram=function(){baseRenderProgram();ensureSpaceButton();syncViewportMetrics()};
setupFilters();ensureSpaceButton();syncViewportMetrics();
if(state.view==='program')window.renderProgram();
})();
