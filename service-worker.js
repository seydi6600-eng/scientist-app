const CACHE_VERSION = "scientist-v1.0.0";
const STATIC_CACHE = CACHE_VERSION + "-static";
const DYNAMIC_CACHE = CACHE_VERSION + "-dynamic";

const STATIC_ASSETS = [
    "./", "./index.html", "./style.css", "./script.js",
    "./league.js", "./shop.js", "./music.js",
    "./manifest.json", "./offline.html"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function (cache) {
                return cache.addAll(STATIC_ASSETS).catch(function () {});
            })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) {
                    return k !== STATIC_CACHE && k !== DYNAMIC_CACHE;
                }).map(function (k) { return caches.delete(k); })
            );
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(
        caches.match(event.request).then(function (cached) {
            if (cached) return cached;
            return fetch(event.request).then(function (response) {
                if (!response || response.status !== 200 || response.type === "opaque") {
                    return response;
                }
                var copy = response.clone();
                caches.open(DYNAMIC_CACHE).then(function (cache) {
                    cache.put(event.request, copy);
                });
                return response;
            }).catch(function () {
                var accept = event.request.headers.get("accept");
                if (accept && accept.includes("text/html")) {
                    return caches.match("./offline.html");
                }
            });
        })
    );
});
