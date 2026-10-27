const CACHE = "lmx-v46";
const ASSETS = [
  "./", "index.html", "manifest.json", "icon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
  "ocr/tesseract.min.js", "ocr/worker.min.js",
  "ocr/tesseract-core-simd-lstm.wasm.js", "ocr/tesseract-core-lstm.wasm.js",
  "ocr/ita.traineddata.gz"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== "lmx-cfg").map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});

// ---- notifiche push (Lifemaxxing): il server manda un segnale vuoto, il testo si scarica qui
self.addEventListener("push",e=>e.waitUntil((async()=>{let L=[];try{const c=await caches.open("lmx-cfg"),r=await c.match("cfg"),g=r?await r.json():{};if(g.w&&g.u)L=await (await fetch(g.w+"/msg?u="+g.u)).json()}catch(x){}
 if(!L.length)L=[{title:"Lifemaxxing",body:"Apri l'app: hai un promemoria.",tag:"lmx"}];for(const n of L)await self.registration.showNotification(n.title,{body:n.body,tag:n.tag||String(n.t),icon:"icon-192.png",badge:"icon-192.png",data:{u:"./"}})})()));
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(w=>w.length?w[0].focus():clients.openWindow("./")))});
