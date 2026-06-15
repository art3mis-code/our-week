// Our Week — service worker
const CACHE = "ourweek-v2";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (url.includes("supabase.co")) return;            // never cache live data
  if (e.request.mode === "navigate" || url.endsWith(".html")) {
    // network-first for the document so updates show immediately
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }
  // cache-first for static assets
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
