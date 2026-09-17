const VERSION='11.7';
const CACHE='fromago-secure-v11-7';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./secure-v11.js','./secure-v10.js','./locations-data-v11.js','./locations-ui-v11.js','./program-ui-v11.js','./status-ui-v11.js','./mobile-ui-v11.js','./sync-config.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(x=>new Request(x,{cache:'reload'})))));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients)client.postMessage({type:'UPDATE_READY',version:VERSION});
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='GET_VERSION')event.source?.postMessage({type:'UPDATE_READY',version:VERSION});
});

async function latestHtml(request){
  try{
    const network=await fetch(request,{cache:'no-store'});
    if(network.ok){const copy=network.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}
    const text=await network.text();
    return injectV11(text,network);
  }catch(e){
    const cached=await caches.match('./index.html');
    if(!cached)return Response.error();
    return injectV11(await cached.text(),cached);
  }
}
function injectV11(text,response){
  const cleaned=text
    .replace(/<script\s+src=["']\.\/secure-v10\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/secure-v11\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/locations-data-v11\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/locations-ui-v11\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/program-ui-v11\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/status-ui-v11\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/mobile-ui-v11\.js[^>]*><\/script>/gi,'');
  const injected=cleaned.replace('</body>','<script src="./secure-v11.js?v=11"></script>\n<script src="./locations-data-v11.js?v=11.1"></script>\n<script src="./locations-ui-v11.js?v=11.2"></script>\n<script src="./program-ui-v11.js?v=11.3"></script>\n<script src="./status-ui-v11.js?v=11.7"></script>\n<script src="./mobile-ui-v11.js?v=11.7"></script>\n</body>');
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');headers.set('cache-control','no-store, max-age=0');
  return new Response(injected,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(latestHtml(event.request));return;}
  if(/\/(secure-v11\.js|secure-v10\.js|locations-data-v11\.js|locations-ui-v11\.js|program-ui-v11\.js|status-ui-v11\.js|mobile-ui-v11\.js|sync-config\.js|sw\.js)$/.test(url.pathname)){
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(network=>{const copy=network.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return network})));
});
