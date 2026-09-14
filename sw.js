const CACHE='fromago-plan-v6';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./group.js','./sync-config.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{await client.navigate(client.url)}catch(e){}
    }
  })());
});

async function injectGroup(response){
  const text=await response.text();
  if(text.includes('src="./group.js"')) return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
  const injected=text.replace('</body>','<script src="./group.js"></script>\n</body>');
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');
  return new Response(injected,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const network=await fetch(event.request,{cache:'no-store'});
        const copy=network.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',copy));
        return await injectGroup(network);
      }catch(e){
        const cached=await caches.match('./index.html');
        return cached?injectGroup(cached):Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(network=>{
    const copy=network.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return network;
  })));
});
