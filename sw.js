const CACHE_NAME = "quiz-v5";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (event) {
    self.skipWating();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES);
        })
    );
});

self.addEventListener("activate" , function (event) {
    event.waitUntil(
        caches.keys().then(function (name) {
            return Promise.all(
                names
                .filter(function (name) { return name !== CACHE_NAME; })
                .map(function (name) { return caches.delete(name); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch",function(event) {
    event.respondWith(
        fetch(event.request.url, { cache: "no-cache" })
        .then(function (response) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, copy);
            });
            return response;
        })
        .catch(function () {
            return caches.match(event.request, {ignoreSearch: true }).then(function (cached) {
                return cached || caches.match("index.HTML");
            });
        })
    );
});