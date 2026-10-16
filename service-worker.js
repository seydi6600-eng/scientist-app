/* ============================================
   Service Worker — Self-Destruct + No Cache
   نسخه کامل و تمیز
   ============================================ */

// هنگام نصب → فوراً فعال شو
self.addEventListener('install', (event) => {
    console.log('[SW] Installing... skipWaiting');
    self.skipWaiting();
});

// هنگام فعال شدن → همه کش‌ها رو پاک کن و خودت رو unregister کن
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating... destroying everything');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('[SW] Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
            .then(() => {
                console.log('[SW] Unregistering myself');
                return self.registration.unregister();
            })
            .then(() => {
                // همه تب‌های باز رو رفرش کن
                return self.clients.matchAll({ type: 'window' });
            })
            .then((clients) => {
                clients.forEach((client) => {
                    try {
                        client.navigate(client.url);
                    } catch (e) {
                        // ignore
                    }
                });
            })
    );
});

// هیچ fetch listener نداشته باش
// یعنی هیچ کشی انجام نمی‌شه و همه درخواست‌ها مستقیم از شبکه میرن
