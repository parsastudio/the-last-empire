const CACHE_NAME = "geopolitics-empire-v2";

const STATIC_PRECACHE_URLS = [
  "/",
  "/fa",
  "/en",
  "/fa/select-nation",
  "/en/select-nation",
  "/fa/play/default",
  "/en/play/default",
  "/Vazirmatn.woff2",
  "/manifest.webmanifest",
  "/maps/map1/final/manifest.json",
  "/maps/map1/final/live-state.bin.gz",
  "/maps/map1/final/terrain-raw.bin.gz",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          STATIC_PRECACHE_URLS.map((url) =>
            fetch(url).then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const directMatch = await caches.match(request);
          if (directMatch) {
            return directMatch;
          }

          const pathname = url.pathname;
          const isEn = pathname.startsWith("/en");

          if (pathname.includes("/play/")) {
            const playShell = await caches.match(
              isEn ? "/en/play/default" : "/fa/play/default",
            );
            if (playShell) return playShell;
          }

          if (pathname.includes("/select-nation")) {
            const selectShell = await caches.match(
              isEn ? "/en/select-nation" : "/fa/select-nation",
            );
            if (selectShell) return selectShell;
          }

          return (
            (await caches.match(isEn ? "/en" : "/fa")) ||
            (await caches.match("/"))
          );
        }),
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/maps/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".bin") ||
    url.pathname.endsWith(".bin.gz") ||
    url.searchParams.has("_rsc")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(async () => {
            if (url.searchParams.has("_rsc")) {
              const cleanUrl = url.pathname;
              const directClean = await caches.match(cleanUrl);
              if (directClean) return directClean;

              if (cleanUrl.includes("/play/")) {
                const isEn = cleanUrl.startsWith("/en");
                return await caches.match(
                  isEn ? "/en/play/default" : "/fa/play/default",
                );
              }
            }
            return null;
          });
      }),
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
