const VERSION='10';
const CACHE='fromago-secure-v10';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./secure-v10.js','./sync-config.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(x=>new Request(x,{cache:'reload'})))));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

async function latestHtml(request){
  let response;
  try{
    response=await fetch(request,{cache:'no-store'});
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}
  }catch(e){response=await caches.match('./index.html');}
  if(!response)return Response.error();
  const text=await response.text();
  const cleaned=text
    .replace(/<script\s+src=["']\.\/group\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/self-join\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/secure-v8\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/secure-v9\.js[^>]*><\/script>/gi,'')
    .replace(/<script\s+src=["']\.\/secure-v10\.js[^>]*><\/script>/gi,'');
  const injected=cleaned.replace('</body>','<script src="./secure-v10.js?v=10"></script>\n</body>');
  const headers=new Headers(response.headers);
  headers.set('content-type','text/html; charset=utf-8');
  headers.set('cache-control','no-store, max-age=0');
  return new Response(injected,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(latestHtml(event.request));
    return;
  }
  if(/\/(secure-v10\.js|sync-config\.js|sw\.js)$/.test(url.pathname)){
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
