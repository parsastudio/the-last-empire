const CACHE_NAME = "geopolitics-empire-v3";

const STATIC_SHELLS = [
  "/",
  "/fa",
  "/en",
  "/fa/select-nation",
  "/en/select-nation",
  "/fa/play/default",
  "/en/play/default",
  "/manifest.webmanifest",
  "/Vazirmatn.woff2",
  "/maps/map1/final/manifest.json",
  "/maps/map1/final/live-state.bin.gz",
  "/maps/map1/final/terrain-raw.bin.gz",
];

async function extractAndCacheHtmlAssets(cache, urls) {
  const assetUrls = new Set();

  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          await cache.put(url, res.clone());
          const text = await res.text();
          const scriptRegex = /<script[^>]+src="([^">]+)"/g;
          const styleRegex = /<link[^>]+href="([^">]+)"[^>]*rel="stylesheet"/g;

          let match;
          while ((match = scriptRegex.exec(text)) !== null) {
            if (match[1] && match[1].startsWith("/")) {
              assetUrls.add(match[1]);
            }
          }

          while ((match = styleRegex.exec(text)) !== null) {
            if (match[1] && match[1].startsWith("/")) {
              assetUrls.add(match[1]);
            }
          }
        }
      } catch {}
    }),
  );

  await Promise.allSettled(
    Array.from(assetUrls).map(async (assetUrl) => {
      try {
        const res = await fetch(assetUrl);
        if (res.ok) {
          await cache.put(assetUrl, res);
        }
      } catch {}
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => extractAndCacheHtmlAssets(cache, STATIC_SHELLS))
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
          if (directMatch) return directMatch;

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

          const fallback =
            (await caches.match(isEn ? "/en" : "/fa")) ||
            (await caches.match("/"));

          if (fallback) return fallback;

          return new Response("Offline Mode Active", {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
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
    url.pathname.endsWith(".bin.gz")
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
          .catch(() => {
            return new Response(new ArrayBuffer(0), {
              status: 404,
              statusText: "Not Found Offline",
            });
          });
      }),
    );
    return;
  }

  if (url.searchParams.has("_rsc")) {
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
          const cachedRsc = await caches.match(request);
          if (cachedRsc) return cachedRsc;

          const cleanPath = url.pathname;
          const isEn = cleanPath.startsWith("/en");

          if (cleanPath.includes("/play/")) {
            const fallbackKey = isEn
              ? "/en/play/default?_rsc=offline"
              : "/fa/play/default?_rsc=offline";
            const match = await caches.match(fallbackKey);
            if (match) return match;
          }

          return new Response("", {
            status: 204,
            headers: { "x-nextjs-matched-path": cleanPath },
          });
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
            return res;
          })
          .catch(() => cached || Response.error())
      );
    }),
  );
});
