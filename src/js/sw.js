const CACHE_NAME = 'sheetfrenzy-v1';
const urlsToCache = [
    '/',
    './index.html',
    './src/css/styles.css',
    './src/js/scriptI.js',
    './src/js/scriptFunc.js',
    './favicon.ico',
    './src/img/200.png',
    './src/img/cb1-PhotoRoom.png',
    './src/img/cb2-PhotoRoom.png',
    './src/img/ccumber.png',
    './src/img/docs.png',
    './src/img/excel.png',
    './src/img/fav.png',
    './src/img/file.png',
    './src/img/footer1.png',
    './src/img/gherkin-b.png',
    './src/img/logoPage.png',
    './src/img/logoPage200.png',
    './src/img/play.png',
    './src/img/remove-folder.gif',
    './src/img/remove.png',
    './src/img/Sky.jpg',
    './src/img/slogo1.png',
    './src/img/slogo2.png',
    './src/img/uuui.jpg',
    './src/js/app.js',
    './src/js/charts.js',
    './src/js/contact.js',
    './src/js/scriptBlog.js',
    './src/js/scriptGerador.js',
    './src/js/scriptSwift.js',
    './src/js/sw.js'
];

// Instalando o Service Worker e cacheando os recursos
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Cache aberto');
                return Promise.all(
                    urlsToCache.map(url => {
                        return fetch(url).then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                            }
                            return cache.put(url, response);
                        }).catch(error => {
                            console.error(`Falha ao adicionar ${url} ao cache:`, error);
                        });
                    })
                );
            })
            .catch(function (error) {
                console.error('Falha ao abrir o cache:', error);
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
