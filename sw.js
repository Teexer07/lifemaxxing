const CACHE = "lmx-v33";
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
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
