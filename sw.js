const CACHE_NAME = "campus-one-pwa-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./config.js",
  "./manifest.webmanifest",
  "./icons/campus-one-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Network-first for same-origin app files, so every new deploy shows up
// immediately. Falls back to the cached copy only when offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const isSameOrigin = new URL(event.request.url).origin === self.location.origin;

  if (!isSameOrigin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
