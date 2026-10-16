/* ============================================
   Service Worker — Self-Destruct
   این نسخه خودش رو حذف می‌کنه تا کش قدیمی پاک شه
   ============================================ */

self.addEventListener("install", (event) => {
    console.log("🔥 SW installing — will self-destruct");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("🔥 SW activating — destroying all caches");
    event.waitUntil(
        caches.keys()
            .then((names) => {
                return Promise.all(
                    names.map((n) => {
                        console.log("🗑 Deleting cache:", n);
                        return caches.delete(n);
                    })
                );
            })
            .then(() => {
                console.log("🗑 Unregistering SW");
                return self.registration.unregister();
            })
            .then(() => {
                return self.clients.matchAll({ type: "window" });
            })
            .then((clients) => {
                clients.forEach((c) => {
                    try { c.navigate(c.url); } catch (e) {}
                });
            })
    );
});

self.addEventListener("fetch", (event) => {
    // هیچ کشی، همه چیز مستقیم از شبکه
    event.respondWith(fetch(event.request));
});
