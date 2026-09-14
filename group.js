(() => {
  'use strict';

  const GROUP_STORE = 'fromago-group-plan-v2';
  const oldSnapshot = { a: Array.isArray(state.a) ? state.a : [], b: Array.isArray(state.b) ? state.b : [], c: Array.isArray(state.c) ? state.c : [] };
  let importedGroup = false;
  let syncClient = null, syncChannel = null, syncStatus = 'local', room = null, roomSecret = null, syncTimer = null, applyingRemote = false;

  const extraCss = document.createElement('style');
  extraCss.textContent = `
    .peoplebox{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;margin:12px 0}.peoplehead{display:flex;align-items:center;justify-content:space-between;gap:10px}.peoplehead h2{font-size:16px;margin:0}.addperson{border:0;background:var(--cheese);border-radius:10px;padding:9px 11px;font-weight:850}.peoplelist{display:flex;flex-direction:column;gap:7px;margin-top:10px}.personrow{display:flex;align-items:center;gap:8px;border-top:1px solid var(--line);padding-top:8px}.personrow:first-child{border-top:0}.personname{font-weight:850;flex:1}.tiny{border:1px solid var(--line);background:#fff;border-radius:9px;padding:6px 8px;font-size:11px;font-weight:750}.dangerbtn{color:var(--danger)}.stats{display:flex!important;overflow:auto}.stat{min-width:100px}.notice.sync{border-left-color:var(--green);background:var(--greenbg);color:var(--green)}.notice.pending{border-left-color:var(--warn);background:var(--warnbg);color:var(--warn)}.fav{flex:0 1 auto!important;min-width:105px}.syncnote{font-size:11px;color:var(--muted);line-height:1.45;margin:8px 2px}.primary:disabled{opacity:.5}
  `;
  document.head.appendChild(extraCss);
  document.title = 'FROMAGO · Plan compartido';
  const h1 = document.querySelector('.hero h1'); if (h1) h1.textContent = 'FROMAGO · Plan compartido';

  function uid(){ return crypto.randomUUID ? crypto.randomUUID() : ('v-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)); }
  function migrate(){
    try {
      const saved = JSON.parse(localStorage.getItem(GROUP_STORE) || 'null');
      if(saved && Array.isArray(saved.visitors) && saved.selections) return saved;
    } catch(e){}
    const visitors = [];
    const selections = {};
    if(oldSnapshot.a.length){ visitors.push({id:'a',name:'Alfonso'}); selections.a=[...oldSnapshot.a]; }
    if(oldSnapshot.b.length){ visitors.push({id:'b',name:'Belén'}); selections.b=[...oldSnapshot.b]; }
    if(oldSnapshot.c.length){ visitors.push({id:'c',name:'Elena'}); selections.c=[...oldSnapshot.c]; }
    return { visitors, selections, buffer: state.buffer || 45 };
  }
  const migrated = migrate();
  state.visitors = migrated.visitors || [];
  state.selections = migrated.selections || {};
  state.buffer = migrated.buffer || state.buffer || 45;

  function cleanSharedData(x){
    if(!x || typeof x !== 'object') return null;
    const visitors = Array.isArray(x.visitors) ? x.visitors.filter(v=>v&&typeof v.id==='string'&&typeof v.name==='string').map(v=>({id:v.id,name:v.name.slice(0,40)})) : [];
    const selections = {};
    for(const v of visitors){
      const a = x.selections && Array.isArray(x.selections[v.id]) ? x.selections[v.id].filter(Number.isInteger) : [];
      selections[v.id] = [...new Set(a)].filter(id=>id>=1&&id<=221);
    }
    return {visitors,selections,buffer:[15,30,45,60,90].includes(x.buffer)?x.buffer:45};
  }
  function sharedPayload(){ return {visitors:state.visitors,selections:state.selections,buffer:state.buffer}; }
  function saveGroup(){ localStorage.setItem(GROUP_STORE, JSON.stringify(sharedPayload())); }
  function visitor(id){ return state.visitors.find(v=>v.id===id); }
  function visitorName(id){ return visitor(id)?.name || 'Visitante'; }

  personHas = function(id, actId){ return (state.selections[id]||[]).includes(actId); };
  personName = function(id){ return visitorName(id); };
  chosenPeople = function(actId){ return state.visitors.filter(v=>personHas(v.id,actId)).map(v=>v.name); };
  save = function(){ saveGroup(); if(room && !applyingRemote) scheduleSync(); };

  window.addVisitor = function(){
    let name = prompt('Nombre del visitante'); if(name==null) return; name=name.trim(); if(!name) return;
    const id=uid(); state.visitors.push({id,name:name.slice(0,40)}); state.selections[id]=[]; save(); render();
  };
  window.renameVisitor = function(id){
    const v=visitor(id); if(!v) return; let name=prompt('Nuevo nombre',v.name); if(name==null)return; name=name.trim(); if(!name)return; v.name=name.slice(0,40); save(); render();
  };
  window.deleteVisitor = function(id){
    const v=visitor(id); if(!v) return; if(!confirm(`¿Eliminar a ${v.name} y sus favoritos?`))return; state.visitors=state.visitors.filter(x=>x.id!==id); delete state.selections[id]; save(); render();
  };
  toggleFav = function(id, actId){
    if(!visitor(id)) return; const arr=state.selections[id]||(state.selections[id]=[]); const i=arr.indexOf(actId); i>=0?arr.splice(i,1):arr.push(actId); save(); render();
  };

  function favButtons(a){
    if(!state.visitors.length) return `<button class="fav" onclick="addVisitor()">＋ Añadir visitante</button>`;
    return state.visitors.map(v=>{const on=personHas(v.id,a.id);return `<button class="fav ${on?'on':''}" onclick="toggleFav('${esc(v.id)}',${a.id})">${on?'♥':'♡'} ${esc(v.name)}</button>`}).join('');
  }
  card = function(a,extra=''){
    const lnk=firstLink(a);
    return `<article class="card ${a.time==='Todo el día'?'allDay':''}"><div class="topline"><span class="badge">${esc(a.category)}</span><span class="time">${esc(a.time)}${a.end?'–'+esc(a.end):''}</span></div><div class="title">${esc(a.title)}</div><div class="meta"><strong>📍 ${esc(a.location)}</strong>${a.registration?' · ✍️ Inscripción':''}${a.paid?' · 💳 De pago':''}</div>${a.details?`<div class="details">${esc(a.details)}</div>`:''}${extra}<div class="actions">${favButtons(a)}${lnk?`<a class="linkbtn ${a.registration?'reg':''}" href="${esc(lnk.url)}" target="_blank" rel="noopener">${a.registration?'Inscripción ↗':'Enlace ↗'}</a>`:''}</div></article>`;
  };
  selectedActivities = function(){ const ids=new Set(Object.values(state.selections).flat()); return ACTIVITIES.filter(a=>ids.has(a.id)); };

  function peopleManager(){
    return `<div class="peoplebox"><div class="peoplehead"><h2>Visitantes</h2><button class="addperson" onclick="addVisitor()">＋ Añadir visitante</button></div><div class="peoplelist">${state.visitors.length?state.visitors.map(v=>`<div class="personrow"><span class="personname">${esc(v.name)}</span><button class="tiny" onclick="renameVisitor('${esc(v.id)}')">Renombrar</button><button class="tiny dangerbtn" onclick="deleteVisitor('${esc(v.id)}')">Eliminar</button></div>`).join(''):'<div class="details">Todavía no hay visitantes. Añade a cada persona que vaya a usar el plan.</div>'}</div></div>`;
  }
  function syncAvailable(){ const c=window.FROMAGO_SYNC||{}; return !!(c.supabaseUrl&&c.supabaseKey&&window.supabase?.createClient); }
  function syncNotice(){
    if(room&&syncStatus==='on') return `<div class="notice sync"><b>● Plan sincronizado.</b> Los cambios se comparten con todos los que tengan este enlace.</div>`;
    if(room) return `<div class="notice pending"><b>Sincronización pendiente.</b> Intentando conectar con el plan compartido…</div>`;
    if(syncAvailable()) return `<div class="notice"><b>Plan local.</b> Puedes crear un enlace sincronizado desde Favoritos.</div>`;
    return `<div class="notice"><b>Plan local.</b> Los visitantes se guardan en este dispositivo. La sincronización online todavía no está activada.</div>`;
  }

  renderProgram = function(){
    const arr=filtered(),app=document.getElementById('app');document.getElementById('countpill').textContent=`${arr.length} de 221`;
    let out=syncNotice()+`<div class="notice">Programa provisional: 221 actividades de la programación oficial. FROMAGO puede modificar horarios y la mayoría de fichas no indican duración.</div>`;
    if(!arr.length){app.innerHTML=out+'<div class="empty">No hay actividades con estos filtros.</div>';return}
    for(const day of DAY_ORDER){const items=arr.filter(a=>a.day===day);if(!items.length)continue;out+=`<div class="sectiontitle"><h2>${day}</h2><span>${items.length} actividades</span></div><div class="cardsgrid">`;let last=null;for(const a of items){if(a.time!==last){out+=`<div class="slot">${a.time}</div>`;last=a.time}out+=card(a)}out+='</div>'}app.innerHTML=out;
  };
  renderFavorites = function(){
    const selected=selectedActivities(), ids=new Set(Object.values(state.selections).flat()); document.getElementById('countpill').textContent=`${ids.size} elegidas`;
    const shared=selected.filter(a=>chosenPeople(a.id).length>=2).length;
    let stats=state.visitors.map(v=>`<div class="stat"><b>${(state.selections[v.id]||[]).length}</b><span>${esc(v.name)}</span></div>`).join('')+`<div class="stat"><b>${shared}</b><span>Coincidencias</span></div>`;
    let syncBtns=room?`<button class="primary" onclick="sharePlan()">Compartir enlace del grupo</button><button class="secondary" onclick="shareText()">Compartir itinerario</button>`:`<button class="primary" onclick="createSharedPlan()" ${syncAvailable()?'':'disabled'}>${syncAvailable()?'Crear plan sincronizado':'Sincronización no configurada'}</button><button class="secondary" onclick="shareSnapshot()">Compartir copia</button>`;
    let out=syncNotice()+peopleManager()+`<div class="stats">${stats}</div><div class="sharebox">${syncBtns}</div>`;
    if(importedGroup) out+=`<div class="notice sync">✓ Has abierto una copia compartida. Puedes editarla y convertirla en un plan sincronizado.</div>`;
    if(!selected.length){out+='<div class="empty">Añade visitantes y marca actividades con ♡ en el programa.</div>';document.getElementById('app').innerHTML=out;return}
    for(const day of DAY_ORDER){const items=selected.filter(a=>a.day===day).sort(sortActs);if(!items.length)continue;out+=`<div class="sectiontitle"><h2>${day}</h2><span>${items.length}</span></div>`;for(const a of items){let who=`<div class="who">${chosenPeople(a.id).map(n=>`<span>${esc(n)}</span>`).join('')}</div>`;out+=card(a,`<div class="details">Elegida por ${who}</div>`)}}
    document.getElementById('app').innerHTML=out;
  };
  conflictMap = function(){
    const map={}; for(const v of state.visitors){for(const day of DAY_ORDER){let xs=ACTIVITIES.filter(a=>a.day===day&&personHas(v.id,a.id)&&a.time!=='Todo el día').sort(sortActs);for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){const x=xs[i],y=xs[j],sx=mins(x.time),sy=mins(y.time);if(sx==null||sy==null)continue;let hard=false,soft=false,reason='';const ex=x.end?mins(x.end):null;if(sx===sy){hard=true;reason=`empiezan a la misma hora (${x.time})`}else if(ex!=null&&sy<ex){hard=true;reason=`${x.title} figura hasta las ${x.end}`}else if(sy-sx<state.buffer){soft=true;reason=`solo hay ${sy-sx} min entre los inicios`}if(hard||soft){for(const a of [x,y]){map[a.id]=map[a.id]||[];map[a.id].push({p:v.id,hard,reason,other:a.id===x.id?y.title:x.title})}}}}}return map;
  };
  renderItinerary = function(){
    const arr=selectedActivities().sort(sortActs),cm=conflictMap();document.getElementById('countpill').textContent=`${arr.length} en el plan`;let hard=0,soft=0;Object.values(cm).flat().forEach(x=>x.hard?hard++:soft++);hard=Math.ceil(hard/2);soft=Math.ceil(soft/2);
    let out=syncNotice()+`<div class="settings"><label>Margen para avisos entre actividades <select onchange="state.buffer=+this.value;save();render()">${[15,30,45,60,90].map(v=>`<option value="${v}" ${state.buffer===v?'selected':''}>${v} min</option>`).join('')}</select></label></div><div class="legend"><b>Rojo:</b> misma hora o solape confirmado por un horario final. <b>Ámbar:</b> posible problema según el margen elegido. Los conflictos se calculan por visitante, así que el grupo puede dividirse.</div>`;
    if(hard||soft)out+=`<div class="notice"><b>${hard} conflicto${hard===1?'':'s'} claro${hard===1?'':'s'}</b> · ${soft} aviso${soft===1?'':'s'} de margen.</div>`;
    if(!arr.length){out+='<div class="empty">Todavía no hay actividades en el plan.</div>';document.getElementById('app').innerHTML=out;return}
    for(const day of DAY_ORDER){const items=arr.filter(a=>a.day===day);if(!items.length)continue;out+=`<div class="sectiontitle"><h2>${day}</h2><span>${items.length}</span></div>`;for(const a of items){let extras='';if(cm[a.id]){const seen=new Set();for(const c of cm[a.id]){const key=c.p+'|'+c.hard+'|'+c.other;if(seen.has(key))continue;seen.add(key);extras+=`<div class="conflict ${c.hard?'hard':'soft'}">${c.hard?'⛔':'⏱️'} ${esc(visitorName(c.p))}: ${esc(c.reason)} · también “${esc(c.other)}”</div>`}}out+=card(a,extras)}}
    document.getElementById('app').innerHTML=out;
  };

  function encGroup(obj){return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function decGroup(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return JSON.parse(decodeURIComponent(escape(atob(s))))}
  function snapshotUrl(){const u=new URL(location.href);u.searchParams.delete('room');u.searchParams.delete('key');u.hash='gp='+encGroup(sharedPayload());return u.toString()}
  async function shareAny(data,fallback){try{if(navigator.share&&location.protocol!=='file:')await navigator.share(data);else{await navigator.clipboard.writeText(data.url||fallback||data.text);toast('Enlace copiado')}}catch(e){}}
  window.shareSnapshot = function(){const url=snapshotUrl();shareAny({title:'Plan FROMAGO',text:'Te comparto una copia de nuestro plan de FROMAGO 2026',url});};
  sharePlan = function(){shareAny({title:'Plan compartido de FROMAGO',text:'Únete a nuestro plan compartido de FROMAGO 2026. Los cambios se sincronizan entre todos.',url:location.href.split('#')[0]});};
  itineraryText = function(){let arr=selectedActivities().sort(sortActs),lines=['🧀 FROMAGO 2026 · Plan compartido'];let cur='';for(const a of arr){if(a.day!==cur){cur=a.day;lines.push('',`— ${cur} —`)}lines.push(`${a.time} · ${a.title} · ${a.location} · ${chosenPeople(a.id).join(', ')}`)}return lines.join('\n')};
  function importGroupSnapshot(){if(!location.hash.startsWith('#gp='))return;try{const x=cleanSharedData(decGroup(location.hash.slice(4)));if(x){state.visitors=x.visitors;state.selections=x.selections;state.buffer=x.buffer;saveGroup();importedGroup=true;state.view='favorites'}}catch(e){}}

  function parseRoom(){const u=new URL(location.href);room=u.searchParams.get('room');roomSecret=u.searchParams.get('key')}
  function randomSecret(){const a=new Uint8Array(24);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')}
  function initClient(){if(!syncAvailable())return null;if(syncClient)return syncClient;const c=window.FROMAGO_SYNC;syncClient=window.supabase.createClient(c.supabaseUrl,c.supabaseKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});return syncClient}
  window.createSharedPlan = async function(){
    if(!syncAvailable()){toast('Primero hay que activar la sincronización');return}
    try{const client=initClient(),secret=randomSecret();const {data,error}=await client.rpc('create_fromago_plan',{p_secret:secret,p_data:sharedPayload()});if(error)throw error;const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('room',data);u.searchParams.set('key',secret);location.href=u.toString()}catch(e){console.error(e);toast('No se pudo crear el plan compartido')}
  };
  async function loadSharedPlan(){
    parseRoom(); if(!room||!roomSecret)return; if(!syncAvailable()){syncStatus='pending';render();return}
    try{syncStatus='pending';render();const client=initClient();const {data,error}=await client.rpc('get_fromago_plan',{p_id:room,p_secret:roomSecret});if(error)throw error;const x=cleanSharedData(data);if(!x)throw new Error('Plan no encontrado');state.visitors=x.visitors;state.selections=x.selections;state.buffer=x.buffer;saveGroup();syncStatus='on';subscribeRoom();render()}catch(e){console.error(e);syncStatus='pending';toast('No se pudo abrir el plan compartido');render()}
  }
  function subscribeRoom(){
    if(syncChannel||!syncClient)return;const topic=`fromago:${room}:${roomSecret}`;
    syncChannel=syncClient.channel(topic,{config:{broadcast:{self:false,ack:true}}}).on('broadcast',{event:'state'},({payload})=>{const x=cleanSharedData(payload?.data);if(!x)return;applyingRemote=true;state.visitors=x.visitors;state.selections=x.selections;state.buffer=x.buffer;saveGroup();applyingRemote=false;render()}).subscribe(status=>{syncStatus=status==='SUBSCRIBED'?'on':'pending';render()});
  }
  function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(pushSharedState,180)}
  async function pushSharedState(){
    if(!room||!roomSecret||!syncAvailable())return;
    try{const client=initClient(),payload=sharedPayload();const {data,error}=await client.rpc('save_fromago_plan',{p_id:room,p_secret:roomSecret,p_data:payload});if(error||data!==true)throw error||new Error('save failed');if(syncChannel)await syncChannel.send({type:'broadcast',event:'state',payload:{data:payload}});syncStatus='on'}catch(e){console.error(e);syncStatus='pending';toast('Cambio guardado en el móvil; sincronización pendiente')}
  }

  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function initSyncRuntime(){
    try{await loadScript('./sync-config.js');if(window.FROMAGO_SYNC?.supabaseUrl&&window.FROMAGO_SYNC?.supabaseKey){await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');}}catch(e){console.warn('Sync runtime unavailable',e)}
    parseRoom(); if(room) await loadSharedPlan(); render();
  }

  parseRoom(); if(!room) importGroupSnapshot(); saveGroup(); setupFilters(); render(); initSyncRuntime();
})();
