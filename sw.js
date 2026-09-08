
/* Service Worker — نسخة فاطمة المتطورة */
const CACHE = 'fatima-v2';
// تم إضافة icon.png وتأكيد الملفات الأساسية
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './icon.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => {
            // جلب الملفات الأساسية
            return cache.addAll(ASSETS).catch(err => {
                console.warn('Some assets failed to cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // تجاهل طلبات الخلفية أو الـ API
    if (e.request.method !== 'GET') return;
    if (e.request.url.includes('/api/')) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            const cacheResponse = cached || fetch(e.request).then(res => {
                if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
                    const clone = res.clone();
                    caches.open(CACHE).then(cache => {
                        cache.put(e.request, clone);
                    });
                }
                return res;
            }).catch(() => cached);
            
            return cacheResponse;
        })
    );
});
