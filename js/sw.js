/* Birddog offline cache.

   Network-first for our own files. The previous version was cache-first, which
   is great offline but means a published update never arrives until the cache
   name changes — and if you forget to bump it, the app is frozen forever. This
   version always tries the network, falls back to cache when there isn't one,
   and tells the page when a newer build has installed so it can reload itself. */

const CACHE = "birddog-v47";
const ASSETS = [
  "./", "index.html", "css/style.css", "icon.svg", "manifest.webmanifest",
  "js/schools.js", "js/core.js", "js/text.js", "js/career.js", "js/world.js",
  "js/clubs.js", "js/economy.js", "js/saves.js", "js/ui.js"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((cs) => cs.forEach((c) => c.postMessage({ birddog: "updated", cache: CACHE })))
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("index.html")))
  );
});
