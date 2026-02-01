const CACHE = "haber-a3-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

/* 🔥 NETLIFY FUNCTIONS BYPASS */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // API çağrılarına ASLA dokunma
  if (url.pathname.startsWith("/.netlify/functions/")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
