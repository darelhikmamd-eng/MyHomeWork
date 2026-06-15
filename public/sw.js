const CACHE_NAME = "cunigestion-v1";

// Ressources à mettre en cache lors de l'installation
const PRECACHE_URLS = ["/auth/login", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Les appels API doivent toujours passer par le réseau
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Mettre en cache les ressources statiques
          if (
            response.ok &&
            (url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/) ||
              url.pathname === "/")
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Page hors ligne si navigation
          if (event.request.mode === "navigate") {
            return caches.match("/auth/login") || new Response("Hors ligne", { status: 503 });
          }
        });
    })
  );
});
