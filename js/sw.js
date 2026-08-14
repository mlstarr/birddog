/* Birddog offline cache.
   Bump CACHE when you upload a new version — the old one is dropped on activate. */
const CACHE = "birddog-v46";
const ASSETS = [
  "./",
  "index.html",
  "css/style.css",
  "icon.svg",
  "manifest.webmanifest",
  "js/schools.js",
  "js/core.js",
  "js/text.js",
  "js/career.js",
  "js/world.js",
  "js/clubs.js",
  "js/economy.js",
  "js/saves.js",
  "js/ui.js"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// Cache first for our own files so the game opens instantly and works with no
// network at all; the font request simply fails and the fallbacks take over.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
