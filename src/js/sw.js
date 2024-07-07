const CACHE_NAME = 'sheetfrenzy-v1';
const urlsToCache = [
    '/',
    './index.html',
    '/src/css/styles.css',
    '/src/js/app.js',
    '/src/img/logoPage200.png',
    '/src/img/logoPage.png'
];

// Instalando o Service Worker e cacheando os recursos
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptando as requisições de rede e servindo o conteúdo a partir do cache se disponível
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - retorna a resposta do cache
                if (response) {
                    return response;
                }

                // Clonar a requisição
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {
                        // Verifica se recebeu uma resposta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar a resposta
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Atualizando o Service Worker e limpando caches antigos
self.addEventListener('activate', function (event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
