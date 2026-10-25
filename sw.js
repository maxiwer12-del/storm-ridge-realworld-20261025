const CACHE='storm-ridge-realworld-v8';
const scope=self.registration.scope;
const file=name=>new URL(name,scope).href;
const SHELL=[scope,file('index.html'),file('manifest.webmanifest'),file('favicon.svg'),file('icon-192.png'),file('icon-512.png')];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match(file('index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&response.type==='basic'){
      const cloned=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,cloned));
    }
    return response;
  })));
});
