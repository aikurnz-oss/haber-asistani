const CACHE = "haber-a3-v2";

const ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    )
  );
});

/* NETLIFY FUNCTIONS BYPASS */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  if (url.pathname.startsWith("/.netlify/functions/")) return;

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
