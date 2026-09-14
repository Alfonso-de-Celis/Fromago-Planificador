(() => {
  'use strict';

  const params = new URL(location.href).searchParams;
  const roomId = params.get('room');
  const roomKey = params.get('key');
  const isSharedRoom = !!(roomId && roomKey);
  const identityKey = roomId ? `fromago-room-user-v1:${roomId}` : null;
  const viewKey = roomId ? `fromago-room-view-v1:${roomId}` : null;
  let myVisitorId = identityKey ? localStorage.getItem(identityKey) : null;
  let profileView = viewKey ? (localStorage.getItem(viewKey) || 'group') : 'group';
  let activated = false;
  let joinDismissed = false;

  const originalCard = card;
  const originalRenderFavorites = renderFavorites;
  const originalRenderItinerary = renderItinerary;
  const originalCreateSharedPlan = window.createSharedPlan;

  const css = document.createElement('style');
  css.textContent = `
    .joinbackdrop{position:fixed;inset:0;background:rgba(10,10,10,.66);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px}.joincard{width:min(440px,100%);max-height:90vh;overflow:auto;background:#fffaf0;border-radius:20px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.28)}.joincard h2{font-size:24px;margin:8px 0}.joincard p{color:var(--muted);line-height:1.45}.joininput{display:flex;gap:8px;margin-top:14px}.joininput input{flex:1;border:1px solid var(--line);background:#fff;border-radius:11px;padding:11px 12px;font:inherit}.joininput button,.joinexisting button{border:0;background:var(--cheese);border-radius:11px;padding:10px 12px;font-weight:850}.joinexisting{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}.joinexisting button{background:#fff;border:1px solid var(--line)}.joinlook{width:100%;margin-top:12px;border:0;background:transparent;color:var(--muted);padding:8px}.viewtabs{display:flex;gap:7px;overflow:auto;padding:4px 0 10px}.viewtab{white-space:nowrap;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 11px;font-weight:800}.viewtab.active{background:var(--ink);color:#fff;border-color:var(--ink)}.interesthint{font-size:11px;color:var(--muted);padding:7px 4px;align-self:center}.youmark{font-size:10px;color:var(--green);font-weight:900;margin-left:5px}.personplain{font-size:12px;color:var(--muted)}.groupintro{font-size:12px;color:var(--muted);line-height:1.45;margin-top:8px}
  `;
  document.head.appendChild(css);

  function visitor(id){ return (state.visitors || []).find(v => v.id === id); }
  function validIdentity(){ return !!(myVisitorId && visitor(myVisitorId)); }
  function myName(){ return validIdentity() ? visitor(myVisitorId).name : null; }
  function setIdentity(id){
    myVisitorId = id;
    if(identityKey) localStorage.setItem(identityKey, id);
    profileView = id || 'group';
    if(viewKey) localStorage.setItem(viewKey, profileView);
    joinDismissed = false;
  }
  function clearIdentity(){
    myVisitorId = null;
    if(identityKey) localStorage.removeItem(identityKey);
    profileView = 'group';
    if(viewKey) localStorage.setItem(viewKey, 'group');
  }
  function makeId(){ return crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
  function interests(id){ return (state.selections && state.selections[id]) || []; }
  function activitiesForView(){
    if(profileView === 'group' || !visitor(profileView)) return selectedActivities().sort(sortActs);
    const ids = new Set(interests(profileView));
    return ACTIVITIES.filter(a => ids.has(a.id)).sort(sortActs);
  }
  function viewName(){ return profileView === 'group' ? 'Todo el grupo' : visitor(profileView)?.name || 'Todo el grupo'; }

  function sharedNotice(){
    const who = myName();
    return `<div class="notice sync"><b>● Plan compartido.</b> ${who ? `Estás participando como <b>${esc(who)}</b>.` : 'Puedes mirar el plan o identificarte para marcar tus intereses.'} Los cambios se sincronizan con el grupo.</div>`;
  }

  function profileTabs(){
    const tabs = [`<button class="viewtab ${profileView==='group'?'active':''}" onclick="setPlanView('group')">Todo el grupo</button>`];
    if(validIdentity()) tabs.push(`<button class="viewtab ${profileView===myVisitorId?'active':''}" onclick="setPlanView('${esc(myVisitorId)}')">Mi plan · ${esc(myName())}</button>`);
    for(const v of state.visitors || []){
      if(v.id === myVisitorId) continue;
      tabs.push(`<button class="viewtab ${profileView===v.id?'active':''}" onclick="setPlanView('${esc(v.id)}')">${esc(v.name)}</button>`);
    }
    return `<div class="viewtabs">${tabs.join('')}</div>`;
  }

  function peopleManager(){
    const rows = (state.visitors || []).map(v => {
      if(v.id === myVisitorId){
        return `<div class="personrow"><span class="personname">${esc(v.name)} <span class="youmark">TÚ</span></span><button class="tiny" onclick="renameMyVisitor()">Renombrar</button><button class="tiny dangerbtn" onclick="leaveSharedPlan()">Salir</button></div>`;
      }
      return `<div class="personrow"><span class="personname">${esc(v.name)}</span><span class="personplain">${interests(v.id).length} intereses</span></div>`;
    }).join('');
    const action = validIdentity() ? `<button class="tiny" onclick="changeSharedIdentity()">Cambiar quién soy</button>` : `<button class="addperson" onclick="changeSharedIdentity()">＋ Unirme al plan</button>`;
    return `<div class="peoplebox"><div class="peoplehead"><h2>Participantes · ${(state.visitors||[]).length}</h2>${action}</div><div class="groupintro">Cada persona entra con este mismo enlace, se identifica con su nombre y gestiona sus propios intereses.</div><div class="peoplelist">${rows || '<div class="details">Aún no se ha unido nadie.</div>'}</div></div>`;
  }

  window.setPlanView = function(id){
    profileView = (id === 'group' || visitor(id)) ? id : 'group';
    if(viewKey) localStorage.setItem(viewKey, profileView);
    render();
  };

  window.changeSharedIdentity = function(){
    joinDismissed = false;
    showJoin();
  };

  window.useExistingVisitor = function(id){
    if(!visitor(id)) return;
    setIdentity(id);
    closeJoin();
    render();
    toast(`Has entrado como ${visitor(id).name}`);
  };

  window.joinSharedVisitor = function(){
    const input = document.getElementById('joinName');
    let name = (input?.value || '').trim();
    if(!name) return;
    name = name.slice(0, 40);
    const duplicate = (state.visitors || []).find(v => v.name.trim().toLocaleLowerCase('es') === name.toLocaleLowerCase('es'));
    if(duplicate){
      toast('Ese nombre ya existe. Selecciónalo arriba o usa otro nombre.');
      return;
    }
    const id = makeId();
    state.visitors = state.visitors || [];
    state.selections = state.selections || {};
    state.visitors.push({id, name});
    state.selections[id] = [];
    setIdentity(id);
    save();
    closeJoin();
    render();
    toast(`Bienvenido, ${name}`);
  };

  window.renameMyVisitor = function(){
    if(!validIdentity()) return;
    let name = prompt('Tu nombre en este plan', myName());
    if(name == null) return;
    name = name.trim().slice(0,40);
    if(!name) return;
    const duplicate = state.visitors.find(v => v.id !== myVisitorId && v.name.trim().toLocaleLowerCase('es') === name.toLocaleLowerCase('es'));
    if(duplicate){ toast('Ese nombre ya está en uso.'); return; }
    visitor(myVisitorId).name = name;
    save();
    render();
  };

  window.leaveSharedPlan = function(){
    if(!validIdentity()) return;
    const name = myName();
    if(!confirm(`¿Salir del plan como ${name}? Se eliminarán también tus intereses.`)) return;
    state.visitors = state.visitors.filter(v => v.id !== myVisitorId);
    delete state.selections[myVisitorId];
    clearIdentity();
    save();
    render();
    setTimeout(showJoin, 120);
  };

  function closeJoin(){ document.getElementById('joinOverlay')?.remove(); }
  window.dismissJoin = function(){ joinDismissed = true; closeJoin(); };
  function showJoin(){
    if(!isSharedRoom || validIdentity() || document.getElementById('joinOverlay')) return;
    const existing = (state.visitors || []).map(v => `<button onclick="useExistingVisitor('${esc(v.id)}')">${esc(v.name)}</button>`).join('');
    const el = document.createElement('div');
    el.id = 'joinOverlay';
    el.className = 'joinbackdrop';
    el.innerHTML = `<div class="joincard"><span class="badge">PLAN COMPARTIDO</span><h2>¿Quién eres?</h2><p>Escribe tu nombre y te sumarás al grupo. A partir de ahí, los corazones que marques serán tus intereses. Si ya entraste antes desde otro dispositivo, selecciona tu nombre existente.</p>${existing?`<div class="details"><b>Ya están en el grupo</b></div><div class="joinexisting">${existing}</div>`:''}<div class="joininput"><input id="joinName" maxlength="40" autocomplete="name" placeholder="Tu nombre"><button onclick="joinSharedVisitor()">Entrar</button></div><button class="joinlook" onclick="dismissJoin()">Ver el plan sin identificarme</button></div>`;
    document.body.appendChild(el);
    const input = document.getElementById('joinName');
    input?.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); joinSharedVisitor(); } });
    setTimeout(() => input?.focus(), 50);
  }

  function selfFavButtons(a){
    if(!validIdentity()) return `<button class="fav" onclick="changeSharedIdentity()">＋ Identificarme para elegir</button>`;
    const on = personHas(myVisitorId, a.id);
    const others = chosenPeople(a.id).filter(n => n !== myName());
    return `<button class="fav ${on?'on':''}" onclick="toggleFav('${esc(myVisitorId)}',${a.id})">${on?'♥':'♡'} ${on?'Me interesa':'Me interesa'}</button>${others.length?`<span class="interesthint">También: ${others.map(esc).join(', ')}</span>`:''}`;
  }

  function enhancedCard(a, extra=''){
    const lnk = firstLink(a);
    return `<article class="card ${a.time==='Todo el día'?'allDay':''}"><div class="topline"><span class="badge">${esc(a.category)}</span><span class="time">${esc(a.time)}${a.end?'–'+esc(a.end):''}</span></div><div class="title">${esc(a.title)}</div><div class="meta"><strong>📍 ${esc(a.location)}</strong>${a.registration?' · ✍️ Inscripción':''}${a.paid?' · 💳 De pago':''}</div>${a.details?`<div class="details">${esc(a.details)}</div>`:''}${extra}<div class="actions">${selfFavButtons(a)}${lnk?`<a class="linkbtn ${a.registration?'reg':''}" href="${esc(lnk.url)}" target="_blank" rel="noopener">${a.registration?'Inscripción ↗':'Enlace ↗'}</a>`:''}</div></article>`;
  }

  function conflictsFor(visitorIds){
    const map = {};
    for(const pid of visitorIds){
      for(const day of DAY_ORDER){
        const xs = ACTIVITIES.filter(a => a.day===day && interests(pid).includes(a.id) && a.time!=='Todo el día').sort(sortActs);
        for(let i=0;i<xs.length;i++) for(let j=i+1;j<xs.length;j++){
          const x=xs[i], y=xs[j], sx=mins(x.time), sy=mins(y.time);
          if(sx==null || sy==null) continue;
          let hard=false, soft=false, reason='';
          const ex=x.end?mins(x.end):null;
          if(sx===sy){ hard=true; reason=`empiezan a la misma hora (${x.time})`; }
          else if(ex!=null && sy<ex){ hard=true; reason=`${x.title} figura hasta las ${x.end}`; }
          else if(sy-sx<state.buffer){ soft=true; reason=`solo hay ${sy-sx} min entre los inicios`; }
          if(hard||soft){
            for(const act of [x,y]){
              map[act.id]=map[act.id]||[];
              map[act.id].push({p:pid,hard,reason,other:act.id===x.id?y.title:x.title});
            }
          }
        }
      }
    }
    return map;
  }

  function renderSharedFavorites(){
    const all = selectedActivities();
    const selected = activitiesForView();
    const shared = all.filter(a => chosenPeople(a.id).length >= 2).length;
    document.getElementById('countpill').textContent = `${selected.length} · ${viewName()}`;
    const stats = (state.visitors||[]).map(v => `<div class="stat"><b>${interests(v.id).length}</b><span>${esc(v.name)}</span></div>`).join('') + `<div class="stat"><b>${shared}</b><span>Coincidencias</span></div>`;
    let out = sharedNotice() + peopleManager() + `<div class="stats">${stats}</div>${profileTabs()}<div class="sharebox"><button class="primary" onclick="sharePlan()">Compartir enlace del grupo</button><button class="secondary" onclick="shareText()">Compartir itinerario</button></div>`;
    if(!selected.length){
      out += `<div class="empty">${profileView==='group'?'Aún no hay intereses marcados en el grupo.':`${esc(viewName())} todavía no ha marcado actividades.`}</div>`;
      document.getElementById('app').innerHTML = out;
      return;
    }
    for(const day of DAY_ORDER){
      const items = selected.filter(a => a.day===day);
      if(!items.length) continue;
      out += `<div class="sectiontitle"><h2>${day}</h2><span>${items.length}</span></div>`;
      for(const a of items){
        const who = chosenPeople(a.id);
        const chips = `<div class="who">${who.map(n=>`<span>${esc(n)}</span>`).join('')}</div>`;
        out += enhancedCard(a, `<div class="details">Interesa a ${chips}</div>`);
      }
    }
    document.getElementById('app').innerHTML = out;
  }

  function renderSharedItinerary(){
    const selected = activitiesForView();
    const pids = profileView==='group' ? (state.visitors||[]).map(v=>v.id) : (visitor(profileView)?[profileView]:[]);
    const cm = conflictsFor(pids);
    document.getElementById('countpill').textContent = `${selected.length} · ${viewName()}`;
    let hard=0, soft=0;
    Object.values(cm).flat().forEach(x => x.hard ? hard++ : soft++);
    hard=Math.ceil(hard/2); soft=Math.ceil(soft/2);
    let out = sharedNotice() + profileTabs() + `<div class="settings"><label>Margen para avisos entre actividades <select onchange="state.buffer=+this.value;save();render()">${[15,30,45,60,90].map(v=>`<option value="${v}" ${state.buffer===v?'selected':''}>${v} min</option>`).join('')}</select></label></div><div class="legend"><b>Rojo:</b> misma hora o solape confirmado. <b>Ámbar:</b> posible problema según el margen elegido. ${profileView==='group'?'Los avisos se calculan por participante.':`Estás viendo los avisos de ${esc(viewName())}.`}</div>`;
    if(hard||soft) out += `<div class="notice"><b>${hard} conflicto${hard===1?'':'s'} claro${hard===1?'':'s'}</b> · ${soft} aviso${soft===1?'':'s'} de margen.</div>`;
    if(!selected.length){
      out += `<div class="empty">${profileView==='group'?'Todavía no hay actividades en el plan.':`${esc(viewName())} todavía no tiene actividades.`}</div>`;
      document.getElementById('app').innerHTML = out;
      return;
    }
    for(const day of DAY_ORDER){
      const items=selected.filter(a=>a.day===day);
      if(!items.length) continue;
      out += `<div class="sectiontitle"><h2>${day}</h2><span>${items.length}</span></div>`;
      for(const a of items){
        let extras = `<div class="who">${chosenPeople(a.id).map(n=>`<span>${esc(n)}</span>`).join('')}</div>`;
        if(cm[a.id]){
          const seen=new Set();
          for(const c of cm[a.id]){
            const key=`${c.p}|${c.hard}|${c.other}`;
            if(seen.has(key)) continue;
            seen.add(key);
            extras += `<div class="conflict ${c.hard?'hard':'soft'}">${c.hard?'⛔':'⏱️'} ${esc(personName(c.p))}: ${esc(c.reason)} · también “${esc(c.other)}”</div>`;
          }
        }
        out += enhancedCard(a, extras);
      }
    }
    document.getElementById('app').innerHTML = out;
  }

  function activate(){
    if(activated || !isSharedRoom) return;
    activated = true;
    if(!validIdentity()) clearIdentity();
    if(profileView!=='group' && !visitor(profileView)) profileView = validIdentity()?myVisitorId:'group';
    card = enhancedCard;
    renderFavorites = renderSharedFavorites;
    renderItinerary = renderSharedItinerary;
    render();
    if(!validIdentity() && !joinDismissed) setTimeout(showJoin, 120);
  }

  if(originalCreateSharedPlan){
    window.createSharedPlan = async function(){
      const backupVisitors = state.visitors;
      const backupSelections = state.selections;
      const before = location.href;
      state.visitors = [];
      state.selections = {};
      try{ await originalCreateSharedPlan(); }
      finally{
        if(location.href === before){
          state.visitors = backupVisitors;
          state.selections = backupSelections;
          render();
        }
      }
    };
  }

  if(!isSharedRoom) return;

  const watcher = setInterval(() => {
    const synced = [...document.querySelectorAll('.notice.sync')].some(n => /Plan sincronizado/i.test(n.textContent || ''));
    if(synced){ clearInterval(watcher); activate(); }
  }, 250);

  setTimeout(() => {
    if(!activated){
      const pending = [...document.querySelectorAll('.notice.pending')].some(n => /Sincronización pendiente/i.test(n.textContent || ''));
      if(!pending) activate();
    }
  }, 5000);
})();
