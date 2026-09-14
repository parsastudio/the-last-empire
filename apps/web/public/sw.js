const CACHE_NAME = "geopolitics-empire-v5";

const PRECACHE_ROUTES = [
  "/",
  "/fa",
  "/en",
  "/fa/select-nation",
  "/en/select-nation",
  "/fa/play/default",
  "/en/play/default",
];

const PRECACHE_STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/Vazirmatn.woff2",
  "/maps/map1/final/manifest.json",
  "/maps/map1/final/live-state.bin.gz",
  "/maps/map1/final/terrain-raw.bin.gz",
];

async function precacheCompleteEnvironment(cache) {
  const assetsToFetch = new Set(PRECACHE_STATIC_ASSETS);

  await Promise.allSettled(
    PRECACHE_ROUTES.map(async (route) => {
      try {
        const htmlRes = await fetch(route);
        if (htmlRes.ok) {
          await cache.put(route, htmlRes.clone());
          const htmlText = await htmlRes.text();

          const scriptRegex = /<script[^>]+src="([^">]+)"/g;
          const linkRegex = /<link[^>]+href="([^">]+)"/g;

          let match;
          while ((match = scriptRegex.exec(htmlText)) !== null) {
            if (match[1] && match[1].startsWith("/_next/")) {
              assetsToFetch.add(match[1]);
            }
          }

          while ((match = linkRegex.exec(htmlText)) !== null) {
            if (match[1] && match[1].startsWith("/_next/")) {
              assetsToFetch.add(match[1]);
            }
          }
        }
      } catch {}

      try {
        const rscUrl = `${route === "/" ? "/fa" : route}?_rsc=offline`;
        const rscRes = await fetch(rscUrl, {
          headers: { RSC: "1" },
        });
        if (rscRes.ok) {
          await cache.put(rscUrl, rscRes);
        }
      } catch {}
    }),
  );

  await Promise.allSettled(
    Array.from(assetsToFetch).map(async (assetUrl) => {
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
      .then((cache) => precacheCompleteEnvironment(cache))
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

  const pathname = url.pathname;

  if (pathname.startsWith("/en")) {
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.put("/__active_locale", new Response("en")));
  } else if (pathname.startsWith("/fa")) {
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.put("/__active_locale", new Response("fa")));
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          if (pathname === "/" || pathname === "") {
            let targetLocale = "/fa";
            try {
              const activeLocaleRes = await caches.match("/__active_locale");
              if (activeLocaleRes) {
                const loc = await activeLocaleRes.text();
                if (loc === "en") targetLocale = "/en";
              }
            } catch {}

            try {
              return Response.redirect(
                new URL(targetLocale, url.origin).href,
                307,
              );
            } catch {
              const redirectHtml = `<!DOCTYPE html><html lang="${targetLocale === "/en" ? "en" : "fa"}"><head><meta charset="utf-8"><script>window.location.replace("${targetLocale}");</script></head><body></body></html>`;
              return new Response(redirectHtml, {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              });
            }
          }

          const directMatch = await caches.match(request);
          if (directMatch) return directMatch;

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

          return new Response("Offline Mode Ready", {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
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
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const directMatch = await caches.match(request);
          if (directMatch) return directMatch;

          const cleanPath = url.pathname;
          const isEn = cleanPath.startsWith("/en");

          let fallbackKey = isEn ? "/en?_rsc=offline" : "/fa?_rsc=offline";

          if (cleanPath.includes("/play/")) {
            fallbackKey = isEn
              ? "/en/play/default?_rsc=offline"
              : "/fa/play/default?_rsc=offline";
          } else if (cleanPath.includes("/select-nation")) {
            fallbackKey = isEn
              ? "/en/select-nation?_rsc=offline"
              : "/fa/select-nation?_rsc=offline";
          }

          const matchedFallback = await caches.match(fallbackKey);
          if (matchedFallback) return matchedFallback;

          return new Response("", {
            status: 204,
            headers: { "x-nextjs-matched-path": cleanPath },
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
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response(new ArrayBuffer(0), {
              status: 404,
              statusText: "Asset Not In Offline Cache",
            });
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
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => Response.error())
      );
    }),
  );
});
