(() => {
'use strict';
if(window.__FROMAGO_PROGRAM_UI_V11__)return;
window.__FROMAGO_PROGRAM_UI_V11__=true;

const FILTER_KEY='fromago-v11-program-pref-filter';
let programPrefFilter=localStorage.getItem(FILTER_KEY)||'all';
if(!['all','want','maybe','match'].includes(programPrefFilter))programPrefFilter='all';

const style=document.createElement('style');
style.textContent=`
.programassist{margin-top:8px;border-top:1px solid var(--line);padding-top:7px}.programlegend{display:flex;gap:7px;align-items:center;overflow:auto;scrollbar-width:none;font-size:10px;color:var(--muted);white-space:nowrap}.programlegend::-webkit-scrollbar,.programfilterrow::-webkit-scrollbar{display:none}.legenditem{display:inline-flex;align-items:center;gap:3px}.legenditem b{color:var(--ink)}.programfilterrow{display:flex;gap:6px;overflow:auto;margin-top:6px;scrollbar-width:none}.pfchip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 8px;font-size:10px;font-weight:800;white-space:nowrap}.pfchip.active{background:var(--ink);color:#fff;border-color:var(--ink)}.pfchip.utility{background:var(--soft);border-color:#efd46b}.pfchip.clear{background:#fff;color:var(--danger);border-color:#f2c6c1}.undobar{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:10020;width:min(520px,calc(100% - 24px));background:#171717;color:#fff;border-radius:13px;padding:9px 10px;display:flex;align-items:center;gap:10px;box-shadow:0 10px 34px #0004;font-size:11px}.undobar span{flex:1}.undobar button{border:0;background:var(--cheese);border-radius:999px;padding:6px 9px;font-weight:900;font-size:10px}.conflictback,.spacesback{position:fixed;inset:0;background:rgba(10,10,10,.68);z-index:10030;display:flex;align-items:flex-end;justify-content:center}.conflictcard,.spacescard{width:min(620px,100%);background:#fffaf0;border-radius:20px 20px 0 0;padding:17px;max-height:84vh;overflow:auto}.conflictcard h3,.spacescard h3{margin:6px 0;font-size:17px}.conflictcard p,.spacescard p{font-size:11px;line-height:1.45;color:var(--muted)}.conflictlist{background:#fff;border:1px solid var(--line);border-radius:11px;padding:8px;margin:10px 0}.conflictitem{font-size:11px;padding:5px 0;border-top:1px solid var(--line)}.conflictitem:first-child{border-top:0}.conflictactions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.conflictactions button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 8px;font-weight:850;font-size:10px}.conflictactions .primarychoice{background:var(--ink);color:#fff;border-color:var(--ink)}.conflictactions .maybechoice{background:var(--soft);border-color:#efd46b}.alsohere{margin:10px 0;border:1px solid #cbdcf5;background:var(--v11blue,#eef5ff);border-radius:12px;padding:10px}.alsohere h4{margin:0 0 6px;font-size:11px}.alsoitem{display:grid;grid-template-columns:46px 1fr auto;gap:7px;align-items:center;padding:6px 0;border-top:1px solid #dce7f7}.alsoitem:first-of-type{border-top:0}.alsoitem time{font-size:10px;font-weight:900}.alsoitem span{font-size:10px;line-height:1.25}.alsoitem button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:5px 7px;font-size:9px;font-weight:850}.spacessection{margin-top:12px}.spacessection h4{margin:0 0 6px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}.spacerow{display:flex;gap:8px;align-items:center;border-top:1px solid var(--line);padding:8px 0}.spacerow:first-child{border-top:0}.spacerow span{flex:1;font-size:11px;font-weight:750}.spacerow button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 8px;font-size:9px;font-weight:850;white-space:nowrap}.closex{float:right;border:1px solid var(--line);background:#fff;border-radius:999px;width:32px;height:32px;font-weight:900}
`;
document.head.appendChild(style);

function roomId(){return new URL(location.href).searchParams.get('room')}
function roomCache(){const r=roomId();if(!r)return null;try{return JSON.parse(localStorage.getItem(`fromago-v11-cache:${r}`)||'null')}catch(e){return null}}
function prefMap(data=roomCache()){const m=new Map();if(Array.isArray(data?.my_preferences))for(const p of data.my_preferences)m.set(+p.id,p.level);else if(Array.isArray(data?.my_selections))for(const id of data.my_selections)m.set(+id,'want');return m}
function matchMap(data=roomCache()){return data?.matches||{}}
function levelOf(id,data=roomCache()){return prefMap(data).get(+id)||null}
function matchesOf(id,data=roomCache()){return matchMap(data)[String(id)]||[]}
function esc2(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

const baseFiltered=filtered;
filtered=function(){
 const arr=baseFiltered();
 if(programPrefFilter==='all')return arr;
 const data=roomCache(),pm=prefMap(data),mm=matchMap(data);
 if(programPrefFilter==='want')return arr.filter(a=>pm.get(a.id)==='want');
 if(programPrefFilter==='maybe')return arr.filter(a=>pm.get(a.id)==='maybe');
 if(programPrefFilter==='match')return arr.filter(a=>(mm[String(a.id)]||[]).length>0);
 return arr;
};

function activeOtherFilters(){
 const catAll=document.querySelector('#catchips .chip');
 return state.day!=='Todos'||!!state.query||!!state.regOnly||!!state.loc||programPrefFilter!=='all'||!!(catAll&&!catAll.classList.contains('active'));
}
function counts(){const data=roomCache(),pm=prefMap(data),mm=matchMap(data);let want=0,maybe=0,match=0;for(const [id,l] of pm){if(l==='want')want++;else if(l==='maybe')maybe++;if((mm[String(id)]||[]).length)match++}return{want,maybe,match}}
function injectProgramAssist(){
 const host=document.getElementById('programFilters');if(!host)return;
 let box=document.getElementById('programassist');if(!box){box=document.createElement('div');box.id='programassist';box.className='programassist';host.appendChild(box)}
 const c=counts();
 box.innerHTML=`<div class="programlegend"><span class="legenditem"><b>♥ Quiero ir</b> ${c.want}</span><span>·</span><span class="legenditem"><b>☆ Me interesa</b> ${c.maybe}</span><span>·</span><span class="legenditem"><b>👥 Coincidencia</b> ${c.match}</span></div><div class="programfilterrow"><button class="pfchip ${programPrefFilter==='all'?'active':''}" onclick="setProgramPrefFilter('all')">Todas</button><button class="pfchip ${programPrefFilter==='want'?'active':''}" onclick="setProgramPrefFilter('want')">♥ Quiero ir</button><button class="pfchip ${programPrefFilter==='maybe'?'active':''}" onclick="setProgramPrefFilter('maybe')">☆ Me interesa</button><button class="pfchip ${programPrefFilter==='match'?'active':''}" onclick="setProgramPrefFilter('match')">👥 Coincidencias</button><button class="pfchip utility" onclick="openFromagoSpaces()">📍 Espacios</button>${activeOtherFilters()?'<button class="pfchip clear" onclick="clearProgramFilters()">Limpiar filtros</button>':''}</div>`;
}
window.setProgramPrefFilter=function(v){programPrefFilter=v;localStorage.setItem(FILTER_KEY,v);renderProgram()};
window.clearProgramFilters=function(){
 programPrefFilter='all';localStorage.setItem(FILTER_KEY,'all');state.day='Todos';state.query='';state.regOnly=false;state.loc='';save();
 if(typeof toggleCategory==='function')toggleCategory('Todo');else{setupFilters();renderProgram()}
};
const baseRenderProgram=renderProgram;
renderProgram=function(){baseRenderProgram();injectProgramAssist()};
setTimeout(()=>{if(state.view==='program')injectProgramAssist()},0);

let undoTimer=null;
function showUndo(label,snapshot){
 document.getElementById('undobar')?.remove();if(undoTimer)clearTimeout(undoTimer);
 const bar=document.createElement('div');bar.id='undobar';bar.className='undobar';bar.innerHTML=`<span>${esc2(label)}</span><button>DESHACER</button>`;document.body.appendChild(bar);
 bar.querySelector('button').addEventListener('click',async()=>{bar.remove();if(undoTimer)clearTimeout(undoTimer);await restoreSnapshot(snapshot);if(typeof toast==='function')toast('Cambio deshecho')});
 undoTimer=setTimeout(()=>bar.remove(),5500);
}
const originalSetInterest=window.setInterest;
async function restoreSnapshot(snapshot){
 for(const [id,wanted] of snapshot.entries()){
  const cur=levelOf(id);if(cur===wanted)continue;
  if(wanted==null){if(cur)await originalSetInterest(id,cur)}else await originalSetInterest(id,wanted);
 }
}
function snapshot(ids){const d=roomCache(),m=new Map();for(const id of ids)m.set(+id,levelOf(id,d));return m}
function hardConflicts(a){
 const d=roomCache(),pm=prefMap(d),out=[];if(!a||a.time==='Todo el día')return out;const sa=mins(a.time);if(sa==null)return out;
 for(const b of ACTIVITIES){if(b.id===a.id||b.day!==a.day||b.time==='Todo el día'||pm.get(b.id)!=='want')continue;const sb=mins(b.time);if(sb==null)continue;let hard=sa===sb;if(!hard&&sa<sb&&a.end){const ea=mins(a.end);hard=ea!=null&&sb<ea}if(!hard&&sb<sa&&b.end){const eb=mins(b.end);hard=eb!=null&&sa<eb}if(hard)out.push(b)}
 return out.sort(sortActs);
}
function conflictChoice(a,conflicts){return new Promise(resolve=>{
 const back=document.createElement('div');back.className='conflictback';back.innerHTML=`<div class="conflictcard"><button class="closex" data-choice="cancel">×</button><span class="badge">CONFLICTO DE HORARIO</span><h3>${esc2(a.title)}</h3><p>Ya tienes marcada como ♥ otra actividad que se solapa. Tú decides cómo dejar el plan.</p><div class="conflictlist">${conflicts.map(x=>`<div class="conflictitem"><b>${esc2(x.time)}</b> · ${esc2(x.title)}</div>`).join('')}</div><div class="conflictactions"><button class="primarychoice" data-choice="keep">Mantener ambas</button><button data-choice="replace">Cambiar por esta</button><button class="maybechoice" data-choice="maybe">Marcar como ☆</button><button data-choice="cancel">Cancelar</button></div></div>`;document.body.appendChild(back);
 const done=v=>{back.remove();resolve(v)};back.addEventListener('click',e=>{if(e.target===back)done('cancel');const b=e.target.closest('[data-choice]');if(b)done(b.dataset.choice)});
 })}
window.setInterest=async function(id,level){
 const a=ACTIVITIES.find(x=>x.id===+id);if(!a)return originalSetInterest(id,level);
 const before=levelOf(id);
 if(level==='want'&&before!=='want'){
  const conflicts=hardConflicts(a);
  if(conflicts.length){
   const choice=await conflictChoice(a,conflicts);if(choice==='cancel')return;
   if(choice==='maybe'){
    const snap=snapshot([id]);await originalSetInterest(id,'maybe');showUndo('Marcada como ☆ Me interesa',snap);return;
   }
   if(choice==='keep'){
    const snap=snapshot([id]);await originalSetInterest(id,'want');showUndo('Añadida a ♥ Quiero ir',snap);return;
   }
   if(choice==='replace'){
    const ids=[id,...conflicts.map(x=>x.id)],snap=snapshot(ids);
    for(const x of conflicts)if(levelOf(x.id)==='want')await originalSetInterest(x.id,'want');
    if(levelOf(id)!=='want')await originalSetInterest(id,'want');
    showUndo(`Has cambiado ${conflicts.length===1?'1 actividad':conflicts.length+' actividades'} por esta`,snap);return;
   }
  }
 }
 const snap=snapshot([id]);await originalSetInterest(id,level);const after=levelOf(id);
 const label=after==='want'?'Añadida a ♥ Quiero ir':after==='maybe'?'Marcada como ☆ Me interesa':'Actividad desmarcada';showUndo(label,snap);
};

function samePointActivities(a){
 const geo=window.FROMAGO_GEO,p=geo?.pointFor?.(a);if(!p||a.time==='Todo el día')return[];const start=mins(a.time);if(start==null)return[];
 return ACTIVITIES.filter(x=>x.id!==a.id&&x.day===a.day&&x.time!=='Todo el día'&&mins(x.time)>start).filter(x=>{const q=geo.pointFor(x);return q&&q.lat===p.lat&&q.lng===p.lng}).sort(sortActs).slice(0,3);
}
window.openNearbyActivity=function(id){document.getElementById('detailOverlay')?.remove();window.openActivity(+id)};
function addAlsoHere(id){const a=ACTIVITIES.find(x=>x.id===+id),card=document.querySelector('#detailOverlay .detailcard');if(!a||!card||card.querySelector('.alsohere'))return;const next=samePointActivities(a);if(!next.length)return;const box=document.createElement('div');box.className='alsohere';box.innerHTML=`<h4>También aquí, después</h4>${next.map(x=>`<div class="alsoitem"><time>${esc2(x.time)}</time><span>${esc2(x.title)}</span><button onclick="openNearbyActivity(${x.id})">Ver</button></div>`).join('')}`;const actions=card.querySelector('.detailactions');actions?.before(box)}
const baseOpenActivity=window.openActivity;
window.openActivity=function(id){baseOpenActivity(id);setTimeout(()=>addAlsoHere(id),10)};

function coordUrl(lat,lng){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`}
window.openFromagoCoord=function(lat,lng){window.location.assign(coordUrl(lat,lng))};
function physicalSpaces(){
 const pts=window.FROMAGO_GEO_DATA?.points||{},map=new Map();for(const p of Object.values(pts)){const k=`${p.lat},${p.lng}`;if(!map.has(k))map.set(k,{lat:p.lat,lng:p.lng,names:[]});const row=map.get(k);if(!row.names.includes(p.name))row.names.push(p.name)}return [...map.values()].sort((a,b)=>a.names[0].localeCompare(b.names[0],'es'));
}
window.openFromagoSpaces=function(){
 const data=window.FROMAGO_GEO_DATA;if(!data)return;document.querySelector('.spacesback')?.remove();const back=document.createElement('div');back.className='spacesback';const spaces=physicalSpaces();back.innerHTML=`<div class="spacescard"><button class="closex" onclick="document.querySelector('.spacesback').remove()">×</button><span class="badge">FROMAGO 2026</span><h3>Espacios</h3><p>Puntos de llegada validados para el plan. Los nombres que comparten coordenadas aparecen juntos.</p><div class="spacessection"><h4>Espacios del programa</h4>${spaces.map(p=>`<div class="spacerow"><span>${p.names.map(esc2).join(' · ')}</span><button onclick="openFromagoCoord(${p.lat},${p.lng})">Mapa</button></div>`).join('')}</div><div class="spacessection"><h4>Galerías del queso</h4>${data.galleries.map((p,i)=>`<div class="spacerow"><span>${esc2(p.name)}</span><button onclick="openGeoGallery(${i})">Mapa</button></div>`).join('')}</div></div>`;back.addEventListener('click',e=>{if(e.target===back)back.remove()});document.body.appendChild(back)
};

})();
