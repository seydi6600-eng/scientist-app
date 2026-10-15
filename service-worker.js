/* ============================================
   Service Worker — دانشمند
   v9.0.3 (bump version)
   ============================================ */

const CACHE_VERSION = "9.0.3";
const CACHE_NAME = "daneshmand-v" + CACHE_VERSION;

// فایل‌هایی که باید کش بشن
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./music.js",
    "./league.js",
    "./shop.js",
    "./manifest.json"
];

// ─── نصب: کش کردن فایل‌های جدید ───
self.addEventListener("install", function (event) {
    console.log("🔄 Service Worker installing v" + CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(STATIC_ASSETS).catch(function (err) {
                console.warn("⚠️ Some assets failed to cache:", err);
            });
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

// ─── فعال‌سازی: پاک کردن کش‌های قدیمی ───
self.addEventListener("activate", function (event) {
    console.log("✅ Service Worker activating v" + CACHE_VERSION);
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (name) {
                    if (name !== CACHE_NAME) {
                        console.log("🗑️ Deleting old cache:", name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

// ─── fetch: استراتژی Network First برای JS/HTML، Cache First برای بقیه ───
self.addEventListener("fetch", function (event) {
    const request = event.request;
    const url = new URL(request.url);

    // فقط درخواست‌های هم‌دامنه رو کش کن
    if (url.origin !== self.location.origin) {
        return;
    }

    // API requests → مستقیم از شبکه
    if (url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/auth") ||
        url.pathname.startsWith("/user") ||
        url.pathname.startsWith("/league") ||
        url.pathname.startsWith("/pvp") ||
        url.pathname.startsWith("/questions")) {
        return;
    }

    // فایل‌های JS، HTML، CSS → Network First (همیشه سعی کن از سرور بگیری)
    const isImportantFile = /\.(js|html|css)$/i.test(url.pathname) ||
                            url.pathname === "/" ||
                            url.pathname === "/index.html";

    if (isImportantFile) {
        event.respondWith(
            fetch(request)
                .then(function (response) {
                    // نسخه‌ی جدید رو از سرور گرفتی → کش رو آپدیت کن
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(function () {
                    // اگه آفلاین بودی → از کش بده
                    return caches.match(request);
                })
        );
        return;
    }

    // بقیه‌ی فایل‌ها (تصاویر، آیکون‌ها و...) → Cache First
    event.respondWith(
        caches.match(request).then(function (cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then(function (response) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(request, responseClone);
                });
                return response;
            });
        })
    );
});

// ─── پیام از سمت اپ: رد کردن فوری کش ───
self.addEventListener("message", function (event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
    if (event.data && event.data.type === "CLEAR_CACHE") {
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (name) { return caches.delete(name); })
            );
        }).then(function () {
            console.log("🗑️ All caches cleared");
        });
    }
});
