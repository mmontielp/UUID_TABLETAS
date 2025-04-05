/* service-worker.js */
const CACHE_NAME = 'uuid-scanner-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos una coincidencia en la caché
                if (response) {
                    return response;
                }
                
                // Si no está en caché, lo fetcheamos
                return fetch(event.request).then(
                    response => {
                        // Si la respuesta no es válida, solo devolvemos la respuesta
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta
                        let responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});

// Limpiar cachés anteriores
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
